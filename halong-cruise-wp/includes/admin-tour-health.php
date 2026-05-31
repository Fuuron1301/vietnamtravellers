<?php
if (!defined('ABSPATH')) {
    exit;
}

function hlt_register_tour_health_metabox(): void
{
    add_meta_box('hlt_tour_health', 'Tour Data Health Panel', 'hlt_render_tour_health_metabox', 'hlt_tour', 'side', 'high');
}

function hlt_render_tour_health_metabox(WP_Post $post): void
{
    $result = hlt_tour_store_validation($post->ID);
    $status = (string) $result['status'];
    $completion = (int) $result['completion'];
    $seo = (int) $result['seo_score'];
    $missing = (array) $result['missing'];
    $warnings = (array) $result['warnings'];
    $langs = (array) $result['language_status'];
    $color = esc_attr(hlt_sync_status_color($status));
    echo '<div class="hlt-health-panel">';
    echo '<p><span class="hlt-status-dot" style="background:' . $color . '"></span><strong>' . esc_html(hlt_sync_status_label($status)) . '</strong></p>';
    hlt_admin_meter('Completion', $completion);
    hlt_admin_meter('SEO score', $seo);
    echo '<p><strong>Languages</strong><br />';
    foreach (['vi' => 'VI', 'en' => 'EN', 'zh' => 'ZH'] as $key => $label) {
        $ok = !empty($langs[$key]);
        echo '<span class="hlt-lang ' . ($ok ? 'is-ok' : 'is-missing') . '">' . esc_html($label) . '</span> ';
    }
    echo '</p>';
    if ($missing) {
        echo '<p><strong>Missing fields</strong></p><ul class="hlt-health-list">';
        foreach ($missing as $field) {
            echo '<li>' . esc_html((string) $field) . '</li>';
        }
        echo '</ul>';
    }
    if ($warnings) {
        echo '<p><strong>Warnings</strong></p><ul class="hlt-health-list">';
        foreach ($warnings as $warning) {
            echo '<li>' . esc_html((string) $warning) . '</li>';
        }
        echo '</ul>';
    }
    $validate_url = wp_nonce_url(admin_url('admin-post.php?action=hlt_validate_tour&post_id=' . $post->ID), 'hlt_validate_tour_' . $post->ID);
    $autofill_url = wp_nonce_url(admin_url('admin-post.php?action=hlt_autofill_tour&post_id=' . $post->ID), 'hlt_autofill_tour_' . $post->ID);
    $seo_url = wp_nonce_url(admin_url('admin-post.php?action=hlt_generate_tour_seo&post_id=' . $post->ID), 'hlt_generate_tour_seo_' . $post->ID);
    $duplicate_url = wp_nonce_url(admin_url('admin-post.php?action=hlt_duplicate_localized_tour&post_id=' . $post->ID), 'hlt_duplicate_localized_tour_' . $post->ID);
    echo '<p class="hlt-health-actions">';
    echo '<a class="button button-primary" href="' . esc_url($validate_url) . '">Sync to Frontend Now</a> ';
    echo '<a class="button" href="' . esc_url($autofill_url) . '">Fix Missing Fields Auto-fill</a> ';
    echo '<a class="button" href="' . esc_url($seo_url) . '">Generate SEO Meta Suggestion</a> ';
    echo '<a class="button" href="' . esc_url($duplicate_url) . '">Duplicate Tour (localized)</a>';
    echo '</p></div>';
}

function hlt_admin_meter(string $label, int $value): void
{
    $value = max(0, min(100, $value));
    echo '<p><strong>' . esc_html($label) . '</strong> <span class="hlt-meter-value">' . esc_html((string) $value) . '%</span></p>';
    echo '<div class="hlt-meter"><span style="width:' . esc_attr((string) $value) . '%"></span></div>';
}

function hlt_tour_admin_columns(array $columns): array
{
    $new = [];
    foreach ($columns as $key => $label) {
        $new[$key] = $label;
        if ($key === 'title') {
            $new['hlt_thumb'] = 'Thumb';
            $new['hlt_country'] = 'Country';
            $new['hlt_duration'] = 'Duration';
            $new['hlt_price'] = 'Price range';
            $new['hlt_seo'] = 'SEO';
            $new['hlt_sync'] = 'Sync Status';
            $new['hlt_lang'] = 'Languages';
            $new['hlt_missing'] = 'Missing';
        }
    }
    return $new;
}

