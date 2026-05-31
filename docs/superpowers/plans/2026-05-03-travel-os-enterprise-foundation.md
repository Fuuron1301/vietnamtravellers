# Travel OS Enterprise Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. User explicitly requested no commits, so every task ends with verification/checkpoint instead of git commit.

**Goal:** Build the enterprise Travel OS foundation: event-driven sync, workflow states, deterministic AI-ready governance, admin intelligence panels, and validated frontend consumption without breaking native WordPress admin.

**Architecture:** WordPress remains the source of truth and stores workflow, sync, event and governance state. A lightweight event store plus cron queue processor validates tour payloads, computes content scores, updates sync state and optionally calls Next.js ISR revalidation. Next.js consumes only validated payloads through strict parsers and never renders raw CMS data directly.

**Tech Stack:** WordPress PHP plugin, WordPress cron/admin-post/meta boxes/custom DB table, REST API, Next.js App Router, TypeScript, safe parsing, environment-configured revalidation secret.

---

## No Commit Policy
The user explicitly said `đừng commit gì nhé`. Do not run `git commit`. Use checkpoint notes, diff if available, file line counts and verification commands only.

## File Structure

**WordPress plugin**
- Create: `halong-cruise-wp/includes/event-store.php` - creates and writes durable sync events.
- Create: `halong-cruise-wp/includes/workflow.php` - workflow states, role capability helpers, workflow metabox and save handling.
- Create: `halong-cruise-wp/includes/ai-governance.php` - deterministic AI-ready scoring, suggestions and auto-fix helpers.
- Create: `halong-cruise-wp/includes/queue-processor.php` - processes pending events, updates sync state and calls frontend revalidation.
- Create: `halong-cruise-wp/includes/admin-intelligence.php` - native WordPress panels, columns and notices for Travel OS intelligence.
- Create: `halong-cruise-wp/includes/settings.php` - native Settings page for revalidation URL and shared secret.
- Modify: `halong-cruise-wp/halong-cruise-headless.php` - require modules and register activation, cron, save, delete, admin and REST hooks.
- Modify: `halong-cruise-wp/includes/tour-validation.php` - add content score, workflow/sync gates and payload hash support.
- Modify: `halong-cruise-wp/includes/rest-api.php` - expose validated status endpoints and keep public tour endpoints clean only.
- Modify: `halong-cruise-wp/includes/roles.php` - add SEO Specialist and AI Validator roles.
- Modify: `halong-cruise-wp/README.md` - document Travel OS setup and verification.

**Next.js frontend**
- Create: `luxury-travel-next/lib/validated-cms.ts` - typed parser and safe fallback normalizer for CMS payloads.
- Create: `luxury-travel-next/app/api/revalidate/route.ts` - secured ISR revalidation endpoint.
- Modify: `luxury-travel-next/lib/types.ts` - add validation, workflow and sync metadata types.
- Modify: `luxury-travel-next/lib/cms.ts` - fetch through safe parser and stop returning malformed raw remote data.
- Modify: `luxury-travel-next/.env.example` - add `NEXT_REVALIDATION_SECRET` and WordPress revalidation URL guidance.
- Modify: `luxury-travel-next/README.md` - document validated rendering and ISR.

---

### Task 1: Durable Event Store

**Files:**
- Create: `halong-cruise-wp/includes/event-store.php`
- Modify: `halong-cruise-wp/halong-cruise-headless.php`

- [ ] **Step 1: Create event store module**

Create `halong-cruise-wp/includes/event-store.php`:

