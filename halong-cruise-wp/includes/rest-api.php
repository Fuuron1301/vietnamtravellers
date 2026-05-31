<?php
if (!defined('ABSPATH')) {
    exit;
}

function hlt_register_rest_routes(): void
{
    register_rest_route('hlt/v1', '/content/(?P<type>[a-z_]+)', [
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'hlt_rest_get_content',
        'permission_callback' => '__return_true',
        'args' => ['type' => ['sanitize_callback' => 'sanitize_key']],
    ]);

    register_rest_route('hlt/v1', '/content/(?P<type>[a-z_]+)/(?P<slug>[a-zA-Z0-9\-_]+)', [
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'hlt_rest_get_single_content',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('hlt/v1', '/lead', [
        'methods' => WP_REST_Server::CREATABLE,
        'callback' => 'hlt_rest_create_lead',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('hlt/v1', '/booking', [
        'methods' => WP_REST_Server::CREATABLE,
        'callback' => 'hlt_rest_create_booking',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('hlt/v1', '/cruises', [
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'hlt_rest_get_cruises',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('hlt/v1', '/cruise/(?P<slug>[a-zA-Z0-9\-_]+)', [
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'hlt_rest_get_single_cruise',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('hlt/v1', '/status/tour/(?P<id>\d+)', [
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'hlt_rest_get_tour_status',
        'permission_callback' => static function (): bool {
            return current_user_can('edit_posts');
        },
    ]);
}

function hlt_allowed_content_type(string $type): string
{
    $map = [
        'countries' => 'hlt_country',
        'tours' => 'hlt_tour',
        'cruises' => 'hlt_cruise',
        'styles' => 'hlt_travel_style',
        'testimonials' => 'hlt_testimonial',
        'posts' => 'post',
        'pages' => 'page',
    ];
    return $map[$type] ?? '';
}

function hlt_rest_get_cruises(WP_REST_Request $request): WP_REST_Response
{
    $request->set_param('type', 'cruises');
    return hlt_rest_get_content($request);
}

function hlt_rest_get_single_cruise(WP_REST_Request $request): WP_REST_Response
{
    $request->set_param('type', 'cruises');
    return hlt_rest_get_single_content($request);
}

function hlt_rest_get_content(WP_REST_Request $request): WP_REST_Response
{
    $post_type = hlt_allowed_content_type((string) $request['type']);
    if (!$post_type) {
        return new WP_REST_Response(['message' => 'Unsupported content type'], 400);
    }

    $per_page = max(1, min(absint($request->get_param('per_page') ?: 24), 100));
    $query = new WP_Query([
        'post_type' => $post_type,
        'post_status' => 'publish',
        'posts_per_page' => $per_page,
        'orderby' => 'menu_order date',
        'order' => 'DESC',
    ]);

    $posts = $query->posts;
    if ($post_type === 'hlt_tour') {
        $posts = array_values(array_filter($posts, static function ($post): bool {
            return $post instanceof WP_Post && hlt_tour_is_public_ready((int) $post->ID);
        }));
        return new WP_REST_Response(array_map('hlt_tour_safe_payload', $posts));
    }

    return new WP_REST_Response(array_map('hlt_rest_post_payload', $posts));
}

function hlt_rest_get_single_content(WP_REST_Request $request): WP_REST_Response
{
    $post_type = hlt_allowed_content_type((string) $request['type']);
    if (!$post_type) {
        return new WP_REST_Response(['message' => 'Unsupported content type'], 400);
    }

    $post = get_page_by_path(sanitize_title((string) $request['slug']), OBJECT, $post_type);
    if (!$post || $post->post_status !== 'publish') {
        return new WP_REST_Response(['message' => 'Not found'], 404);
    }

    if ($post_type === 'hlt_tour') {
        if (!hlt_tour_is_public_ready((int) $post->ID)) {
            return new WP_REST_Response(['message' => 'Tour data is incomplete'], 404);
        }
        return new WP_REST_Response(hlt_tour_safe_payload($post));
    }

    return new WP_REST_Response(hlt_rest_post_payload($post));
}

function hlt_rest_client_fingerprint(WP_REST_Request $request, string $scope): string
{
    $remote_addr = sanitize_text_field((string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    $agent = sanitize_text_field((string) $request->get_header('user-agent'));

    return hash('sha256', $scope . '|' . $remote_addr . '|' . $agent);
}

function hlt_rest_rate_limit(WP_REST_Request $request, string $scope, int $limit, int $window_seconds): ?WP_REST_Response
{
    $key = 'hlt_rate_' . $scope . '_' . hlt_rest_client_fingerprint($request, $scope);
    $count = (int) get_transient($key);
    if ($count >= $limit) {
        return new WP_REST_Response(['message' => 'Too many requests'], 429);
    }

    set_transient($key, $count + 1, $window_seconds);
    return null;
}

function hlt_rest_is_bot_payload(array $payload): bool
{
    if (!empty($payload['website'])) {
        return true;
    }
    $notes = strtolower((string) hlt_array_get($payload, 'notes', ''));
    return (bool) preg_match('/(https?:\\/\\/.*){3,}|viagra|casino|loan|crypto bonus/', $notes);
}

function hlt_rest_verify_recaptcha(array $payload): bool
{
    $secret = defined('HLT_RECAPTCHA_SECRET') ? HLT_RECAPTCHA_SECRET : (string) get_option('hlt_recaptcha_secret', '');
    if ($secret === '') {
        return true;
    }
    $token = (string) hlt_array_get($payload, 'recaptchaToken', '');
    if ($token === '') {
        return false;
    }
    $response = wp_remote_post('https://www.google.com/recaptcha/api/siteverify', [
        'timeout' => 5,
        'body' => ['secret' => $secret, 'response' => $token],
    ]);
    if (is_wp_error($response)) {
        return false;
    }
    $body = json_decode((string) wp_remote_retrieve_body($response), true);
    return is_array($body) && !empty($body['success']) && (float) ($body['score'] ?? 0) >= 0.5;
}

function hlt_rest_create_lead(WP_REST_Request $request): WP_REST_Response
{
    $limited = hlt_rest_rate_limit($request, 'lead', 5, 10 * MINUTE_IN_SECONDS);
    if ($limited) {
        return $limited;
    }

    $payload = $request->get_json_params() ?: [];
    if (hlt_rest_is_bot_payload($payload) || !hlt_rest_verify_recaptcha($payload)) {
        return new WP_REST_Response(['message' => 'Spam protection rejected this request'], 400);
    }
    $contact = hlt_array_get($payload, 'contact', []);
    $contact = is_array($contact) ? $contact : [];
    $name = sanitize_text_field(hlt_array_get($contact, 'fullName', 'New inquiry'));
    $email = sanitize_email(hlt_array_get($contact, 'email', ''));

    $post_id = wp_insert_post([
        'post_type' => 'hlt_lead',
        'post_status' => 'pending',
        'post_title' => $name . ($email ? ' - ' . $email : ''),
        'post_content' => wp_json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
    ], true);

    if (is_wp_error($post_id)) {
        return new WP_REST_Response(['message' => $post_id->get_error_message()], 500);
    }

    update_post_meta($post_id, '_hlt_lead_status', 'Warm');
    update_post_meta($post_id, '_hlt_destination', sanitize_text_field(implode(', ', (array) hlt_array_get($payload, 'destinations', []))));
    update_post_meta($post_id, '_hlt_budget', sanitize_text_field((string) hlt_array_get($payload, 'budget', '')));
    update_post_meta($post_id, '_hlt_travel_dates', sanitize_text_field((string) hlt_array_get($payload, 'dates', '')));
    update_post_meta($post_id, '_hlt_travel_duration', sanitize_text_field((string) hlt_array_get($payload, 'duration', '')));
    update_post_meta($post_id, '_hlt_contact_email', $email);
    update_post_meta($post_id, '_hlt_contact_phone', sanitize_text_field(hlt_array_get($contact, 'phone', '')));
    update_post_meta($post_id, '_hlt_country', sanitize_text_field(hlt_array_get($contact, 'country', '')));
    update_post_meta($post_id, '_hlt_lead_payload_json', wp_json_encode($payload, JSON_UNESCAPED_UNICODE));

    $destinations = (array) hlt_array_get($payload, 'destinations', []);
    $destination_label = sanitize_text_field(implode(', ', $destinations));
    $admin_email = get_option('admin_email');
    if ($admin_email) {
        wp_mail(
            $admin_email,
            'New tailor-made travel lead',
            '<p><strong>Lead #' . esc_html((string) $post_id) . '</strong> from ' . esc_html($name) . ' has arrived.</p><p>Destination: ' . esc_html($destination_label) . '</p>',
            ['Content-Type: text/html; charset=UTF-8', 'Reply-To: ' . $name . ' <' . $email . '>']
        );
    }

    return new WP_REST_Response(['id' => $post_id, 'status' => 'Warm'], 201);
}

function hlt_rest_create_booking(WP_REST_Request $request): WP_REST_Response
{
    $limited = hlt_rest_rate_limit($request, 'booking', 3, 10 * MINUTE_IN_SECONDS);
    if ($limited) {
        return $limited;
    }

    $payload = $request->get_json_params() ?: [];
    $booking_id = 'HLT-' . gmdate('Ymd') . '-' . wp_generate_password(6, false, false);
    $post_id = wp_insert_post([
        'post_type' => 'hlt_booking',
        'post_status' => 'pending',
        'post_title' => $booking_id,
        'post_content' => wp_json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
    ], true);

    if (is_wp_error($post_id)) {
        return new WP_REST_Response(['message' => $post_id->get_error_message()], 500);
    }

    update_post_meta($post_id, '_hlt_booking_id', $booking_id);
    update_post_meta($post_id, '_hlt_payment_method', sanitize_text_field((string) hlt_array_get($payload, 'method', 'pending')));
    update_post_meta($post_id, '_hlt_payment_status', 'Pending');
    update_post_meta($post_id, '_hlt_amount', sanitize_text_field((string) hlt_array_get($payload, 'amount', '')));
    update_post_meta($post_id, '_hlt_currency', sanitize_text_field((string) hlt_array_get($payload, 'currency', 'USD')));
    update_post_meta($post_id, '_hlt_booking_payload_json', wp_json_encode($payload, JSON_UNESCAPED_UNICODE));

    $admin_email = get_option('admin_email');
    if ($admin_email) {
        wp_mail(
            $admin_email,
            'New booking request',
            '<p><strong>Booking ' . esc_html($booking_id) . '</strong> is pending.</p><p>Payment method: ' . esc_html((string) hlt_array_get($payload, 'method', 'pending')) . '</p>',
            ['Content-Type: text/html; charset=UTF-8']
        );
    }

    return new WP_REST_Response(['id' => $post_id, 'bookingId' => $booking_id, 'status' => 'Pending'], 201);
}

function hlt_rest_get_tour_status(WP_REST_Request $request): WP_REST_Response
{
    $post_id = (int) $request['id'];
    if (get_post_type($post_id) !== 'hlt_tour') {
        return new WP_REST_Response(['message' => 'Not found'], 404);
    }

    $workflow_state = function_exists('hlt_get_workflow_state') ? (string) hlt_get_workflow_state($post_id) : 'draft';
    $sync_state = (string) hlt_get_meta($post_id, '_hlt_sync_state');
    if ($sync_state === '') {
        $sync_state = 'outdated';
    }

    return new WP_REST_Response([
        'id' => $post_id,
        'workflowState' => $workflow_state,
        'syncState' => $sync_state,
        'contentScore' => (int) hlt_get_meta($post_id, '_hlt_content_score'),
        'payloadHash' => (string) hlt_get_meta($post_id, '_hlt_payload_hash'),
        'publicReady' => hlt_tour_is_public_ready($post_id),
    ]);
}
