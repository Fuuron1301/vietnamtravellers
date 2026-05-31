<?php
if (!defined('ABSPATH')) {
    exit;
}

function hlt_register_ai_intelligence_metabox(): void
{
    add_meta_box(
        'hlt_ai_intelligence',
        'AI Content Intelligence',
        'hlt_render_ai_intelligence_metabox',
        'hlt_tour',
        'side',
        'default'
    );
}

function hlt_render_ai_intelligence_metabox(WP_Post $post): void
{
    $post_id = (int) $post->ID;
    $score = (int) get_post_meta($post_id, '_hlt_content_score', true);
    $band_raw = sanitize_key((string) get_post_meta($post_id, '_hlt_content_score_band', true));
    $band_label = ucwords(str_replace('_', ' ', $band_raw ?: 'unknown'));
    $sync_state = sanitize_key((string) get_post_meta($post_id, '_hlt_sync_state', true));
    $suggestions_raw = (string) get_post_meta($post_id, '_hlt_ai_suggestions_json', true);
    $suggestions = json_decode($suggestions_raw, true);
    if (!is_array($suggestions)) {
        $suggestions = [];
    }

    $validate_url = wp_nonce_url(
        admin_url('admin-post.php?action=hlt_run_ai_validation&post_id=' . $post_id),
        'hlt_run_ai_validation_' . $post_id
    );

    echo '<div class="hlt-ai-intelligence">';
    echo '<p><strong>Content Score</strong><br />' . esc_html((string) $score) . '/100</p>';
    echo '<p><strong>Readiness</strong><br />' . esc_html($band_label) . '</p>';
    echo '<p><strong>Sync state</strong><br />' . esc_html($sync_state ?: 'unknown') . '</p>';

    if (!empty($suggestions)) {
        echo '<p><strong>Suggestions</strong></p><ul class="hlt-health-list">';
        foreach ($suggestions as $suggestion) {
            echo '<li>' . esc_html((string) $suggestion) . '</li>';
        }
        echo '</ul>';
    } else {
        echo '<p class="description">No AI suggestions yet. Run validation to generate fresh intelligence.</p>';
    }

    echo '<p><a class="button button-primary" href="' . esc_url($validate_url) . '">Run AI validation</a></p>';
    echo '</div>';
}

function hlt_handle_run_ai_validation(): void
{
    $post_id = (int) ($_GET['post_id'] ?? 0);
    if (!$post_id || get_post_type($post_id) !== 'hlt_tour' || !current_user_can('edit_post', $post_id)) {
        wp_die('Permission denied');
    }

    check_admin_referer('hlt_run_ai_validation_' . $post_id);
    hlt_tour_store_validation($post_id);

    if (function_exists('hlt_record_sync_event')) {
        hlt_record_sync_event('tour.updated', 'tour', $post_id, [
            'ai_validation' => true,
            'source' => 'ai_intelligence_panel',
            'idempotency_key' => 'ai_validation:' . $post_id . ':' . gmdate('YmdHi'),
        ]);
    }

    wp_safe_redirect(admin_url('post.php?action=edit&post=' . $post_id . '&hlt_ai_updated=1'));
    exit;
}