```php
<?php
if (!defined('ABSPATH')) {
    exit;
}

function hlt_event_table_name(): string
{
    global $wpdb;
    return $wpdb->prefix . 'hlt_sync_events';
}

function hlt_create_event_table(): void
{
    global $wpdb;
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    $table = hlt_event_table_name();
    $charset = $wpdb->get_charset_collate();
    $sql = "CREATE TABLE {$table} (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        event_name VARCHAR(80) NOT NULL,
        entity_type VARCHAR(40) NOT NULL,
        entity_id BIGINT UNSIGNED NOT NULL,
        payload_hash VARCHAR(64) NOT NULL DEFAULT '',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        retry_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
        error_message TEXT NULL,
        actor_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL,
        processed_at DATETIME NULL,
        PRIMARY KEY (id),
        KEY status_created (status, created_at),
        KEY entity_lookup (entity_type, entity_id)
    ) {$charset};";
    dbDelta($sql);
}

function hlt_payload_hash(array $payload): string
{
    return hash('sha256', wp_json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

function hlt_record_sync_event(string $event_name, string $entity_type, int $entity_id, array $payload = []): int
{
    global $wpdb;
    $hash = $payload ? hlt_payload_hash($payload) : '';
    $wpdb->insert(hlt_event_table_name(), [
        'event_name' => sanitize_key(str_replace('.', '_', $event_name)),
        'entity_type' => sanitize_key($entity_type),
        'entity_id' => $entity_id,
        'payload_hash' => $hash,
        'status' => 'pending',
        'retry_count' => 0,
        'error_message' => '',
        'actor_id' => get_current_user_id(),
        'created_at' => current_time('mysql'),
    ], ['%s', '%s', '%d', '%s', '%s', '%d', '%s', '%d', '%s']);
    return (int) $wpdb->insert_id;
}

function hlt_get_pending_sync_events(int $limit = 10): array
{
    global $wpdb;
    $table = hlt_event_table_name();
    return $wpdb->get_results($wpdb->prepare("SELECT * FROM {$table} WHERE status = %s ORDER BY created_at ASC LIMIT %d", 'pending', $limit), ARRAY_A) ?: [];
}

function hlt_update_sync_event(int $event_id, string $status, string $error_message = ''): void
{
    global $wpdb;
    $wpdb->update(hlt_event_table_name(), [
        'status' => sanitize_key($status),
        'error_message' => sanitize_textarea_field($error_message),
        'processed_at' => current_time('mysql'),
    ], ['id' => $event_id], ['%s', '%s', '%s'], ['%d']);
}
```

- [ ] **Step 2: Wire event store into plugin bootstrap**

Modify `halong-cruise-wp/halong-cruise-headless.php`:

```php
require_once HLT_HEADLESS_PATH . 'includes/event-store.php';
```

Inside `hlt_headless_activate()` add:

```php
hlt_create_event_table();
```

- [ ] **Step 3: Verify event table wiring**

Run:

```powershell
rg -n "event-store|hlt_create_event_table|hlt_record_sync_event" halong-cruise-wp
```

Expected: one require in `halong-cruise-headless.php`, one activation call, and function definitions in `event-store.php`.

---

### Task 2: Workflow State Engine

**Files:**
- Create: `halong-cruise-wp/includes/workflow.php`
- Modify: `halong-cruise-wp/halong-cruise-headless.php`
- Modify: `halong-cruise-wp/includes/roles.php`

- [ ] **Step 1: Create workflow module**

Create `halong-cruise-wp/includes/workflow.php`:

```php
<?php
if (!defined('ABSPATH')) {
    exit;
}

function hlt_workflow_states(): array
{
    return [
        'draft' => 'Draft',
        'in_review' => 'In Review',
        'ai_review_pending' => 'AI Review Pending',
        'approved' => 'Approved',
        'published' => 'Published',
        'archived' => 'Archived',
    ];
}

function hlt_get_workflow_state(int $post_id): string
{
    $state = sanitize_key((string) hlt_get_meta($post_id, '_hlt_workflow_state', 'draft'));
    return array_key_exists($state, hlt_workflow_states()) ? $state : 'draft';
}

function hlt_set_workflow_state(int $post_id, string $state): void
{
    if (!array_key_exists($state, hlt_workflow_states())) {
        $state = 'draft';
    }
    $old = hlt_get_workflow_state($post_id);
    update_post_meta($post_id, '_hlt_workflow_state', $state);
    if ($old !== $state && function_exists('hlt_record_sync_event')) {
        hlt_record_sync_event('workflow.changed', 'tour', $post_id, ['old' => $old, 'new' => $state]);
    }
}

function hlt_register_workflow_metabox(): void
{
    add_meta_box('hlt_workflow_box', 'Travel OS Workflow', 'hlt_render_workflow_metabox', 'hlt_tour', 'side', 'high');
}

function hlt_render_workflow_metabox(WP_Post $post): void
{
    wp_nonce_field('hlt_save_workflow', 'hlt_workflow_nonce');
    $current = hlt_get_workflow_state($post->ID);
    echo '<p><label for="hlt_workflow_state"><strong>Workflow state</strong></label></p>';
    echo '<select id="hlt_workflow_state" name="_hlt_workflow_state" class="widefat">';
    foreach (hlt_workflow_states() as $key => $label) {
        echo '<option value="' . esc_attr($key) . '" ' . selected($current, $key, false) . '>' . esc_html($label) . '</option>';
    }
    echo '</select>';
    echo '<p class="description">Public rendering requires Approved or Published plus clean sync and score 85+.</p>';
}

function hlt_save_workflow_state(int $post_id, WP_Post $post): void
{
    if ($post->post_type !== 'hlt_tour') {
        return;
    }
    if (!isset($_POST['hlt_workflow_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['hlt_workflow_nonce'])), 'hlt_save_workflow')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    hlt_set_workflow_state($post_id, sanitize_key((string) wp_unslash($_POST['_hlt_workflow_state'] ?? 'draft')));
}
```

