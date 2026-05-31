<?php
if (!defined('ABSPATH')) {
    exit;
}

function hlt_schedule_sync_validation(): void
{
    if (!wp_next_scheduled('hlt_validate_tours_event')) {
        wp_schedule_event(time() + HOUR_IN_SECONDS, 'hourly', 'hlt_validate_tours_event');
    }
}

function hlt_clear_sync_validation(): void
{
    wp_clear_scheduled_hook('hlt_validate_tours_event');
}

function hlt_validate_all_tours(int $limit = 100): array
{
    $query = new WP_Query([
        'post_type' => 'hlt_tour',
        'post_status' => ['publish', 'draft', 'pending', 'future', 'private'],
        'posts_per_page' => $limit,
        'fields' => 'ids',
    ]);
    $summary = ['synced' => 0, 'partial' => 0, 'broken' => 0, 'outdated' => 0];
    foreach ($query->posts as $post_id) {
        $result = hlt_tour_store_validation((int) $post_id);
        $status = (string) ($result['status'] ?? 'broken');
        $summary[$status] = ($summary[$status] ?? 0) + 1;
    }
    update_option('hlt_last_bulk_validation_at', current_time('mysql'));
    update_option('hlt_last_bulk_validation_summary', $summary);
    return $summary;
}

function hlt_mark_tour_outdated(int $post_id, WP_Post $post): void
{
    if ($post->post_type !== 'hlt_tour') {
        return;
    }
    if (function_exists('hlt_set_sync_state')) {
        hlt_set_sync_state($post_id, 'outdated');
    } else {
        update_post_meta($post_id, '_hlt_sync_status', 'outdated');
    }
    hlt_tour_store_validation($post_id);
}

function hlt_record_tour_change_event(int $post_id, WP_Post $post, bool $update): void
{
    if ($post->post_type !== 'hlt_tour' || wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
        return;
    }

    if (function_exists('hlt_set_sync_state')) {
        hlt_set_sync_state($post_id, 'outdated');
    } else {
        update_post_meta($post_id, '_hlt_sync_state', 'outdated');
        update_post_meta($post_id, '_hlt_sync_status', 'outdated');
    }

    if (!function_exists('hlt_record_sync_event')) {
        return;
    }

    hlt_record_sync_event(
        $update ? 'tour.updated' : 'tour.created',
        'tour',
        $post_id,
        [
            'post_modified' => get_post_modified_time('c', false, $post),
        ]
    );
}

function hlt_record_tour_delete_event(int $post_id): void
{
    $post = get_post($post_id);
    if (!$post || $post->post_type !== 'hlt_tour') {
        return;
    }

    if (!function_exists('hlt_record_sync_event')) {
        return;
    }

    hlt_record_sync_event(
        'tour.deleted',
        'tour',
        $post_id,
        [
            'deleted_at' => current_time('c'),
        ]
    );
}

function hlt_sync_status_label(string $status): string
{
    switch ($status) {
        case 'synced':
            return 'Synced';
        case 'partial':
            return 'Partial';
        case 'outdated':
            return 'Outdated';
        default:
            return 'Broken';
    }
}

function hlt_sync_status_color(string $status): string
{
    switch ($status) {
        case 'synced':
            return '#00a32a';
        case 'partial':
        case 'outdated':
            return '#dba617';
        default:
            return '#d63638';
    }
}
