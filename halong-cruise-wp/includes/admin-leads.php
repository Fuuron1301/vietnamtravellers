<?php
if (!defined('ABSPATH')) {
    exit;
}

function hlt_register_leads_export_page(): void
{
    add_submenu_page(
        'edit.php?post_type=hlt_lead',
        'Export Leads CSV',
        'Export CSV',
        'edit_posts',
        'hlt-export-leads',
        'hlt_render_leads_export_page'
    );
}

function hlt_render_leads_export_page(): void
{
    $url = wp_nonce_url(admin_url('admin-post.php?action=hlt_export_leads_csv'), 'hlt_export_leads_csv');
    echo '<div class="wrap"><h1>Export Leads CSV</h1><p>Download all inquiries for sales follow-up.</p>';
    echo '<a class="button button-primary" href="' . esc_url($url) . '">Download CSV</a></div>';
}

function hlt_export_leads_csv(): void
{
    if (!current_user_can('edit_posts')) {
        wp_die('Permission denied');
    }
    check_admin_referer('hlt_export_leads_csv');

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=hlt-leads-' . gmdate('Y-m-d') . '.csv');

    $out = fopen('php://output', 'w');
    fputcsv($out, ['ID', 'Name', 'Email', 'Phone', 'Destination', 'Budget', 'Dates', 'Duration', 'Status', 'Assigned Sales', 'Created']);

    $query = new WP_Query([
        'post_type' => 'hlt_lead',
        'post_status' => ['publish', 'pending', 'draft'],
        'posts_per_page' => -1,
        'orderby' => 'date',
        'order' => 'DESC',
    ]);

    foreach ($query->posts as $lead) {
        fputcsv($out, [
            $lead->ID,
            $lead->post_title,
            hlt_get_meta($lead->ID, '_hlt_contact_email'),
            hlt_get_meta($lead->ID, '_hlt_contact_phone'),
            hlt_get_meta($lead->ID, '_hlt_destination'),
            hlt_get_meta($lead->ID, '_hlt_budget'),
            hlt_get_meta($lead->ID, '_hlt_travel_dates'),
            hlt_get_meta($lead->ID, '_hlt_travel_duration'),
            hlt_get_meta($lead->ID, '_hlt_lead_status'),
            hlt_get_meta($lead->ID, '_hlt_assigned_sales'),
            $lead->post_date,
        ]);
    }
    fclose($out);
    exit;
}