- [ ] **Step 2: Register workflow hooks**

Add to `halong-cruise-headless.php`:

```php
require_once HLT_HEADLESS_PATH . 'includes/workflow.php';
add_action('add_meta_boxes', 'hlt_register_workflow_metabox');
add_action('save_post', 'hlt_save_workflow_state', 12, 2);
```

- [ ] **Step 3: Add enterprise roles**

In `halong-cruise-wp/includes/roles.php`, add inside `hlt_register_roles()`:

```php
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
```

- [ ] **Step 4: Verify workflow scan**

Run:

```powershell
rg -n "hlt_workflow|SEO Specialist|AI Validator" halong-cruise-wp
```

Expected: workflow functions, bootstrap hooks, and two role definitions.

---

### Task 3: AI-Ready Governance Score

**Files:**
- Create: `halong-cruise-wp/includes/ai-governance.php`
- Modify: `halong-cruise-wp/includes/tour-validation.php`
- Modify: `halong-cruise-wp/halong-cruise-headless.php`

- [ ] **Step 1: Create deterministic governance engine**

Create `halong-cruise-wp/includes/ai-governance.php`:

```php
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
    $suggestions = [];
    $missing_count = (int) ($validation['missing_count'] ?? 0);
    $seo_score = (int) ($validation['seo_score'] ?? 0);
    $warnings = (array) ($validation['warnings'] ?? []);
    $languages = (array) ($validation['language_status'] ?? []);
    $score -= min(45, $missing_count * 6);
    $score -= max(0, 100 - $seo_score) > 30 ? 12 : 0;
    $score -= min(18, count($warnings) * 4);
    foreach (['vi', 'en', 'zh'] as $locale) {
        if (empty($languages[$locale])) {
            $score -= 7;
            $suggestions[] = 'Complete ' . strtoupper($locale) . ' translation fields.';
        }
    }
    if ($seo_score < 85) {
        $suggestions[] = 'Generate SEO title and description within target lengths.';
    }
    if ($missing_count > 0) {
        $suggestions[] = 'Resolve missing required tour fields before publishing.';
    }
    if (count($warnings) > 0) {
        $suggestions[] = 'Review itinerary and gallery warnings.';
    }
    $score = max(0, min(100, $score));
    return [
        'content_score' => $score,
        'band' => hlt_ai_score_band($score),
        'suggestions' => array_values(array_unique($suggestions)),
        'evaluated_at' => current_time('mysql'),
    ];
}

function hlt_ai_store_tour_evaluation(int $post_id, array $validation): array
{
    $result = hlt_ai_evaluate_tour($post_id, $validation);
    update_post_meta($post_id, '_hlt_content_score', (int) $result['content_score']);
    update_post_meta($post_id, '_hlt_content_score_band', sanitize_key((string) $result['band']));
    update_post_meta($post_id, '_hlt_ai_suggestions_json', wp_json_encode($result['suggestions'], JSON_UNESCAPED_UNICODE));
    update_post_meta($post_id, '_hlt_ai_evaluated_at', (string) $result['evaluated_at']);
    return $result;
}
```

- [ ] **Step 2: Wire governance into validation storage**

In `hlt_tour_store_validation()` in `tour-validation.php`, after `$result = hlt_tour_validate($post_id);`, add:

```php
if (function_exists('hlt_ai_store_tour_evaluation')) {
    $ai = hlt_ai_store_tour_evaluation($post_id, $result);
    $result['content_score'] = (int) $ai['content_score'];
    $result['content_score_band'] = (string) $ai['band'];
    $result['ai_suggestions'] = (array) $ai['suggestions'];
}
```

- [ ] **Step 3: Require governance module**

Add to `halong-cruise-headless.php`:

```php
require_once HLT_HEADLESS_PATH . 'includes/ai-governance.php';
```

- [ ] **Step 4: Verify scoring hooks**

Run:

