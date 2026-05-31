<?php
if (!defined('ABSPATH')) {
    exit;
}

function hlt_register_post_types(): void
{
    $types = [
        'hlt_country' => ['Countries', 'Country', 'dashicons-location-alt', true],
        'hlt_tour' => ['Tours', 'Tour', 'dashicons-palmtree', true],
        'hlt_cruise' => ['Cruises', 'Cruise', 'dashicons-sos', true],
        'hlt_travel_style' => ['Travel Styles', 'Travel Style', 'dashicons-heart', true],
        'hlt_testimonial' => ['Testimonials', 'Testimonial', 'dashicons-format-quote', true],
        'hlt_lead' => ['Leads', 'Lead', 'dashicons-email-alt2', false],
        'hlt_booking' => ['Bookings', 'Booking', 'dashicons-tickets-alt', false],
    ];

    foreach ($types as $type => [$plural, $single, $icon, $public]) {
        register_post_type($type, [
            'labels' => [
                'name' => $plural,
                'singular_name' => $single,
                'add_new_item' => 'Add New ' . $single,
                'edit_item' => 'Edit ' . $single,
            ],
            'public' => $public,
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_rest' => true,
            'menu_icon' => $icon,
            'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'author'],
            'has_archive' => $public,
            'rewrite' => ['slug' => str_replace('hlt_', '', $type)],
        ]);
    }
}
