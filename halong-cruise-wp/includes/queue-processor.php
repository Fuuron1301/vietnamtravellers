<?php
if (!defined('ABSPATH')) {
    exit;
}

function hlt_sync_states(): array
{
    return ['clean', 'outdated', 'invalid', 'processing', 'failed'];
}

function hlt_set_sync_state(int $post_id, string $state, string $message = ''): void
{
    $allowed_states = hlt_sync_states();
    $safe_state = sanitize_key($state);

    if (!in_array($safe_state, $allowed_states, true)) {
        $safe_state = 'failed';
    }

    update_post_meta($post_id, '_hlt_sync_state', $safe_state);
    update_post_meta($post_id, '_hlt_sync_status', hlt_sync_state_to_validation_status($safe_state));
    update_post_meta($post_id, '_hlt_sync_message', sanitize_textarea_field($message));
    update_post_meta($post_id, '_hlt_last_sync_timestamp', current_time('mysql'));
}

function hlt_sync_state_to_validation_status(string $state): string
{
    switch ($state) {
        case 'clean':
            return 'synced';
        case 'outdated':
        case 'processing':
            return 'outdated';
        case 'invalid':
        case 'failed':
        default:
            return 'broken';
    }
}

function hlt_process_sync_queue(int $limit = 10): array
{
    $events = hlt_get_pending_sync_events($limit);
    $summary = [
        'processed' => 0,
        'clean' => 0,
        'invalid' => 0,
        'failed' => 0,
    ];

    foreach ($events as $event) {
        $summary['processed']++;

        $event_id = (int) ($event['id'] ?? 0);
        $entity_type = sanitize_key((string) ($event['entity_type'] ?? ''));
        $post_id = (int) ($event['entity_id'] ?? 0);
        $event_name = function_exists('hlt_normalize_event_name')
            ? hlt_normalize_event_name((string) ($event['event_name'] ?? ''))
            : sanitize_key(str_replace('.', '_', (string) ($event['event_name'] ?? '')));

        if (!function_exists('hlt_claim_sync_event') || !hlt_claim_sync_event($event_id)) {
            continue;
        }

        try {
            if ($entity_type !== 'tour') {
                hlt_update_sync_event($event_id, 'clean');
                $summary['clean']++;
                continue;
            }

            $post = get_post($post_id);
            if (!$post || $post->post_type !== 'hlt_tour') {
                if ($event_name === 'tour_deleted') {
                    hlt_update_sync_event($event_id, 'clean');
                    $summary['clean']++;
                    continue;
                }

                hlt_update_sync_event($event_id, 'invalid', 'Tour post missing or deleted');
                $summary['invalid']++;
                continue;
            }

            hlt_set_sync_state($post_id, 'processing');

            $validation = hlt_tour_store_validation($post_id);
            $validation_status = sanitize_key((string) ($validation['status'] ?? 'broken'));
            $score = (int) get_post_meta($post_id, '_hlt_content_score', true);
            if ($score <= 0 && isset($validation['content_score'])) {
                $score = (int) $validation['content_score'];
            }

            $workflow = function_exists('hlt_get_workflow_state') ? hlt_get_workflow_state($post_id) : 'draft';
            $is_public = in_array($workflow, ['approved', 'published'], true) && $score >= 85 && $validation_status === 'synced';

            if ($is_public) {
                $safe_payload = hlt_tour_safe_payload($post);
                update_post_meta($post_id, '_hlt_payload_hash', hlt_payload_hash($safe_payload));
                hlt_set_sync_state($post_id, 'clean');
                $revalidation_error = hlt_trigger_frontend_revalidation($post_id);
                if (is_wp_error($revalidation_error)) {
                    hlt_set_sync_state($post_id, 'failed', $revalidation_error->get_error_message());
                    hlt_update_sync_event($event_id, 'failed', $revalidation_error->get_error_message());
                    $summary['failed']++;
                    continue;
                }
                hlt_update_sync_event($event_id, 'clean');
                $summary['clean']++;
                continue;
            }

            $invalid_message = sprintf(
                'Blocked sync: workflow=%s, score=%d, validation=%s',
                $workflow,
                $score,
                $validation_status
            );
            hlt_set_sync_state($post_id, 'invalid', $invalid_message);
            hlt_update_sync_event($event_id, 'invalid', $invalid_message);
            $summary['invalid']++;
        } catch (Throwable $error) {
            if ($post_id > 0) {
                hlt_set_sync_state($post_id, 'failed', $error->getMessage());
            }
            hlt_update_sync_event($event_id, 'failed', $error->getMessage());
            $summary['failed']++;
        }
    }

    update_option('hlt_last_queue_summary', $summary);
    update_option('hlt_last_queue_processed_at', current_time('mysql'));

    return $summary;
}

function hlt_trigger_frontend_revalidation(int $post_id)
{
    $endpoint = (string) get_option('hlt_next_revalidation_url', '');
    $secret = (string) get_option('hlt_next_revalidation_secret', '');

    if ($endpoint === '' || $secret === '') {
        return null;
    }

    $post = get_post($post_id);
    if (!$post) {
        return new WP_Error('hlt_missing_revalidation_post', 'Cannot revalidate a missing tour post.');
    }

    $response = wp_remote_post(
        $endpoint,
        [
            'timeout' => 8,
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'body' => wp_json_encode([
                'secret' => $secret,
                'slug' => (string) $post->post_name,
                'type' => 'tour',
            ]),
        ]
    );

    if (is_wp_error($response)) {
        return $response;
    }

    $status_code = (int) wp_remote_retrieve_response_code($response);
    if ($status_code >= 400) {
        return new WP_Error('hlt_revalidation_failed', 'Next.js revalidation failed with HTTP ' . $status_code . '.');
    }

    return null;
}
