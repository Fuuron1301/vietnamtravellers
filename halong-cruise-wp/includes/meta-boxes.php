<?php
if (!defined('ABSPATH')) {
    exit;
}

function hlt_register_meta_boxes(): void
{
    $content_types = ['hlt_country', 'hlt_tour', 'hlt_cruise', 'hlt_travel_style', 'post', 'page', 'hlt_testimonial'];
    foreach ($content_types as $type) {
        add_meta_box('hlt_seo_box', 'Headless SEO', 'hlt_render_seo_box', $type, 'normal', 'high');
        add_meta_box('hlt_content_box', 'Travel Content Data', 'hlt_render_content_box', $type, 'normal', 'default');
    }

    add_meta_box('hlt_lead_box', 'Lead Details', 'hlt_render_lead_box', 'hlt_lead', 'normal', 'high');
    add_meta_box('hlt_booking_box', 'Booking & Payment', 'hlt_render_booking_box', 'hlt_booking', 'normal', 'high');
}

function hlt_nonce_field(): void
{
    wp_nonce_field('hlt_save_meta', 'hlt_meta_nonce');
}

function hlt_text_input(int $post_id, string $key, string $label, string $type = 'text'): void
{
    $value = esc_attr(hlt_get_meta($post_id, $key));
    echo '<p><label><strong>' . esc_html($label) . '</strong></label><br />';
    echo '<input type="' . esc_attr($type) . '" name="' . esc_attr($key) . '" value="' . $value . '" class="widefat" /></p>';
}

function hlt_textarea(int $post_id, string $key, string $label, int $rows = 4): void
{
    $value = esc_textarea(hlt_get_meta($post_id, $key));
    echo '<p><label><strong>' . esc_html($label) . '</strong></label><br />';
    echo '<textarea name="' . esc_attr($key) . '" rows="' . esc_attr((string) $rows) . '" class="widefat code">' . $value . '</textarea></p>';
}

function hlt_can_edit_raw_json(): bool
{
    return current_user_can('manage_options');
}

function hlt_admin_json_notice(string $label): void
{
    echo '<p class="description"><strong>' . esc_html($label) . '</strong> is managed through guided fields. Raw JSON is hidden for non-admin users.</p>';
}

function hlt_render_seo_box(WP_Post $post): void
{
    hlt_nonce_field();
    hlt_text_input($post->ID, '_hlt_meta_title', 'Meta title');
    hlt_textarea($post->ID, '_hlt_meta_description', 'Meta description', 3);
    hlt_text_input($post->ID, '_hlt_focus_keyword', 'Focus keyword');
    hlt_text_input($post->ID, '_hlt_h1', 'Custom H1');
    hlt_text_input($post->ID, '_hlt_canonical_url', 'Canonical URL', 'url');
    hlt_text_input($post->ID, '_hlt_og_image', 'Open Graph image URL', 'url');
    hlt_text_input($post->ID, '_hlt_robots', 'Robots directive (index,follow or noindex,nofollow)');
    if (hlt_can_edit_raw_json()) {
        hlt_textarea($post->ID, '_hlt_schema_json', 'Schema JSON override', 8);
    } else {
        hlt_admin_json_notice('Schema override');
    }
    if (in_array($post->post_type, ['hlt_tour', 'hlt_cruise'], true)) {
        hlt_render_translation_inputs($post->ID);
    } else {
        if (hlt_can_edit_raw_json()) {
            hlt_textarea($post->ID, '_hlt_translations_json', 'Translations JSON: vi/en/zh slugs and fields', 8);
        } else {
            hlt_admin_json_notice('Translations');
        }
    }
}

function hlt_render_translation_inputs(int $post_id): void
{
    $translations = hlt_get_json_meta($post_id, '_hlt_translations_json');
    echo '<input type="hidden" name="_hlt_translations_json" value="' . esc_attr(hlt_get_meta($post_id, '_hlt_translations_json', '{}')) . '" data-json-key="_hlt_translations_json" />';
    echo '<h3>Language fields</h3>';
    foreach (['vi' => 'Vietnamese', 'en' => 'English', 'zh' => 'Chinese'] as $locale => $label) {
        $data = is_array($translations[$locale] ?? null) ? $translations[$locale] : [];
        echo '<fieldset class="hlt-language-fieldset" data-locale="' . esc_attr($locale) . '"><legend><strong>' . esc_html($label) . '</strong></legend>';
        foreach (['slug' => 'Slug', 'title' => 'Title', 'description' => 'Meta description'] as $field => $field_label) {
            echo '<p><label>' . esc_html($field_label) . '</label><br /><input class="widefat hlt-translation-field" data-field="' . esc_attr($field) . '" value="' . esc_attr((string) ($data[$field] ?? '')) . '" /></p>';
        }
        echo '</fieldset>';
    }
}