```powershell
rg -n "content_score|hlt_ai_store_tour_evaluation|hlt_ai_evaluate_tour" halong-cruise-wp
```

Expected: score functions and meta writes are present.

---

### Task 4: Sync Queue Processor And Drift State

**Files:**
- Create: `halong-cruise-wp/includes/queue-processor.php`
- Modify: `halong-cruise-wp/includes/sync-status.php`
- Modify: `halong-cruise-wp/halong-cruise-headless.php`

- [ ] **Step 1: Create queue processor module**

Create `halong-cruise-wp/includes/queue-processor.php`:

```php
<?php
if (!defined('ABSPATH')) {
    exit;
}

function hlt_sync_states(): array
{
    return ['clean', 'outdated', 'invalid', 'processing', 'failed'];
}

function hlt_set_sync_state(int $post_id, string $state, string $message = ''): void
{
    if (!in_array($state, hlt_sync_states(), true)) {
        $state = 'failed';
    }
    update_post_meta($post_id, '_hlt_sync_state', $state);
    update_post_meta($post_id, '_hlt_sync_message', sanitize_textarea_field($message));
    update_post_meta($post_id, '_hlt_last_sync_timestamp', current_time('mysql'));
}

function hlt_process_sync_queue(int $limit = 10): array
{
    $events = hlt_get_pending_sync_events($limit);
    $summary = ['processed' => 0, 'clean' => 0, 'invalid' => 0, 'failed' => 0];
    foreach ($events as $event) {
        $event_id = (int) $event['id'];
        $post_id = (int) $event['entity_id'];
        hlt_update_sync_event($event_id, 'processing');
        hlt_set_sync_state($post_id, 'processing');
        try {
            if (get_post_type($post_id) !== 'hlt_tour') {
                hlt_update_sync_event($event_id, 'clean');
                $summary['processed']++;
                continue;
            }
            $validation = hlt_tour_store_validation($post_id);
            $score = (int) hlt_get_meta($post_id, '_hlt_content_score', 0);
            $workflow = function_exists('hlt_get_workflow_state') ? hlt_get_workflow_state($post_id) : 'draft';
            $is_public = in_array($workflow, ['approved', 'published'], true) && $score >= 85 && (($validation['status'] ?? '') === 'synced');
            if ($is_public) {
                $post = get_post($post_id);
                $payload = $post instanceof WP_Post ? hlt_tour_safe_payload($post) : [];
                update_post_meta($post_id, '_hlt_payload_hash', hlt_payload_hash($payload));
                hlt_set_sync_state($post_id, 'clean');
                hlt_update_sync_event($event_id, 'clean');
                hlt_trigger_frontend_revalidation($post_id);
                $summary['clean']++;
            } else {
                hlt_set_sync_state($post_id, 'invalid', 'Workflow, score or validation is not public-ready.');
                hlt_update_sync_event($event_id, 'invalid', 'Workflow, score or validation is not public-ready.');
                $summary['invalid']++;
            }
            $summary['processed']++;
        } catch (Throwable $error) {
            hlt_set_sync_state($post_id, 'failed', $error->getMessage());
            hlt_update_sync_event($event_id, 'failed', $error->getMessage());
            $summary['failed']++;
        }
    }
    update_option('hlt_last_queue_summary', $summary);
    update_option('hlt_last_queue_processed_at', current_time('mysql'));
    return $summary;
}

function hlt_trigger_frontend_revalidation(int $post_id): void
{
    $endpoint = (string) get_option('hlt_next_revalidation_url', '');
    $secret = (string) get_option('hlt_next_revalidation_secret', '');
    if (!$endpoint || !$secret) {
        return;
    }
    $post = get_post($post_id);
    if (!$post) {
        return;
    }
    wp_remote_post($endpoint, [
        'timeout' => 8,
        'headers' => ['Content-Type' => 'application/json'],
        'body' => wp_json_encode([
            'secret' => $secret,
            'slug' => $post->post_name,
            'type' => 'tour',
        ], JSON_UNESCAPED_UNICODE),
    ]);
}
```

- [ ] **Step 2: Create events when tours change**

Add to `sync-status.php`:

