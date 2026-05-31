<?php
if (!defined('ABSPATH')) {
    exit;
}

function hlt_event_table_name(): string
{
    global $wpdb;

    return $wpdb->prefix . 'hlt_sync_events';
}

function hlt_create_event_table(): void
{
    global $wpdb;

    $table_name = hlt_event_table_name();
    $charset_collate = $wpdb->get_charset_collate();

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';

    $sql = "CREATE TABLE {$table_name} (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        event_name varchar(191) NOT NULL,
        entity_type varchar(100) NOT NULL,
        entity_id bigint(20) unsigned NOT NULL,
        payload_hash char(64) NOT NULL,
        status varchar(20) NOT NULL DEFAULT 'pending',
        retry_count int(10) unsigned NOT NULL DEFAULT 0,
        error_message text NOT NULL,
        actor_id bigint(20) unsigned NOT NULL DEFAULT 0,
        created_at datetime NOT NULL,
        processed_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY event_dedupe (event_name, entity_type, entity_id, payload_hash),
        KEY status_created (status, created_at),
        KEY entity_lookup (entity_type, entity_id)
    ) {$charset_collate};";

    dbDelta($sql);
}

function hlt_maybe_upgrade_event_table(): void
{
    $schema_version = '20260503_event_dedupe';
    if (get_option('hlt_event_store_schema_version') === $schema_version && hlt_event_dedupe_index_exists()) {
        return;
    }

    hlt_create_event_table();
    if (hlt_event_dedupe_index_exists()) {
        update_option('hlt_event_store_schema_version', $schema_version);
    }
}

function hlt_event_dedupe_index_exists(): bool
{
    global $wpdb;

    $count = (int) $wpdb->get_var(
        $wpdb->prepare(
            'SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = %s AND index_name = %s',
            hlt_event_table_name(),
            'event_dedupe'
        )
    );

    return $count > 0;
}

function hlt_payload_hash(array $payload): string
{
    $json_payload = wp_json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (!is_string($json_payload)) {
        $json_payload = '{}';
    }

    return hash('sha256', $json_payload);
}

function hlt_normalize_event_name(string $event_name): string
{
    return sanitize_key(str_replace('.', '_', $event_name));
}

function hlt_record_sync_event(string $event_name, string $entity_type, int $entity_id, array $payload = []): int
{
    global $wpdb;

    $table_name = hlt_event_table_name();
    $normalized_event_name = hlt_normalize_event_name($event_name);
    $payload_hash = hlt_payload_hash($payload);
    $safe_entity_type = sanitize_key($entity_type);
    $existing_id = hlt_find_sync_event_id($normalized_event_name, $safe_entity_type, $entity_id, $payload_hash);

    if ($existing_id > 0) {
        return $existing_id;
    }

    $result = $wpdb->insert(
        $table_name,
        [
            'event_name' => $normalized_event_name,
            'entity_type' => $safe_entity_type,
            'entity_id' => $entity_id,
            'payload_hash' => $payload_hash,
            'status' => 'pending',
            'retry_count' => 0,
            'error_message' => '',
            'actor_id' => get_current_user_id(),
            'created_at' => current_time('mysql'),
            'processed_at' => null,
        ],
        [
            '%s',
            '%s',
            '%d',
            '%s',
            '%s',
            '%d',
            '%s',
            '%d',
            '%s',
            '%s',
        ]
    );

    if ($result === false) {
        return hlt_find_sync_event_id($normalized_event_name, $safe_entity_type, $entity_id, $payload_hash);
    }

    return (int) $wpdb->insert_id;
}

function hlt_find_sync_event_id(string $event_name, string $entity_type, int $entity_id, string $payload_hash): int
{
    global $wpdb;

    return (int) $wpdb->get_var(
        $wpdb->prepare(
            'SELECT id FROM ' . hlt_event_table_name() . ' WHERE event_name = %s AND entity_type = %s AND entity_id = %d AND payload_hash = %s ORDER BY id DESC LIMIT 1',
            $event_name,
            $entity_type,
            $entity_id,
            $payload_hash
        )
    );
}

function hlt_get_pending_sync_events(int $limit = 10): array
{
    global $wpdb;

    $table_name = hlt_event_table_name();
    $safe_limit = max(1, $limit);

    $sql = $wpdb->prepare(
        "SELECT * FROM {$table_name} WHERE status = %s ORDER BY created_at ASC LIMIT %d",
        'pending',
        $safe_limit
    );

    $results = $wpdb->get_results($sql, ARRAY_A);

    return is_array($results) ? $results : [];
}

function hlt_claim_sync_event(int $event_id): bool
{
    global $wpdb;

    $updated = $wpdb->update(
        hlt_event_table_name(),
        ['status' => 'processing'],
        ['id' => $event_id, 'status' => 'pending'],
        ['%s'],
        ['%d', '%s']
    );

    return $updated === 1;
}

function hlt_update_sync_event(int $event_id, string $status, string $error_message = ''): void
{
    global $wpdb;

    $table_name = hlt_event_table_name();
    $status = sanitize_key($status);
    $data = [
        'status' => $status,
        'error_message' => sanitize_textarea_field($error_message),
    ];
    $format = ['%s', '%s'];

    if (in_array($status, ['clean', 'invalid', 'failed'], true)) {
        $data['processed_at'] = current_time('mysql');
        $format[] = '%s';
    }

    $wpdb->update($table_name, $data, ['id' => $event_id], $format, ['%d']);
}