function hlt_render_content_box(WP_Post $post): void
{
    if (in_array($post->post_type, ['hlt_tour', 'hlt_cruise'], true)) {
        hlt_structured_editor($post);
        return;
    }

    if (hlt_can_edit_raw_json()) {
        hlt_textarea($post->ID, '_hlt_gallery_json', 'Gallery URLs, one per line', 5);
        hlt_textarea($post->ID, '_hlt_itinerary_json', 'Itinerary JSON array', 8);
        hlt_textarea($post->ID, '_hlt_faq_json', 'FAQ JSON array', 8);
        hlt_textarea($post->ID, '_hlt_pricing_json', 'Pricing JSON array', 5);
        hlt_textarea($post->ID, '_hlt_details_json', 'Details JSON: country, duration, style, includes, excludes, interests', 8);
    } else {
        hlt_admin_json_notice('Structured content');
    }
}

function hlt_structured_editor(WP_Post $post): void
{
    $is_cruise = $post->post_type === 'hlt_cruise';
    echo '<div class="hlt-structured-editor" data-post-type="' . esc_attr($post->post_type) . '">';
    hlt_hidden_json($post->ID, '_hlt_gallery_json');
    hlt_hidden_json($post->ID, '_hlt_itinerary_json');
    hlt_hidden_json($post->ID, '_hlt_pricing_json');
    hlt_hidden_json($post->ID, '_hlt_details_json');
    hlt_hidden_json($post->ID, '_hlt_faq_json');
    if ($is_cruise) {
        hlt_hidden_json($post->ID, '_hlt_cabin_types_json');
    }
    hlt_text_input($post->ID, '_hlt_route', $is_cruise ? 'Cruise route' : 'Primary route');
    hlt_structured_table('Gallery', '_hlt_gallery_json', ['url' => 'Image URL'], hlt_get_json_meta($post->ID, '_hlt_gallery_json'));
    if ($is_cruise) {
        hlt_structured_table('Cabin types', '_hlt_cabin_types_json', ['name' => 'Cabin name', 'size' => 'Size', 'occupancy' => 'Occupancy', 'price' => 'Price'], hlt_get_json_meta($post->ID, '_hlt_cabin_types_json'));
    }
    hlt_structured_table($is_cruise ? 'Cruise itinerary' : 'Itinerary', '_hlt_itinerary_json', ['day' => 'Day', 'title' => 'Title', 'body' => 'Description'], hlt_get_json_meta($post->ID, '_hlt_itinerary_json'));
    hlt_structured_table('Pricing tiers', '_hlt_pricing_json', ['tier' => 'Tier', 'price' => 'Price'], hlt_get_json_meta($post->ID, '_hlt_pricing_json'));
    $details = hlt_get_json_meta($post->ID, '_hlt_details_json');
    echo '<h3>Travel details</h3>';
    foreach (['country' => 'Country or destination', 'duration' => 'Duration', 'style' => 'Travel style', 'highlights' => 'Highlights, one per line', 'includes' => 'Included services, one per line', 'excludes' => 'Excluded services, one per line'] as $key => $label) {
        $value = $details[$key] ?? '';
        if (is_array($value)) {
            $value = implode("\n", $value);
        }
        echo '<p><label><strong>' . esc_html($label) . '</strong></label><br />';
        echo '<textarea class="widefat hlt-detail-field" data-detail-key="' . esc_attr($key) . '" rows="3">' . esc_textarea((string) $value) . '</textarea></p>';
    }
    echo '<div class="hlt-preview"><h3>Preview</h3><p class="description">Save or update to refresh the public preview data.</p><strong>' . esc_html(get_the_title($post)) . '</strong><p>' . esc_html(get_the_excerpt($post)) . '</p></div>';
    echo '</div>';
}

function hlt_hidden_json(int $post_id, string $key): void
{
    echo '<input type="hidden" name="' . esc_attr($key) . '" value="' . esc_attr(hlt_get_meta($post_id, $key, '[]')) . '" data-json-key="' . esc_attr($key) . '" />';
}