```php
function hlt_record_tour_change_event(int $post_id, WP_Post $post, bool $update): void
{
    if ($post->post_type !== 'hlt_tour' || wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
        return;
    }
    update_post_meta($post_id, '_hlt_sync_state', 'outdated');
    $event = $update ? 'tour.updated' : 'tour.created';
    hlt_record_sync_event($event, 'tour', $post_id, ['post_modified' => $post->post_modified_gmt]);
}

function hlt_record_tour_delete_event(int $post_id): void
{
    if (get_post_type($post_id) === 'hlt_tour') {
        hlt_record_sync_event('tour.deleted', 'tour', $post_id, ['deleted_at' => current_time('mysql')]);
    }
}
```

- [ ] **Step 3: Wire queue hooks**

Add to `halong-cruise-headless.php`:

```php
require_once HLT_HEADLESS_PATH . 'includes/queue-processor.php';
add_action('save_post', 'hlt_record_tour_change_event', 30, 3);
add_action('before_delete_post', 'hlt_record_tour_delete_event');
add_action('hlt_process_sync_queue_event', 'hlt_process_sync_queue');
```

In activation:

```php
if (!wp_next_scheduled('hlt_process_sync_queue_event')) {
    wp_schedule_event(time() + 300, 'hourly', 'hlt_process_sync_queue_event');
}
```

In deactivation:

```php
wp_clear_scheduled_hook('hlt_process_sync_queue_event');
```

- [ ] **Step 4: Verify queue wiring**

Run:

```powershell
rg -n "hlt_process_sync_queue|hlt_record_tour_change_event|hlt_process_sync_queue_event|hlt_trigger_frontend_revalidation" halong-cruise-wp
```

Expected: processor functions and hooks are visible.

---

### Task 5: Native WordPress AI Intelligence Admin Layer

**Files:**
- Create: `halong-cruise-wp/includes/admin-intelligence.php`
- Modify: `halong-cruise-wp/halong-cruise-headless.php`
- Modify: `halong-cruise-wp/includes/bulk-actions.php`

- [ ] **Step 1: Create admin intelligence panel**

Create `halong-cruise-wp/includes/admin-intelligence.php`:

```php
<?php
if (!defined('ABSPATH')) {
    exit;
}

function hlt_register_ai_intelligence_metabox(): void
{
    add_meta_box('hlt_ai_intelligence', 'AI Content Intelligence', 'hlt_render_ai_intelligence_metabox', 'hlt_tour', 'side', 'default');
}

function hlt_render_ai_intelligence_metabox(WP_Post $post): void
{
    $score = (int) hlt_get_meta($post->ID, '_hlt_content_score', 0);
    $band = (string) hlt_get_meta($post->ID, '_hlt_content_score_band', 'blocked');
    $sync = (string) hlt_get_meta($post->ID, '_hlt_sync_state', 'outdated');
    $suggestions = hlt_get_json_meta($post->ID, '_hlt_ai_suggestions_json');
    echo '<p><strong>Content score:</strong> ' . esc_html((string) $score) . '/100</p>';
    echo '<p><strong>Readiness:</strong> ' . esc_html(ucwords(str_replace('_', ' ', $band))) . '</p>';
    echo '<p><strong>Sync state:</strong> ' . esc_html(ucwords($sync)) . '</p>';
    if ($suggestions) {
        echo '<ul class="hlt-health-list">';
        foreach ($suggestions as $suggestion) {
            echo '<li>' . esc_html((string) $suggestion) . '</li>';
        }
        echo '</ul>';
    } else {
        echo '<p class="description">No suggestions yet. Run validation to refresh intelligence.</p>';
    }
    $run_url = wp_nonce_url(admin_url('admin-post.php?action=hlt_run_ai_validation&post_id=' . $post->ID), 'hlt_run_ai_validation_' . $post->ID);
    echo '<p><a class="button button-primary" href="' . esc_url($run_url) . '">Run AI Validation</a></p>';
}

function hlt_handle_run_ai_validation(): void
{
    $post_id = (int) ($_GET['post_id'] ?? 0);
    if (!$post_id || get_post_type($post_id) !== 'hlt_tour' || !current_user_can('edit_post', $post_id)) {
        wp_die('Permission denied');
    }
    check_admin_referer('hlt_run_ai_validation_' . $post_id);
    hlt_tour_store_validation($post_id);
    hlt_record_sync_event('tour.updated', 'tour', $post_id, ['ai_validation' => true]);
    wp_safe_redirect(admin_url('post.php?action=edit&post=' . $post_id . '&hlt_ai_updated=1'));
    exit;
}
```

- [ ] **Step 2: Wire admin intelligence**

Add to `halong-cruise-headless.php`:

