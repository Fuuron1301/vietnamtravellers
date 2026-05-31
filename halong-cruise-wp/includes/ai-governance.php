<?php
if (!defined('ABSPATH')) {
    exit;
}

function hlt_ai_score_band(int $score): string
{
    if ($score < 70) {
        return 'blocked';
    }
    if ($score < 85) {
        return 'warning';
    }
    if ($score < 95) {
        return 'publish_ready';
    }
    return 'featured_eligible';
}

function hlt_ai_evaluate_tour(int $post_id, array $validation): array
{
    $score = 100;
    $missing_count = isset($validation['missing_count']) ? (int) $validation['missing_count'] : 0;
    $warnings_count = isset($validation['warnings']) && is_array($validation['warnings']) ? count($validation['warnings']) : 0;
    $seo_score = isset($validation['seo_score']) ? (int) $validation['seo_score'] : 0;
    $language_status = isset($validation['language_status']) && is_array($validation['language_status']) ? $validation['language_status'] : [];
    $suggestions = [];

    $score -= min(45, $missing_count * 6);

    if ((100 - $seo_score) > 30) {
        $score -= 12;
    }

    $score -= min(18, $warnings_count * 4);

    $language_labels = [
        'vi' => 'Vietnamese',
        'en' => 'English',
        'zh' => 'Chinese',
    ];

    foreach ($language_labels as $locale => $label) {
        if (empty($language_status[$locale])) {
            $score -= 7;
            $suggestions[] = sprintf('Complete %s translation content.', $label);
        }
    }

    if ($seo_score < 85) {
        $suggestions[] = 'Improve SEO title, description, slug, H1, FAQ, and media coverage.';
    }
    if ($missing_count > 0) {
        $suggestions[] = 'Fill all required tour schema fields before publishing.';
    }
    if ($warnings_count > 0) {
        $suggestions[] = 'Resolve validation warnings in itinerary and gallery assets.';
    }

    $score = max(0, min(100, (int) $score));

    return [
        'content_score' => $score,
        'band' => hlt_ai_score_band($score),
        'suggestions' => array_values(array_unique($suggestions)),
        'evaluated_at' => current_time('mysql'),
    ];
}

function hlt_ai_store_tour_evaluation(int $post_id, array $validation): array
{
    $evaluation = hlt_ai_evaluate_tour($post_id, $validation);

    update_post_meta($post_id, '_hlt_content_score', (int) $evaluation['content_score']);
    update_post_meta($post_id, '_hlt_content_score_band', sanitize_key((string) $evaluation['band']));
    update_post_meta($post_id, '_hlt_ai_suggestions_json', wp_json_encode($evaluation['suggestions'], JSON_UNESCAPED_UNICODE));
    update_post_meta($post_id, '_hlt_ai_evaluated_at', (string) $evaluation['evaluated_at']);

    return $evaluation;
}