function hlt_structured_table(string $title, string $key, array $columns, array $rows): void
{
    echo '<div class="hlt-repeater" data-target="' . esc_attr($key) . '"><h3>' . esc_html($title) . '</h3><table class="widefat striped"><thead><tr>';
    foreach ($columns as $label) {
        echo '<th>' . esc_html((string) $label) . '</th>';
    }
    echo '<th>Action</th></tr></thead><tbody>';
    $rows = $rows ?: [[]];
    foreach ($rows as $row) {
        echo '<tr>';
        foreach ($columns as $field => $label) {
            $value = is_array($row) ? (string) ($row[$field] ?? '') : '';
            echo '<td><input class="widefat hlt-repeater-field" data-field="' . esc_attr((string) $field) . '" value="' . esc_attr($value) . '" /></td>';
        }
        echo '<td><button type="button" class="button hlt-remove-row">Remove</button></td></tr>';
    }
    echo '</tbody></table><p><button type="button" class="button hlt-add-row">Add row</button> ';
    if ($key === '_hlt_gallery_json') {
        echo '<button type="button" class="button hlt-media-gallery">Select images from Media Library</button>';
    }
    echo '</p></div>';
}

function hlt_render_lead_box(WP_Post $post): void
{
    hlt_nonce_field();
    foreach (['_hlt_lead_status' => 'Status (Hot/Warm/Cold)', '_hlt_assigned_sales' => 'Assigned sales', '_hlt_destination' => 'Destination', '_hlt_budget' => 'Budget', '_hlt_travel_dates' => 'Travel dates', '_hlt_travel_duration' => 'Travel duration', '_hlt_contact_email' => 'Email', '_hlt_contact_phone' => 'WhatsApp/Zalo', '_hlt_country' => 'Guest country'] as $key => $label) {
        hlt_text_input($post->ID, $key, $label);
    }
    if (hlt_can_edit_raw_json()) {
        hlt_textarea($post->ID, '_hlt_lead_payload_json', 'Full lead payload JSON', 10);
    }
}

function hlt_render_booking_box(WP_Post $post): void
{
    hlt_nonce_field();
    foreach (['_hlt_booking_id' => 'Booking ID', '_hlt_payment_method' => 'Payment method', '_hlt_payment_status' => 'Status', '_hlt_amount' => 'Amount', '_hlt_currency' => 'Currency', '_hlt_payment_url' => 'Payment URL', '_hlt_qr_payload' => 'VietQR payload'] as $key => $label) {
        hlt_text_input($post->ID, $key, $label);
    }
    if (hlt_can_edit_raw_json()) {
        hlt_textarea($post->ID, '_hlt_booking_payload_json', 'Full booking payload JSON', 10);
    }
}

function hlt_save_meta_boxes(int $post_id, WP_Post $post): void
{
    if (!isset($_POST['hlt_meta_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['hlt_meta_nonce'])), 'hlt_save_meta')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    $json_keys = ['_hlt_schema_json', '_hlt_translations_json', '_hlt_gallery_json', '_hlt_cabin_types_json', '_hlt_itinerary_json', '_hlt_faq_json', '_hlt_pricing_json', '_hlt_details_json', '_hlt_lead_payload_json', '_hlt_booking_payload_json'];
    $text_keys = ['_hlt_meta_title', '_hlt_meta_description', '_hlt_focus_keyword', '_hlt_h1', '_hlt_canonical_url', '_hlt_og_image', '_hlt_robots', '_hlt_route', '_hlt_lead_status', '_hlt_assigned_sales', '_hlt_destination', '_hlt_budget', '_hlt_travel_dates', '_hlt_travel_duration', '_hlt_contact_email', '_hlt_contact_phone', '_hlt_country', '_hlt_booking_id', '_hlt_payment_method', '_hlt_payment_status', '_hlt_amount', '_hlt_currency', '_hlt_payment_url', '_hlt_qr_payload'];

    foreach ($json_keys as $key) {
        if (isset($_POST[$key])) {
            update_post_meta($post_id, $key, hlt_sanitize_json_field(wp_unslash($_POST[$key])));
        }
    }
    foreach ($text_keys as $key) {
        if (isset($_POST[$key])) {
            update_post_meta($post_id, $key, sanitize_text_field(wp_unslash($_POST[$key])));
        }
    }
}