```php
require_once HLT_HEADLESS_PATH . 'includes/admin-intelligence.php';
add_action('add_meta_boxes', 'hlt_register_ai_intelligence_metabox');
add_action('admin_post_hlt_run_ai_validation', 'hlt_handle_run_ai_validation');
```

- [ ] **Step 3: Extend bulk actions**

In `hlt_register_tour_bulk_actions()` add:

```php
$actions['hlt_bulk_ai_validation'] = 'Run AI validation';
$actions['hlt_bulk_sync_repair'] = 'Repair sync drift';
```

In `hlt_handle_tour_bulk_actions()` include both actions in the allowed list and add inside the loop:

```php
if ($action === 'hlt_bulk_ai_validation' || $action === 'hlt_bulk_sync_repair') {
    hlt_tour_store_validation((int) $post_id);
    hlt_record_sync_event('tour.updated', 'tour', (int) $post_id, ['bulk_action' => $action]);
}
```

- [ ] **Step 4: Verify admin intelligence**

Run:

```powershell
rg -n "AI Content Intelligence|hlt_run_ai_validation|hlt_bulk_ai_validation|hlt_bulk_sync_repair" halong-cruise-wp
```

Expected: panel, admin-post action and bulk actions exist.

---

### Task 6: Public REST Gates And Status Endpoints

**Files:**
- Modify: `halong-cruise-wp/includes/tour-validation.php`
- Modify: `halong-cruise-wp/includes/rest-api.php`

- [ ] **Step 1: Strengthen public-ready gate**

Modify `hlt_tour_is_public_ready()` in `tour-validation.php`:

```php
function hlt_tour_is_public_ready(int $post_id): bool
{
    $validation_status = (string) hlt_get_meta($post_id, '_hlt_validation_status');
    if ($validation_status === '') {
        $result = hlt_tour_store_validation($post_id);
        $validation_status = (string) $result['status'];
    }
    $workflow = function_exists('hlt_get_workflow_state') ? hlt_get_workflow_state($post_id) : 'draft';
    $sync_state = (string) hlt_get_meta($post_id, '_hlt_sync_state', 'outdated');
    $score = (int) hlt_get_meta($post_id, '_hlt_content_score', 0);
    return $validation_status === 'synced'
        && in_array($workflow, ['approved', 'published'], true)
        && $sync_state === 'clean'
        && $score >= 85;
}
```

- [ ] **Step 2: Add status REST route**

In `hlt_register_rest_routes()` add:

```php
register_rest_route('hlt/v1', '/status/tour/(?P<id>\d+)', [
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'hlt_rest_get_tour_status',
    'permission_callback' => function () {
        return current_user_can('edit_posts');
    },
]);
```

Add function:

```php
function hlt_rest_get_tour_status(WP_REST_Request $request): WP_REST_Response
{
    $post_id = (int) $request['id'];
    if (get_post_type($post_id) !== 'hlt_tour') {
        return new WP_REST_Response(['message' => 'Not found'], 404);
    }
    return new WP_REST_Response([
        'id' => $post_id,
        'workflowState' => function_exists('hlt_get_workflow_state') ? hlt_get_workflow_state($post_id) : 'draft',
        'syncState' => hlt_get_meta($post_id, '_hlt_sync_state', 'outdated'),
        'contentScore' => (int) hlt_get_meta($post_id, '_hlt_content_score', 0),
        'payloadHash' => hlt_get_meta($post_id, '_hlt_payload_hash', ''),
        'publicReady' => hlt_tour_is_public_ready($post_id),
    ]);
}
```

- [ ] **Step 3: Verify REST gates**

Run:

```powershell
rg -n "status/tour|workflowState|syncState|contentScore|publicReady" halong-cruise-wp/includes/rest-api.php halong-cruise-wp/includes/tour-validation.php
```

Expected: status route and stronger public-ready logic exist.

---

### Task 7: Next.js Validated CMS Consumer

**Files:**
- Create: `luxury-travel-next/lib/validated-cms.ts`
- Modify: `luxury-travel-next/lib/types.ts`
- Modify: `luxury-travel-next/lib/cms.ts`

- [ ] **Step 1: Extend CMS types**

In `luxury-travel-next/lib/types.ts`, add:

```ts
export type CmsValidation = {
  status?: 'synced' | 'partial' | 'broken' | 'outdated';
  completion?: number;
  seo_score?: number;
  content_score?: number;
  content_score_band?: 'blocked' | 'warning' | 'publish_ready' | 'featured_eligible';
  missing?: string[];
  warnings?: string[];
};
```

