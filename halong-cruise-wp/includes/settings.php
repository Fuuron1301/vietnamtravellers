<?php
if (!defined('ABSPATH')) {
    exit;
}

function hlt_register_settings_page(): void
{
    add_options_page(
        'Travel OS Settings',
        'Travel OS',
        'manage_options',
        'hlt-travel-os',
        'hlt_render_settings_page'
    );
}

function hlt_register_travel_os_settings(): void
{
    register_setting(
        'hlt_travel_os_settings',
        'hlt_next_revalidation_url',
        ['sanitize_callback' => 'esc_url_raw']
    );

    register_setting(
        'hlt_travel_os_settings',
        'hlt_next_revalidation_secret',
        ['sanitize_callback' => 'hlt_sanitize_revalidation_secret']
    );

    register_setting(
        'hlt_travel_os_settings',
        'hlt_recaptcha_secret',
        ['sanitize_callback' => 'hlt_sanitize_revalidation_secret']
    );
}

function hlt_sanitize_revalidation_secret($value): string
{
    $value = sanitize_text_field((string) $value);
    if ($value === '') {
        return (string) get_option('hlt_next_revalidation_secret', '');
    }

    return $value;
}

function hlt_render_settings_page(): void
{
    $revalidation_url = (string) get_option('hlt_next_revalidation_url', '');
    $revalidation_secret = (string) get_option('hlt_next_revalidation_secret', '');
    $recaptcha_secret = (string) get_option('hlt_recaptcha_secret', '');
    $secret_placeholder = $revalidation_secret === '' ? '' : 'Saved secret, enter a new value to replace it';
    $recaptcha_placeholder = $recaptcha_secret === '' ? '' : 'Saved secret, enter a new value to replace it';
    ?>
    <div class="wrap">
        <h1>Travel OS Settings</h1>
        <form method="post" action="options.php">
            <?php settings_fields('hlt_travel_os_settings'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="hlt_next_revalidation_url">Revalidation URL</label></th>
                    <td>
                        <input
                            id="hlt_next_revalidation_url"
                            name="hlt_next_revalidation_url"
                            type="url"
                            class="regular-text"
                            value="<?php echo esc_attr($revalidation_url); ?>"
                        />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="hlt_next_revalidation_secret">Revalidation Secret</label></th>
                    <td>
                        <input
                            id="hlt_next_revalidation_secret"
                            name="hlt_next_revalidation_secret"
                            type="password"
                            class="regular-text"
                            value=""
                            placeholder="<?php echo esc_attr($secret_placeholder); ?>"
                            autocomplete="new-password"
                        />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="hlt_recaptcha_secret">reCAPTCHA Secret</label></th>
                    <td>
                        <input
                            id="hlt_recaptcha_secret"
                            name="hlt_recaptcha_secret"
                            type="password"
                            class="regular-text"
                            value=""
                            placeholder="<?php echo esc_attr($recaptcha_placeholder); ?>"
                            autocomplete="new-password"
                        />
                    </td>
                </tr>
            </table>
            <?php submit_button('Save Travel OS Settings'); ?>
        </form>
    </div>
    <?php
}
