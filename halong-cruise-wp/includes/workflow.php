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
    $state = sanitize_key((string) get_post_meta($post_id, '_hlt_workflow_state', true));
    $states = hlt_workflow_states();

    if (!isset($states[$state])) {
        return 'draft';
    }

    return $state;
}

function hlt_set_workflow_state(int $post_id, string $state): void
{
    $states = hlt_workflow_states();
    $new_state = sanitize_key($state);

    if (!isset($states[$new_state])) {
        return;
    }

    $old_state = hlt_get_workflow_state($post_id);
    update_post_meta($post_id, '_hlt_workflow_state', $new_state);

    if ($old_state !== $new_state && function_exists('hlt_record_sync_event')) {
        hlt_record_sync_event(
            'workflow.changed',
            'tour',
            $post_id,
            [
                'old' => $old_state,
                'new' => $new_state,
            ]
        );
    }
}

function hlt_workflow_state_requires_approval(string $state): bool
{
    return in_array($state, ['approved', 'published', 'archived'], true);
}

function hlt_current_user_can_set_workflow_state(int $post_id, string $state): bool
{
    if (!current_user_can('edit_post', $post_id)) {
        return false;
    }

    if (hlt_workflow_state_requires_approval($state)) {
        return current_user_can('hlt_approve_workflow') || current_user_can('manage_options');
    }

    return current_user_can('hlt_transition_workflow') || current_user_can('edit_post', $post_id);
}

function hlt_register_workflow_metabox(): void
{
    add_meta_box(
        'hlt_workflow_box',
        'Travel OS Workflow',
        'hlt_render_workflow_metabox',
        'hlt_tour',
        'side',
        'high'
    );
}

function hlt_render_workflow_metabox(WP_Post $post): void
{
    wp_nonce_field('hlt_save_workflow', 'hlt_workflow_nonce');
    $current_state = hlt_get_workflow_state((int) $post->ID);
    $states = hlt_workflow_states();
    ?>
    <p>
        <label for="hlt_workflow_state"><?php esc_html_e('State', 'hlt-headless'); ?></label>
    </p>
    <p>
        <select name="_hlt_workflow_state" id="hlt_workflow_state" style="width: 100%;">
            <?php foreach ($states as $state_key => $state_label) : ?>
                <option value="<?php echo esc_attr($state_key); ?>" <?php selected($current_state, $state_key); ?>>
                    <?php echo esc_html($state_label); ?>
                </option>
            <?php endforeach; ?>
        </select>
    </p>
    <p class="description">
        <?php esc_html_e('Public rendering requires Approved or Published plus clean sync and score 85+.', 'hlt-headless'); ?>
    </p>
    <?php
}

function hlt_save_workflow_state(int $post_id, WP_Post $post): void
{
    if ($post->post_type !== 'hlt_tour' || wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
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

    if (!isset($_POST['_hlt_workflow_state'])) {
        return;
    }

    $new_state = sanitize_key((string) wp_unslash($_POST['_hlt_workflow_state']));
    if (!hlt_current_user_can_set_workflow_state($post_id, $new_state)) {
        return;
    }

    hlt_set_workflow_state($post_id, $new_state);
}