Inside `CmsItem['meta']`, add:

```ts
validation?: CmsValidation;
```

- [ ] **Step 2: Create safe parser**

Create `luxury-travel-next/lib/validated-cms.ts`:

```ts
import { CmsItem } from './types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80';

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function normalizeCmsItem(input: unknown): CmsItem | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Partial<CmsItem>;
  const title = asString(raw.title);
  const slug = asString(raw.slug);
  if (!title || !slug) return null;
  const meta = raw.meta && typeof raw.meta === 'object' ? raw.meta : {};
  return {
    id: raw.id ?? slug,
    type: asString(raw.type, 'unknown'),
    title,
    slug,
    excerpt: asString(raw.excerpt),
    content: asString(raw.content),
    featuredImage: asString(raw.featuredImage, FALLBACK_IMAGE),
    meta: {
      seo: meta.seo ?? {},
      translations: meta.translations ?? {},
      gallery: asArray<string>(meta.gallery).filter(Boolean),
      itinerary: asArray<Record<string, string>>(meta.itinerary),
      faq: asArray<{ question: string; answer: string }>(meta.faq),
      pricing: asArray<Record<string, string>>(meta.pricing),
      details: meta.details ?? {},
      validation: meta.validation ?? {},
    },
  };
}

export function normalizeCmsItems(input: unknown): CmsItem[] {
  if (!Array.isArray(input)) return [];
  return input.map(normalizeCmsItem).filter((item): item is CmsItem => Boolean(item));
}
```

- [ ] **Step 3: Use parser in CMS client**

Modify `luxury-travel-next/lib/cms.ts`:

```ts
import { normalizeCmsItem, normalizeCmsItems } from './validated-cms';
```

Update `getContent()`:

```ts
export async function getContent(type: keyof typeof fallback): Promise<CmsItem[]> {
  const remote = await fetchJson<unknown>(`/content/${type}`);
  const normalized = normalizeCmsItems(remote);
  return normalized.length ? normalized : fallback[type] ?? [];
}
```

Update `getSingle()`:

```ts
export async function getSingle(type: keyof typeof fallback, slug: string): Promise<CmsItem | null> {
  const remote = normalizeCmsItem(await fetchJson<unknown>(`/content/${type}/${slug}`));
  if (remote) return remote;
  return (fallback[type] ?? []).find((item) => item.slug === slug) ?? null;
}
```

- [ ] **Step 4: Verify frontend type safety**

Run:

```powershell
cd luxury-travel-next
npm run typecheck
```

Expected: `tsc --noEmit` exits with code 0.

---

### Task 8: Secure Next.js Revalidation Endpoint

**Files:**
- Create: `luxury-travel-next/app/api/revalidate/route.ts`
- Modify: `luxury-travel-next/.env.example`

- [ ] **Step 1: Create revalidation route**

Create `luxury-travel-next/app/api/revalidate/route.ts`:

```ts
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const hubPaths = ['/vietnam-tours', '/thailand-tours', '/cambodia-tours', '/laos-tours', '/multi-country-tours'];

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null) as { secret?: string; slug?: string; type?: string } | null;
  if (!payload || payload.secret !== process.env.NEXT_REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  revalidatePath('/');
  revalidatePath('/sitemap.xml');
  if (payload.type === 'tour' && payload.slug) {
    revalidatePath(`/${payload.slug}`);
    for (const path of hubPaths) {
      revalidatePath(path);
    }
  }
  return NextResponse.json({ revalidated: true, type: payload.type ?? 'unknown', slug: payload.slug ?? '' });
}
```

- [ ] **Step 2: Document env vars**

Add to `luxury-travel-next/.env.example`:

```env
NEXT_REVALIDATION_SECRET=change-me-to-a-long-random-secret
WORDPRESS_REVALIDATION_URL=https://your-next-domain.com/api/revalidate
```

- [ ] **Step 3: Verify build**

Run:

```powershell
cd luxury-travel-next
npm run build
```

Expected: Next.js compiles and lists `/api/revalidate` as a dynamic route.

---

### Task 9: Admin Settings For Revalidation

**Files:**
- Create: `halong-cruise-wp/includes/settings.php`
- Modify: `halong-cruise-wp/halong-cruise-headless.php`

- [ ] **Step 1: Create settings page**

Create `halong-cruise-wp/includes/settings.php`:

