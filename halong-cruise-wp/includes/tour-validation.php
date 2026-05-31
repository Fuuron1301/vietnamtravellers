<?php
if (!defined('ABSPATH')) {
    exit;
}

function hlt_tour_required_schema(): array
{
    return [
        'title' => 'Title',
        'slug' => 'Slug',
        'country' => 'Country',
        'duration' => 'Duration',
        'price_range' => 'Price range',
        'itinerary' => 'Itinerary days',
        'highlights' => 'Highlights',
        'includes' => 'Includes',
        'excludes' => 'Excludes',
        'gallery' => 'Gallery',
        'seo_title' => 'SEO title',
        'seo_description' => 'SEO description',
        'translation_vi' => 'Vietnamese translation',
        'translation_en' => 'English translation',
        'translation_zh' => 'Chinese translation',
    ];
}

function hlt_tour_empty($value): bool
{
    if (is_array($value)) {
        return count(array_filter($value, static fn($item) => !hlt_tour_empty($item))) === 0;
    }
    return trim((string) $value) === '';
}

function hlt_tour_read_details(int $post_id): array
{
    $details = hlt_get_json_meta($post_id, '_hlt_details_json');
    return is_array($details) ? $details : [];
}

function hlt_tour_price_range(int $post_id): string
{
    $pricing = hlt_get_json_meta($post_id, '_hlt_pricing_json');
    if (isset($pricing[0]['price'])) {
        return (string) $pricing[0]['price'];
    }
    $details = hlt_tour_read_details($post_id);
    return (string) ($details['priceRange'] ?? $details['price_range'] ?? '');
}

function hlt_tour_language_complete(array $translations, string $locale): bool
{
    $entry = $translations[$locale] ?? null;
    if (!is_array($entry)) {
        return false;
    }
    return !hlt_tour_empty($entry['title'] ?? '') && !hlt_tour_empty($entry['slug'] ?? '') && !hlt_tour_empty($entry['excerpt'] ?? $entry['description'] ?? '');
}

function hlt_validate_image_url(string $url): bool
{
    if (trim($url) === '') {
        return false;
    }
    if (strpos($url, 'http://') === 0 || strpos($url, 'https://') === 0) {
        return (bool) filter_var($url, FILTER_VALIDATE_URL);
    }
    return false;
}

function hlt_tour_validate(int $post_id): array
{
    $post = get_post($post_id);
    if (!$post || $post->post_type !== 'hlt_tour') {
        return ['status' => 'broken', 'completion' => 0, 'missing' => ['Tour post'], 'warnings' => ['Invalid tour post']];
    }

    $details = hlt_tour_read_details($post_id);
    $gallery = hlt_get_json_meta($post_id, '_hlt_gallery_json');
    $itinerary = hlt_get_json_meta($post_id, '_hlt_itinerary_json');
    $faq = hlt_get_json_meta($post_id, '_hlt_faq_json');
    $translations = hlt_get_json_meta($post_id, '_hlt_translations_json');
    $gallery = is_array($gallery) ? $gallery : [];
    $itinerary = is_array($itinerary) ? $itinerary : [];
    $faq = is_array($faq) ? $faq : [];
    $translations = is_array($translations) ? $translations : [];
    $seo_title = (string) hlt_get_meta($post_id, '_hlt_meta_title');
    $seo_description = (string) hlt_get_meta($post_id, '_hlt_meta_description');
    $h1 = (string) hlt_get_meta($post_id, '_hlt_h1');

    $values = [
        'title' => $post->post_title,
        'slug' => $post->post_name,
        'country' => $details['country'] ?? '',
        'duration' => $details['duration'] ?? '',
        'price_range' => hlt_tour_price_range($post_id),
        'itinerary' => $itinerary,
        'highlights' => $details['highlights'] ?? [],
        'includes' => $details['includes'] ?? [],
        'excludes' => $details['excludes'] ?? [],
        'gallery' => $gallery,
        'seo_title' => $seo_title,
        'seo_description' => $seo_description,
        'translation_vi' => hlt_tour_language_complete($translations, 'vi') ? 'ok' : '',
        'translation_en' => hlt_tour_language_complete($translations, 'en') ? 'ok' : '',
        'translation_zh' => hlt_tour_language_complete($translations, 'zh') ? 'ok' : '',
    ];

    $missing = [];
    foreach (hlt_tour_required_schema() as $key => $label) {
        if (hlt_tour_empty($values[$key] ?? '')) {
            $missing[] = $label;
        }
    }

    $warnings = [];
    foreach ($itinerary as $index => $day) {
        if (!is_array($day) || hlt_tour_empty($day['title'] ?? '') || hlt_tour_empty($day['body'] ?? '')) {
            $warnings[] = 'Itinerary day ' . ($index + 1) . ' is incomplete';
        }
    }
    foreach ($gallery as $index => $url) {
        if (!hlt_validate_image_url((string) $url)) {
            $warnings[] = 'Gallery image ' . ($index + 1) . ' has invalid URL';
        }
    }

    $seo_score = 0;
    $seo_checks = [
        strlen($seo_title) >= 50 && strlen($seo_title) <= 60,
        strlen($seo_description) >= 140 && strlen($seo_description) <= 160,
        (bool) preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $post->post_name),
        !hlt_tour_empty($h1 ?: $post->post_title),
        count($gallery) > 0,
        count($faq) > 0,
    ];
    foreach ($seo_checks as $check) {
        if ($check) {
            $seo_score += (int) floor(100 / count($seo_checks));
        }
    }
    $seo_score = min(100, $seo_score);

    $required_total = count(hlt_tour_required_schema());
    $completion = (int) round((($required_total - count($missing)) / max(1, $required_total)) * 100);

    $status = 'synced';
    if (count($missing) > 0) {
        $status = $completion >= 70 ? 'partial' : 'broken';
    }
    if (count($warnings) > 0 && $status === 'synced') {
        $status = 'partial';
    }

    return [
        'status' => $status,
        'completion' => $completion,
        'seo_score' => $seo_score,
        'missing' => $missing,
        'missing_count' => count($missing),
        'warnings' => $warnings,
        'language_status' => [
            'vi' => hlt_tour_language_complete($translations, 'vi'),
            'en' => hlt_tour_language_complete($translations, 'en'),
            'zh' => hlt_tour_language_complete($translations, 'zh'),
        ],
        'validated_at' => current_time('mysql'),
        'updated_at' => get_post_modified_time('c', false, $post),
    ];
}

