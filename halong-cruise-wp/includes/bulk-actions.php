<?php
if (!defined('ABSPATH')) {
    exit;
}

function hlt_register_tour_bulk_actions(array $actions): array
{
    $actions['hlt_bulk_validate'] = 'Validate tours';
    $actions['hlt_bulk_sync'] = 'Sync status refresh';
    $actions['hlt_bulk_seo'] = 'Generate SEO suggestions';
    $actions['hlt_bulk_translation_check'] = 'Check translations';
    $actions['hlt_bulk_ai_validation'] = 'Run AI validation';
    $actions['hlt_bulk_sync_repair'] = 'Repair sync drift';
    return $actions;
}

function hlt_handle_tour_bulk_actions(string $redirect_to, string $action, array $post_ids): string
{
    if (!in_array($action, ['hlt_bulk_validate', 'hlt_bulk_sync', 'hlt_bulk_seo', 'hlt_bulk_translation_check', 'hlt_bulk_ai_validation', 'hlt_bulk_sync_repair'], true)) {
        return $redirect_to;
    }
    $count = 0;
    foreach ($post_ids as $post_id) {
        $post_id = (int) $post_id;
        if (get_post_type($post_id) !== 'hlt_tour' || !current_user_can('edit_post', $post_id)) {
            continue;
        }
        if ($action === 'hlt_bulk_seo') {
            hlt_generate_tour_seo_suggestion((int) $post_id);
        }
        hlt_tour_store_validation((int) $post_id);
        if (in_array($action, ['hlt_bulk_ai_validation', 'hlt_bulk_sync_repair'], true) && function_exists('hlt_record_sync_event')) {
            hlt_record_sync_event('tour.updated', 'tour', $post_id, [
                'bulk_action' => $action,
                'source' => 'bulk_action',
                'idempotency_key' => $action . ':' . $post_id . ':' . gmdate('YmdHi'),
            ]);
        }
        $count++;
    }
    return add_query_arg(['hlt_bulk_done' => $action, 'hlt_bulk_count' => $count], $redirect_to);
}

function hlt_tour_bulk_admin_notice(): void
{
    if (empty($_GET['hlt_bulk_done'])) {
        return;
    }
    $count = (int) ($_GET['hlt_bulk_count'] ?? 0);
    echo '<div class="notice notice-success is-dismissible"><p>' . esc_html((string) $count) . ' tour(s) processed by data governance.</p></div>';
}

function hlt_generate_tour_seo_suggestion(int $post_id): void
{
    $post = get_post($post_id);
    if (!$post) {
        return;
    }
    $details = hlt_tour_read_details($post_id);
    $country = (string) ($details['country'] ?? 'Southeast Asia');
    $duration = (string) ($details['duration'] ?? 'Tailor-made');
    if (!hlt_get_meta($post_id, '_hlt_meta_title')) {
        update_post_meta($post_id, '_hlt_meta_title', substr($post->post_title . ' | Private ' . $country . ' Tour', 0, 60));
    }
    if (!hlt_get_meta($post_id, '_hlt_meta_description')) {
        $description = 'Plan ' . $post->post_title . ', a private ' . $duration . ' luxury journey in ' . $country . ' with curated hotels, guides and tailor-made support.';
        update_post_meta($post_id, '_hlt_meta_description', substr($description, 0, 160));
    }
    if (!hlt_get_meta($post_id, '_hlt_h1')) {
        update_post_meta($post_id, '_hlt_h1', $post->post_title);
    }
}

function hlt_autofill_tour_missing_fields(int $post_id): void
{
    $details = hlt_tour_read_details($post_id);
    $details = array_merge([
        'country' => 'multi-country',
        'duration' => 'Tailor-made',
        'highlights' => ['Private tailor-made journey'],
        'includes' => ['Private consultation'],
        'excludes' => ['International flights'],
        'private_group_flag' => true,
    ], $details);
    update_post_meta($post_id, '_hlt_details_json', wp_json_encode($details, JSON_UNESCAPED_UNICODE));
    if (!hlt_get_meta($post_id, '_hlt_pricing_json')) {
        update_post_meta($post_id, '_hlt_pricing_json', wp_json_encode([['tier' => 'Tailor-made', 'price' => 'Price on request']], JSON_UNESCAPED_UNICODE));
    }
    if (!hlt_get_meta($post_id, '_hlt_itinerary_json')) {
        update_post_meta($post_id, '_hlt_itinerary_json', wp_json_encode([['day' => 'Day 1', 'title' => 'Tailor-made start', 'body' => 'Your travel designer will customize this day.']], JSON_UNESCAPED_UNICODE));
    }
    hlt_generate_tour_seo_suggestion($post_id);
    hlt_tour_store_validation($post_id);
}

function hlt_handle_single_tour_action(): void
{
    $action = sanitize_key((string) ($_GET['action'] ?? ''));
    $post_id = (int) ($_GET['post_id'] ?? 0);
    if (!$post_id || get_post_type($post_id) !== 'hlt_tour' || !current_user_can('edit_post', $post_id)) {
        wp_die('Permission denied');
    }
    if ($action === 'hlt_validate_tour') {
        check_admin_referer('hlt_validate_tour_' . $post_id);
        hlt_tour_store_validation($post_id);
    } elseif ($action === 'hlt_autofill_tour') {
        check_admin_referer('hlt_autofill_tour_' . $post_id);
        hlt_autofill_tour_missing_fields($post_id);
    } elseif ($action === 'hlt_generate_tour_seo') {
        check_admin_referer('hlt_generate_tour_seo_' . $post_id);
        hlt_generate_tour_seo_suggestion($post_id);
        hlt_tour_store_validation($post_id);
    } elseif ($action === 'hlt_duplicate_localized_tour') {
        check_admin_referer('hlt_duplicate_localized_tour_' . $post_id);
        $new_id = hlt_duplicate_tour_localized($post_id);
        if ($new_id <= 0) {
            wp_safe_redirect(admin_url('post.php?action=edit&post=' . $post_id . '&hlt_duplicate_failed=1'));
            exit;
        }
        wp_safe_redirect(admin_url('post.php?action=edit&post=' . $new_id));
        exit;
    }
    wp_safe_redirect(admin_url('post.php?action=edit&post=' . $post_id . '&hlt_health_updated=1'));
    exit;
}

function hlt_duplicate_tour_localized(int $post_id): int
{
    $post = get_post($post_id);
    if (!$post) {
        return 0;
    }
    $new_id = wp_insert_post([
        'post_type' => 'hlt_tour',
        'post_status' => 'draft',
        'post_title' => $post->post_title . ' (localized copy)',
        'post_content' => $post->post_content,
        'post_excerpt' => $post->post_excerpt,
    ], true);
    if (is_wp_error($new_id) || (int) $new_id <= 0) {
        return 0;
    }
    $new_id = (int) $new_id;
    foreach (get_post_meta($post_id) as $key => $values) {
        foreach ($values as $value) {
            update_post_meta($new_id, $key, maybe_unserialize($value));
        }
    }
    hlt_tour_store_validation($new_id);
    return $new_id;
}