```php
<?php
if (!defined('ABSPATH')) {
    exit;
}

function hlt_register_settings_page(): void
{
    add_options_page('Travel OS Settings', 'Travel OS', 'manage_options', 'hlt-travel-os', 'hlt_render_settings_page');
    register_setting('hlt_travel_os_settings', 'hlt_next_revalidation_url', ['sanitize_callback' => 'esc_url_raw']);
    register_setting('hlt_travel_os_settings', 'hlt_next_revalidation_secret', ['sanitize_callback' => 'sanitize_text_field']);
}

function hlt_render_settings_page(): void
{
    echo '<div class="wrap"><h1>Travel OS Settings</h1><form method="post" action="options.php">';
    settings_fields('hlt_travel_os_settings');
    echo '<table class="form-table"><tr><th scope="row">Next.js revalidation URL</th><td><input class="regular-text" type="url" name="hlt_next_revalidation_url" value="' . esc_attr((string) get_option('hlt_next_revalidation_url', '')) . '" /></td></tr>';
    echo '<tr><th scope="row">Revalidation secret</th><td><input class="regular-text" type="password" name="hlt_next_revalidation_secret" value="' . esc_attr((string) get_option('hlt_next_revalidation_secret', '')) . '" /></td></tr></table>';
    submit_button('Save Travel OS Settings');
    echo '</form></div>';
}
```

- [ ] **Step 2: Wire settings page**

Add to `halong-cruise-headless.php`:

```php
require_once HLT_HEADLESS_PATH . 'includes/settings.php';
add_action('admin_menu', 'hlt_register_settings_page');
```

- [ ] **Step 3: Verify settings scan**

Run:

```powershell
rg -n "Travel OS Settings|hlt_next_revalidation_url|hlt_next_revalidation_secret" halong-cruise-wp
```

Expected: settings page and queue revalidation usage are present.

---

### Task 10: Documentation And Verification

**Files:**
- Modify: `halong-cruise-wp/README.md`
- Modify: `luxury-travel-next/README.md`

- [ ] **Step 1: Update WordPress README**

Add section to `halong-cruise-wp/README.md`:

```md
## Travel OS Enterprise Foundation

Travel OS adds workflow state, sync state, event logging, deterministic AI-ready content scoring and queue-based frontend revalidation.

Public tours require:
- workflow state `approved` or `published`
- sync state `clean`
- validation status `synced`
- content score `85+`

Set `Settings > Travel OS` with the Next.js revalidation URL and shared secret.
```

- [ ] **Step 2: Update Next README**

Add section to `luxury-travel-next/README.md`:

```md
## Validated CMS Rendering

The frontend consumes only normalized CMS payloads from `lib/validated-cms.ts`. WordPress can call `POST /api/revalidate` with `NEXT_REVALIDATION_SECRET` to revalidate changed tour pages, country hubs, home and sitemap.
```

- [ ] **Step 3: Run full frontend verification**

Run:

```powershell
cd luxury-travel-next
npm run governance:check
npm run typecheck
npm run lint
npm run build
npm audit
```

Expected:
- governance passes
- typecheck passes
- lint passes
- build passes
- audit reports `found 0 vulnerabilities`

- [ ] **Step 4: Run PHP compatibility scan**

Run:

```powershell
rg -n "str_starts_with|match \(" halong-cruise-wp
```

Expected: no results, so plugin remains safer for PHP 7.4+ WordPress installs.

If PHP CLI is installed, run:

```powershell
Get-ChildItem halong-cruise-wp -Recurse -Filter *.php | ForEach-Object { php -l $_.FullName }
```

Expected: every file reports `No syntax errors detected`.

- [ ] **Step 5: Produce no-commit checkpoint summary**

Report:
- files created
- files modified
- files deleted
- line counts for new files
- verification command results
- remaining risks, especially if PHP CLI is unavailable

Do not run `git commit`.

---

## Self-Review Notes
- Spec coverage: the plan covers source of truth, event sync, queue processing, AI governance, workflow, zero data drift, multilingual-safe validation through existing translation checks, Next.js safe rendering and ISR revalidation.
- Scope control: this implements Enterprise Foundation plus revalidation hooks. It does not add external Kafka, OpenAI calls or multi-tenant SaaS tables yet.
- Type consistency: sync state names are `clean`, `outdated`, `invalid`, `processing`, `failed`; workflow state names are `draft`, `in_review`, `ai_review_pending`, `approved`, `published`, `archived`; event statuses are `pending`, `processing`, `clean`, `invalid`, `failed`.
- No commit steps are included because the user explicitly requested no commits.