function hlt_tour_store_validation(int $post_id): array
{
    $result = hlt_tour_validate($post_id);
    if (function_exists('hlt_ai_store_tour_evaluation')) {
        $evaluation = hlt_ai_store_tour_evaluation($post_id, $result);
        $result['content_score'] = (int) ($evaluation['content_score'] ?? 0);
        $result['content_score_band'] = (string) ($evaluation['band'] ?? 'blocked');
        $result['ai_suggestions'] = isset($evaluation['suggestions']) && is_array($evaluation['suggestions']) ? $evaluation['suggestions'] : [];
    }
    update_post_meta($post_id, '_hlt_validation_status', sanitize_key((string) $result['status']));
    update_post_meta($post_id, '_hlt_completion_score', (int) $result['completion']);
    update_post_meta($post_id, '_hlt_seo_score', (int) $result['seo_score']);
    update_post_meta($post_id, '_hlt_missing_fields_count', (int) $result['missing_count']);
    update_post_meta($post_id, '_hlt_missing_fields_json', wp_json_encode($result['missing'], JSON_UNESCAPED_UNICODE));
    update_post_meta($post_id, '_hlt_validation_warnings_json', wp_json_encode($result['warnings'], JSON_UNESCAPED_UNICODE));
    update_post_meta($post_id, '_hlt_language_status_json', wp_json_encode($result['language_status'], JSON_UNESCAPED_UNICODE));
    update_post_meta($post_id, '_hlt_last_validated_at', (string) $result['validated_at']);
    update_post_meta($post_id, '_hlt_sync_status', sanitize_key((string) $result['status']));
    update_post_meta($post_id, '_hlt_last_sync_checked_at', current_time('mysql'));
    return $result;
}

function hlt_tour_is_public_ready(int $post_id): bool
{
    $status = (string) hlt_get_meta($post_id, '_hlt_validation_status');
    if ($status === '') {
        return false;
    }
    $workflow = function_exists('hlt_get_workflow_state') ? (string) hlt_get_workflow_state($post_id) : 'draft';
    $sync_state = (string) hlt_get_meta($post_id, '_hlt_sync_state');
    if ($sync_state === '') {
        $sync_state = 'outdated';
    }
    $score = (int) hlt_get_meta($post_id, '_hlt_content_score');

    return $status === 'synced'
        && in_array($workflow, ['approved', 'published'], true)
        && $sync_state === 'clean'
        && $score >= 85;
}

function hlt_tour_safe_payload(WP_Post $post): array
{
    $payload = hlt_rest_post_payload($post);
    $details = is_array($payload['meta']['details'] ?? null) ? $payload['meta']['details'] : [];
    $payload['meta']['details'] = array_merge([
        'country' => 'multi-country',
        'duration' => 'Tailor-made',
        'highlights' => [],
        'includes' => [],
        'excludes' => [],
        'travel_style' => '',
        'best_time_to_visit' => '',
        'difficulty_level' => '',
        'private_group_flag' => true,
        'luxury_rating' => '',
    ], $details);
    $payload['meta']['gallery'] = array_values(array_filter((array) ($payload['meta']['gallery'] ?? []), 'hlt_validate_image_url'));
    if (!$payload['featuredImage'] && isset($payload['meta']['gallery'][0])) {
        $payload['featuredImage'] = $payload['meta']['gallery'][0];
    }
    $payload['meta']['publicReady'] = hlt_tour_is_public_ready((int) $post->ID);
    return $payload;
}