function hlt_render_tour_admin_column(string $column, int $post_id): void
{
    if (strpos($column, 'hlt_') === 0) {
        hlt_tour_store_validation($post_id);
    }
    $details = hlt_tour_read_details($post_id);
    if ($column === 'hlt_thumb') {
        echo get_the_post_thumbnail($post_id, [60, 45]) ?: '<span class="dashicons dashicons-format-image"></span>';
    } elseif ($column === 'hlt_country') {
        echo esc_html((string) ($details['country'] ?? ''));
    } elseif ($column === 'hlt_duration') {
        echo esc_html((string) ($details['duration'] ?? ''));
    } elseif ($column === 'hlt_price') {
        echo esc_html(hlt_tour_price_range($post_id));
    } elseif ($column === 'hlt_seo') {
        hlt_admin_compact_score((int) hlt_get_meta($post_id, '_hlt_seo_score', 0));
    } elseif ($column === 'hlt_sync') {
        $status = (string) hlt_get_meta($post_id, '_hlt_sync_status', 'broken');
        echo '<span class="hlt-status-dot" style="background:' . esc_attr(hlt_sync_status_color($status)) . '"></span>' . esc_html(hlt_sync_status_label($status));
        echo '<br /><small>' . esc_html((string) hlt_get_meta($post_id, '_hlt_last_sync_checked_at')) . '</small>';
    } elseif ($column === 'hlt_lang') {
        $langs = hlt_get_json_meta($post_id, '_hlt_language_status_json');
        foreach (['vi' => 'VI', 'en' => 'EN', 'zh' => 'ZH'] as $key => $label) {
            $ok = !empty($langs[$key]);
            echo '<span class="hlt-lang ' . ($ok ? 'is-ok' : 'is-missing') . '">' . esc_html($label) . '</span> ';
        }
    } elseif ($column === 'hlt_missing') {
        echo esc_html((string) hlt_get_meta($post_id, '_hlt_missing_fields_count', 0));
    }
}

function hlt_admin_compact_score(int $score): void
{
    $score = max(0, min(100, $score));
    echo '<span class="hlt-score">' . esc_html((string) $score) . '%</span>';
}

function hlt_tour_admin_filters(): void
{
    global $typenow;
    if ($typenow !== 'hlt_tour') {
        return;
    }
    $current_sync = sanitize_key((string) ($_GET['hlt_sync_status'] ?? ''));
    echo '<select name="hlt_sync_status"><option value="">All sync statuses</option>';
    foreach (['synced', 'partial', 'outdated', 'broken'] as $status) {
        echo '<option value="' . esc_attr($status) . '" ' . selected($current_sync, $status, false) . '>' . esc_html(hlt_sync_status_label($status)) . '</option>';
    }
    echo '</select>';

    $current_completion = sanitize_key((string) ($_GET['hlt_completion'] ?? ''));
    echo '<select name="hlt_completion"><option value="">All completion</option>';
    foreach (['complete' => 'Complete 100%', 'incomplete' => 'Incomplete', 'critical' => 'Critical <70%'] as $key => $label) {
        echo '<option value="' . esc_attr($key) . '" ' . selected($current_completion, $key, false) . '>' . esc_html($label) . '</option>';
    }
    echo '</select>';

    $current_lang = sanitize_key((string) ($_GET['hlt_language'] ?? ''));
    echo '<select name="hlt_language"><option value="">All languages</option>';
    foreach (['vi' => 'Missing VI', 'en' => 'Missing EN', 'zh' => 'Missing ZH'] as $key => $label) {
        echo '<option value="' . esc_attr($key) . '" ' . selected($current_lang, $key, false) . '>' . esc_html($label) . '</option>';
    }
    echo '</select>';
}

function hlt_filter_tour_admin_query(WP_Query $query): void
{
    global $pagenow;
    if (!is_admin() || $pagenow !== 'edit.php' || ($query->get('post_type') !== 'hlt_tour')) {
        return;
    }
    $meta_query = (array) $query->get('meta_query');
    $sync = sanitize_key((string) ($_GET['hlt_sync_status'] ?? ''));
    if ($sync) {
        $meta_query[] = ['key' => '_hlt_sync_status', 'value' => $sync];
    }
    $completion = sanitize_key((string) ($_GET['hlt_completion'] ?? ''));
    if ($completion === 'complete') {
        $meta_query[] = ['key' => '_hlt_completion_score', 'value' => 100, 'compare' => '>=', 'type' => 'NUMERIC'];
    } elseif ($completion === 'incomplete') {
        $meta_query[] = ['key' => '_hlt_completion_score', 'value' => 100, 'compare' => '<', 'type' => 'NUMERIC'];
    } elseif ($completion === 'critical') {
        $meta_query[] = ['key' => '_hlt_completion_score', 'value' => 70, 'compare' => '<', 'type' => 'NUMERIC'];
    }
    if ($meta_query) {
        $query->set('meta_query', $meta_query);
    }
    $language = sanitize_key((string) ($_GET['hlt_language'] ?? ''));
    if ($language && in_array($language, ['vi', 'en', 'zh'], true)) {
        $meta_query = (array) $query->get('meta_query');
        $meta_query[] = [
            'key' => '_hlt_language_status_json',
            'value' => '"' . $language . '":false',
            'compare' => 'LIKE',
        ];
        $query->set('meta_query', $meta_query);
    }
}

