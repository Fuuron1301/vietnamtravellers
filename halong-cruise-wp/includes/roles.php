<?php
if (!defined('ABSPATH')) {
    exit;
}

function hlt_register_roles(): void
{
    add_role('hlt_sales', 'Sales', [
        'read' => true,
        'edit_hlt_leads' => true,
        'edit_hlt_bookings' => true,
        'upload_files' => true,
    ]);

    add_role('hlt_editor', 'Travel Editor', [
        'read' => true,
        'edit_posts' => true,
        'publish_posts' => true,
        'upload_files' => true,
        'edit_hlt_tours' => true,
        'edit_hlt_countries' => true,
        'edit_hlt_travel_styles' => true,
    ]);

    add_role('hlt_seo_specialist', 'SEO Specialist', [
        'read' => true,
        'edit_posts' => true,
        'upload_files' => true,
        'edit_hlt_tours' => true,
    ]);

    add_role('hlt_ai_validator', 'AI Validator', [
        'read' => true,
        'edit_posts' => true,
        'edit_hlt_tours' => true,
    ]);

    $role_caps = [
        'administrator' => ['hlt_transition_workflow', 'hlt_approve_workflow'],
        'hlt_editor' => ['hlt_transition_workflow'],
        'hlt_seo_specialist' => ['hlt_transition_workflow', 'hlt_approve_workflow'],
        'hlt_ai_validator' => ['hlt_transition_workflow'],
    ];

    foreach ($role_caps as $role_name => $caps) {
        $role = get_role($role_name);
        if (!$role) {
            continue;
        }
        foreach ($caps as $cap) {
            $role->add_cap($cap);
        }
    }
}
