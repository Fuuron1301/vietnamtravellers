<?php
if (!defined('ABSPATH')) {
    exit;
}

function hlt_array_get(array $data, string $key, $default = '')
{
    return isset($data[$key]) ? $data[$key] : $default;
}

function hlt_sanitize_json_field($value): string
{
    if (is_array($value)) {
        return wp_json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    $decoded = json_decode((string) $value, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        return wp_json_encode($decoded, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    return sanitize_textarea_field((string) $value);
}

function hlt_get_meta(int $post_id, string $key, $default = '')
{
    $value = get_post_meta($post_id, $key, true);
    return $value === '' ? $default : $value;
}

function hlt_get_json_meta(int $post_id, string $key): array
{
    $raw = hlt_get_meta($post_id, $key, '[]');
    $decoded = json_decode((string) $raw, true);
    return is_array($decoded) ? $decoded : [];
}

function hlt_rest_post_payload(WP_Post $post): array
{
    $image_id = get_post_thumbnail_id($post->ID);
    return [
        'id' => $post->ID,
        'type' => $post->post_type,
        'title' => get_the_title($post),
        'slug' => $post->post_name,
        'excerpt' => get_the_excerpt($post),
        'content' => apply_filters('the_content', $post->post_content),
        'featuredImage' => $image_id ? wp_get_attachment_image_url($image_id, 'full') : '',
        'meta' => [
            'seo' => [
                'title' => hlt_get_meta($post->ID, '_hlt_meta_title'),
                'description' => hlt_get_meta($post->ID, '_hlt_meta_description'),
                'focusKeyword' => hlt_get_meta($post->ID, '_hlt_focus_keyword'),
                'h1' => hlt_get_meta($post->ID, '_hlt_h1'),
                'canonical' => hlt_get_meta($post->ID, '_hlt_canonical_url'),
                'ogImage' => hlt_get_meta($post->ID, '_hlt_og_image'),
                'robots' => hlt_get_meta($post->ID, '_hlt_robots', 'index,follow'),
                'schema' => hlt_get_json_meta($post->ID, '_hlt_schema_json'),
            ],
            'translations' => hlt_get_json_meta($post->ID, '_hlt_translations_json'),
            'gallery' => hlt_get_json_meta($post->ID, '_hlt_gallery_json'),
            'cabins' => hlt_get_json_meta($post->ID, '_hlt_cabin_types_json'),
            'itinerary' => hlt_get_json_meta($post->ID, '_hlt_itinerary_json'),
            'faq' => hlt_get_json_meta($post->ID, '_hlt_faq_json'),
            'pricing' => hlt_get_json_meta($post->ID, '_hlt_pricing_json'),
            'details' => hlt_get_json_meta($post->ID, '_hlt_details_json'),
        ],
    ];
}
