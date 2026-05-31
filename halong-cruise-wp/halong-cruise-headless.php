<?php
/**
 * Plugin Name: Ha Long Luxury Headless CMS
 * Description: WordPress admin CMS for a headless luxury tailor-made travel website.
 * Version: 1.0.0
 * Author: Ha Long Luxury Travel
 * Text Domain: hlt-headless
 */

if (!defined('ABSPATH')) {
    exit;
}

define('HLT_HEADLESS_VERSION', '1.0.0');
define('HLT_HEADLESS_PATH', plugin_dir_path(__FILE__));
define('HLT_HEADLESS_URL', plugin_dir_url(__FILE__));

require_once HLT_HEADLESS_PATH . 'includes/helpers.php';
require_once HLT_HEADLESS_PATH . 'includes/roles.php';
require_once HLT_HEADLESS_PATH . 'includes/post-types.php';
require_once HLT_HEADLESS_PATH . 'includes/meta-boxes.php';
require_once HLT_HEADLESS_PATH . 'includes/ai-governance.php';
require_once HLT_HEADLESS_PATH . 'includes/tour-validation.php';
require_once HLT_HEADLESS_PATH . 'includes/sync-status.php';
require_once HLT_HEADLESS_PATH . 'includes/event-store.php';
require_once HLT_HEADLESS_PATH . 'includes/workflow.php';
require_once HLT_HEADLESS_PATH . 'includes/queue-processor.php';
require_once HLT_HEADLESS_PATH . 'includes/admin-tour-health.php';
require_once HLT_HEADLESS_PATH . 'includes/admin-intelligence.php';
require_once HLT_HEADLESS_PATH . 'includes/bulk-actions.php';
require_once HLT_HEADLESS_PATH . 'includes/rest-api.php';
require_once HLT_HEADLESS_PATH . 'includes/admin-leads.php';
require_once HLT_HEADLESS_PATH . 'includes/settings.php';

register_activation_hook(__FILE__, 'hlt_headless_activate');
function hlt_headless_activate(): void
{
    hlt_register_roles();
    hlt_register_post_types();
    hlt_create_event_table();
    hlt_schedule_sync_validation();
    if (!wp_next_scheduled('hlt_process_sync_queue_event')) {
        wp_schedule_event(time() + 300, 'hourly', 'hlt_process_sync_queue_event');
    }
    flush_rewrite_rules();
}

register_deactivation_hook(__FILE__, function (): void {
    hlt_clear_sync_validation();
    wp_clear_scheduled_hook('hlt_process_sync_queue_event');
    flush_rewrite_rules();
});

add_action('init', 'hlt_register_post_types');
add_action('init', 'hlt_register_roles');
add_action('init', 'hlt_maybe_upgrade_event_table');
add_action('add_meta_boxes', 'hlt_register_meta_boxes');
add_action('add_meta_boxes', 'hlt_register_tour_health_metabox');
add_action('add_meta_boxes', 'hlt_register_workflow_metabox');
add_action('add_meta_boxes', 'hlt_register_ai_intelligence_metabox');
add_action('save_post', 'hlt_save_meta_boxes', 10, 2);
add_action('save_post_hlt_tour', 'hlt_save_workflow_state', 12, 2);
add_action('save_post_hlt_tour', 'hlt_tour_store_validation', 20);
add_action('save_post', 'hlt_record_tour_change_event', 30, 3);
add_action('before_delete_post', 'hlt_record_tour_delete_event');
add_action('rest_api_init', 'hlt_register_rest_routes');
add_action('admin_init', 'hlt_register_travel_os_settings');
add_action('admin_menu', 'hlt_register_leads_export_page');
add_action('admin_menu', 'hlt_register_settings_page');
add_action('admin_post_hlt_export_leads_csv', 'hlt_export_leads_csv');
add_action('hlt_validate_tours_event', 'hlt_validate_all_tours');
add_action('hlt_process_sync_queue_event', 'hlt_process_sync_queue');
add_action('admin_enqueue_scripts', 'hlt_admin_enqueue_health_assets');
add_filter('manage_hlt_tour_posts_columns', 'hlt_tour_admin_columns');
add_action('manage_hlt_tour_posts_custom_column', 'hlt_render_tour_admin_column', 10, 2);
add_action('restrict_manage_posts', 'hlt_tour_admin_filters');
add_action('pre_get_posts', 'hlt_filter_tour_admin_query');
add_filter('bulk_actions-edit-hlt_tour', 'hlt_register_tour_bulk_actions');
add_filter('handle_bulk_actions-edit-hlt_tour', 'hlt_handle_tour_bulk_actions', 10, 3);
add_action('admin_notices', 'hlt_tour_bulk_admin_notice');
add_action('admin_post_hlt_validate_tour', 'hlt_handle_single_tour_action');
add_action('admin_post_hlt_autofill_tour', 'hlt_handle_single_tour_action');
add_action('admin_post_hlt_generate_tour_seo', 'hlt_handle_single_tour_action');
add_action('admin_post_hlt_duplicate_localized_tour', 'hlt_handle_single_tour_action');
add_action('admin_post_hlt_run_ai_validation', 'hlt_handle_run_ai_validation');