function hlt_admin_enqueue_health_assets(string $hook): void
{
    $screen = get_current_screen();
    if (!$screen || !in_array($screen->post_type, ['hlt_tour', 'hlt_cruise'], true)) {
        return;
    }
    wp_enqueue_media();
    $css = '.hlt-status-dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;vertical-align:middle}.hlt-meter{height:8px;background:#f0f0f1;border-radius:999px;overflow:hidden}.hlt-meter span{display:block;height:100%;background:#2271b1}.hlt-meter-value{float:right;color:#646970}.hlt-lang{display:inline-block;padding:1px 6px;border-radius:999px;font-size:11px;border:1px solid #c3c4c7}.hlt-lang.is-ok{background:#edfaef;color:#008a20;border-color:#8ed69e}.hlt-lang.is-missing{background:#fcf0f1;color:#b32d2e;border-color:#ffb8bd}.hlt-health-list{margin-left:18px;list-style:disc}.hlt-health-actions .button{margin:0 4px 6px 0}.hlt-score{font-weight:600}.hlt-field-warning{border-color:#d63638!important;box-shadow:0 0 0 1px #d63638!important}.hlt-json-warning{display:block;color:#b32d2e;margin-top:4px}.hlt-repeater{margin:18px 0;padding:12px;border:1px solid #dcdcde;background:#fff}.hlt-repeater td{vertical-align:top}.hlt-preview{margin-top:18px;padding:12px;background:#f6f7f7;border:1px solid #dcdcde}';
    wp_add_inline_style('common', $css);
    $js = "document.addEventListener('DOMContentLoaded',function(){function syncRepeater(box){var target=box.getAttribute('data-target');var hidden=document.querySelector('[data-json-key=\"'+target+'\"]');if(!hidden)return;var rows=[].slice.call(box.querySelectorAll('tbody tr')).map(function(row){var item={};row.querySelectorAll('.hlt-repeater-field').forEach(function(input){if(input.value.trim())item[input.getAttribute('data-field')]=input.value.trim();});return item;}).filter(function(item){return Object.keys(item).length>0;});hidden.value=JSON.stringify(rows);}function syncDetails(){var hidden=document.querySelector('[data-json-key=\"_hlt_details_json\"]');if(!hidden)return;var item={};document.querySelectorAll('.hlt-detail-field').forEach(function(input){var key=input.getAttribute('data-detail-key');var value=input.value.trim();if(['highlights','includes','excludes'].indexOf(key)>=0){item[key]=value?value.split('\\n').map(function(v){return v.trim();}).filter(Boolean):[];}else{item[key]=value;}});hidden.value=JSON.stringify(item);}function syncTranslations(){var hidden=document.querySelector('[data-json-key=\"_hlt_translations_json\"]');if(!hidden)return;var data={};document.querySelectorAll('.hlt-language-fieldset').forEach(function(set){var locale=set.getAttribute('data-locale');data[locale]={};set.querySelectorAll('.hlt-translation-field').forEach(function(input){data[locale][input.getAttribute('data-field')]=input.value.trim();});});hidden.value=JSON.stringify(data);}document.querySelectorAll('.hlt-repeater').forEach(function(box){box.addEventListener('input',function(){syncRepeater(box);});box.addEventListener('click',function(event){if(event.target.classList.contains('hlt-media-gallery')&&window.wp&&wp.media){var frame=wp.media({title:'Select gallery images',multiple:true,library:{type:'image'}});frame.on('select',function(){var body=box.querySelector('tbody');body.innerHTML='';frame.state().get('selection').each(function(item){var url=item.toJSON().url;var row=document.createElement('tr');row.innerHTML='<td><input class=\"widefat hlt-repeater-field\" data-field=\"url\" value=\"'+url.replace(/\"/g,'&quot;')+'\" /></td><td><button type=\"button\" class=\"button hlt-remove-row\">Remove</button></td>';body.appendChild(row);});syncRepeater(box);});frame.open();}if(event.target.classList.contains('hlt-add-row')){var body=box.querySelector('tbody');var first=body.querySelector('tr');var clone=first.cloneNode(true);clone.querySelectorAll('input').forEach(function(input){input.value='';});body.appendChild(clone);syncRepeater(box);}if(event.target.classList.contains('hlt-remove-row')){var rows=box.querySelectorAll('tbody tr');if(rows.length>1){event.target.closest('tr').remove();syncRepeater(box);}}});syncRepeater(box);});document.querySelectorAll('.hlt-detail-field').forEach(function(el){el.addEventListener('input',syncDetails);});document.querySelectorAll('.hlt-translation-field').forEach(function(el){el.addEventListener('input',syncTranslations);});syncDetails();syncTranslations();document.querySelectorAll('textarea[name$=\"_json\"]').forEach(function(el){function check(){var next=el.nextElementSibling;if(next&&next.classList.contains('hlt-json-warning'))next.remove();el.classList.remove('hlt-field-warning');if(!el.value.trim())return;try{JSON.parse(el.value)}catch(e){el.classList.add('hlt-field-warning');var warn=document.createElement('span');warn.className='hlt-json-warning';warn.textContent='Invalid JSON: '+e.message;el.after(warn)}};el.addEventListener('input',check);check();});});";
    wp_add_inline_script('common', $js);
}
