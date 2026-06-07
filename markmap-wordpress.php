<?php
/**
 * Plugin Name: Markmap WordPress
 * Description: Render Markdown files as interactive Markmap mindmaps or generate a visual sitemap from WordPress content.
 * Version: 0.1.2
 * Author: bwbyword
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: markmap-wordpress
 *
 * Markmap WordPress is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 2 of the License, or any later version.
 */

if (!defined('ABSPATH')) {
    exit;
}

final class Markmap_WordPress_Plugin {
    private const VERSION = '0.1.2';
    private const REST_NAMESPACE = 'markmap-wordpress/v1';

    public function __construct() {
        add_action('init', [$this, 'register_shortcodes']);
        add_action('wp_enqueue_scripts', [$this, 'register_assets']);
        add_action('elementor/frontend/after_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('elementor/editor/after_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('admin_menu', [$this, 'register_admin_page']);
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), [$this, 'add_plugin_action_links']);
        add_action('rest_api_init', [$this, 'register_rest_routes']);
    }

    public function register_shortcodes(): void {
        add_shortcode('markmap_wordpress', [$this, 'render_shortcode']);
    }

    public function register_admin_page(): void {
        add_options_page(
            __('Markmap WordPress', 'markmap-wordpress'),
            __('Markmap WordPress', 'markmap-wordpress'),
            'manage_options',
            'markmap-wordpress',
            [$this, 'render_admin_page']
        );
    }

    /**
     * @param string[] $links
     * @return string[]
     */
    public function add_plugin_action_links(array $links): array {
        $settings_link = sprintf(
            '<a href="%s">%s</a>',
            esc_url(admin_url('options-general.php?page=markmap-wordpress')),
            esc_html__('Usage', 'markmap-wordpress')
        );

        array_unshift($links, $settings_link);

        return $links;
    }

    public function register_assets(): void {
        wp_register_style(
            'markmap-wordpress',
            plugin_dir_url(__FILE__) . 'assets/markmap-wordpress.css',
            [],
            self::VERSION
        );

        wp_register_script(
            'markmap-wordpress-d3',
            plugin_dir_url(__FILE__) . 'assets/vendor/d3.min.js',
            [],
            '7.9.0',
            true
        );

        wp_register_script(
            'markmap-view',
            plugin_dir_url(__FILE__) . 'assets/vendor/markmap-view.js',
            ['markmap-wordpress-d3'],
            '0.18.12',
            true
        );

        wp_register_script(
            'markmap-lib',
            plugin_dir_url(__FILE__) . 'assets/vendor/markmap-lib.iife.js',
            ['markmap-view'],
            '0.18.12',
            true
        );

        wp_register_script(
            'markmap-wordpress',
            plugin_dir_url(__FILE__) . 'assets/markmap-wordpress.js',
            ['markmap-lib'],
            self::VERSION,
            true
        );

        wp_localize_script('markmap-wordpress', 'MarkmapWordPress', [
            'restUrl' => esc_url_raw(rest_url(self::REST_NAMESPACE . '/sitemap')),
            'nonce' => wp_create_nonce('wp_rest'),
        ]);
    }

    public function enqueue_assets(): void {
        if (!wp_script_is('markmap-wordpress', 'registered')) {
            $this->register_assets();
        }

        wp_enqueue_style('markmap-wordpress');
        wp_enqueue_script('markmap-wordpress');
    }

    public function render_admin_page(): void {
        if (!current_user_can('manage_options')) {
            return;
        }

        ?>
        <div class="wrap">
            <h1><?php esc_html_e('Markmap WordPress Usage', 'markmap-wordpress'); ?></h1>
            <p>
                <?php esc_html_e('Use the shortcode below to render Markdown mindmaps or visual sitemaps inside WordPress pages, posts, and Elementor Shortcode widgets.', 'markmap-wordpress'); ?>
            </p>

            <h2><?php esc_html_e('Quick Start', 'markmap-wordpress'); ?></h2>
            <p><?php esc_html_e('Add this shortcode to any page or post to show the interactive editor, upload control, and mindmap canvas.', 'markmap-wordpress'); ?></p>
            <?php $this->render_code_example('[markmap_wordpress]'); ?>

            <h2><?php esc_html_e('Read-Only Markdown Embed', 'markmap-wordpress'); ?></h2>
            <p><?php esc_html_e('Place Markdown between the opening and closing shortcode tags to show only the visual mindmap canvas with subtle zoom, fit, and fullscreen controls.', 'markmap-wordpress'); ?></p>
            <?php $this->render_code_example('[markmap_wordpress mode="markdown" height="70vh"]
# Product Plan

## Discovery
- Interviews
- Analytics

## Build
- Prototype
- Launch
[/markmap_wordpress]'); ?>

            <h2><?php esc_html_e('Visual Sitemap', 'markmap-wordpress'); ?></h2>
            <p><?php esc_html_e('Use sitemap mode to generate a mindmap from published WordPress content. The types option accepts comma-separated public post types.', 'markmap-wordpress'); ?></p>
            <?php $this->render_code_example('[markmap_wordpress mode="sitemap" height="70vh" types="page,post"]'); ?>
            <?php $this->render_code_example('[markmap_wordpress mode="sitemap" types="page,post,product"]'); ?>

            <h2><?php esc_html_e('Shortcode Options', 'markmap-wordpress'); ?></h2>
            <table class="widefat striped" style="max-width: 900px;">
                <thead>
                    <tr>
                        <th><?php esc_html_e('Option', 'markmap-wordpress'); ?></th>
                        <th><?php esc_html_e('Values', 'markmap-wordpress'); ?></th>
                        <th><?php esc_html_e('Description', 'markmap-wordpress'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>mode</code></td>
                        <td><code>markdown</code>, <code>sitemap</code></td>
                        <td><?php esc_html_e('Chooses whether the plugin renders Markdown input or a generated WordPress sitemap.', 'markmap-wordpress'); ?></td>
                    </tr>
                    <tr>
                        <td><code>height</code></td>
                        <td><code>640px</code>, <code>70vh</code>, <code>100%</code></td>
                        <td><?php esc_html_e('Sets the mindmap canvas height. The typo-compatible alias heigh is also accepted.', 'markmap-wordpress'); ?></td>
                    </tr>
                    <tr>
                        <td><code>types</code></td>
                        <td><code>page,post</code></td>
                        <td><?php esc_html_e('Controls which public post types are included in sitemap mode.', 'markmap-wordpress'); ?></td>
                    </tr>
                </tbody>
            </table>

            <h2><?php esc_html_e('Elementor', 'markmap-wordpress'); ?></h2>
            <p>
                <?php esc_html_e('Use the Shortcode widget and paste any Markmap WordPress shortcode. Elementor usually refreshes shortcode previews after you click Apply; after the preview updates, the mindmap should render inside the editor.', 'markmap-wordpress'); ?>
            </p>

            <h2><?php esc_html_e('Troubleshooting', 'markmap-wordpress'); ?></h2>
            <ul style="list-style: disc; padding-left: 20px;">
                <li><?php esc_html_e('If new controls do not work immediately, hard refresh the page or clear any WordPress/page-builder cache.', 'markmap-wordpress'); ?></li>
                <li><?php esc_html_e('The visual renderer ships with local d3, markmap-view, and markmap-lib browser assets, so it does not load executable code from a public CDN.', 'markmap-wordpress'); ?></li>
                <li><?php esc_html_e('For Elementor, click Apply in the Shortcode widget after changing the shortcode content.', 'markmap-wordpress'); ?></li>
            </ul>

            <h2><?php esc_html_e('Standalone Plugin Notes', 'markmap-wordpress'); ?></h2>
            <ul style="list-style: disc; padding-left: 20px;">
                <li><?php esc_html_e('The WordPress plugin wrapper is licensed as GPLv2 or later for WordPress.org compatibility.', 'markmap-wordpress'); ?></li>
                <li><?php esc_html_e('D3 and Markmap browser assets are bundled locally. Public pages do not need to load executable code from public CDNs.', 'markmap-wordpress'); ?></li>
                <li><?php esc_html_e('Third-party credits and license notices are included in THIRD-PARTY-NOTICES.md and the licenses directory.', 'markmap-wordpress'); ?></li>
                <li><?php esc_html_e('The plugin does not add a public powered-by link. Upstream documentation links are shown only on this admin usage page.', 'markmap-wordpress'); ?></li>
            </ul>

            <h2><?php esc_html_e('Upstream Markmap', 'markmap-wordpress'); ?></h2>
            <p>
                <?php esc_html_e('The core Markdown-to-mindmap engine comes from the upstream Markmap project.', 'markmap-wordpress'); ?>
                <a href="https://markmap.js.org/docs" target="_blank" rel="noreferrer noopener"><?php esc_html_e('Read the Markmap docs', 'markmap-wordpress'); ?></a>
                <?php esc_html_e('or', 'markmap-wordpress'); ?>
                <a href="https://markmap.js.org/repl" target="_blank" rel="noreferrer noopener"><?php esc_html_e('try the Markmap playground', 'markmap-wordpress'); ?></a>.
            </p>
        </div>
        <?php
    }

    public function register_rest_routes(): void {
        register_rest_route(self::REST_NAMESPACE, '/sitemap', [
            'methods' => 'GET',
            'callback' => [$this, 'get_sitemap'],
            'permission_callback' => '__return_true',
            'args' => [
                'types' => [
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                    'default' => 'page,post',
                ],
            ],
        ]);
    }

    public function render_shortcode($atts, ?string $content = null): string {
        $atts = shortcode_atts(
            [
                'height' => '640px',
                'heigh' => '',
                'mode' => 'markdown',
                'types' => 'page,post',
            ],
            $atts,
            'markmap_wordpress'
        );

        $mode = in_array($atts['mode'], ['markdown', 'sitemap'], true) ? $atts['mode'] : 'markdown';
        $types = implode(',', $this->normalize_post_types((string) $atts['types']));
        $height_attr = $atts['heigh'] !== '' ? $atts['heigh'] : $atts['height'];
        $height = $this->sanitize_css_size((string) $height_attr);
        $markdown_content = $this->normalize_markdown_content($content);
        $is_view_only = $mode === 'markdown' && $markdown_content !== '';

        $this->enqueue_assets();

        $instance_id = wp_unique_id('markmap-wordpress-');

        ob_start();
        ?>
        <div
            id="<?php echo esc_attr($instance_id); ?>"
            class="markmap-wordpress<?php echo $is_view_only ? ' markmap-wordpress--view-only' : ''; ?>"
            data-mode="<?php echo esc_attr($mode); ?>"
            data-types="<?php echo esc_attr($types); ?>"
            style="--markmap-wordpress-height: <?php echo esc_attr($height); ?>;"
        >
            <?php if ($is_view_only) : ?>
                <script type="application/json" class="markmap-wordpress__source"><?php echo wp_json_encode($markdown_content, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?></script>
            <?php endif; ?>
            <?php if (!$is_view_only) : ?>
            <div class="markmap-wordpress__toolbar" role="group" aria-label="<?php esc_attr_e('Mindmap source', 'markmap-wordpress'); ?>">
                <button class="markmap-wordpress__mode is-active" type="button" data-mode="markdown">
                    <?php esc_html_e('Markdown', 'markmap-wordpress'); ?>
                </button>
                <button class="markmap-wordpress__mode" type="button" data-mode="sitemap">
                    <?php esc_html_e('Sitemap', 'markmap-wordpress'); ?>
                </button>
                <label class="markmap-wordpress__file">
                    <span><?php esc_html_e('Open .md', 'markmap-wordpress'); ?></span>
                    <input type="file" accept=".md,.markdown,text/markdown,text/plain">
                </label>
                <button class="markmap-wordpress__fit" type="button">
                    <?php esc_html_e('Fit', 'markmap-wordpress'); ?>
                </button>
                <button class="markmap-wordpress__zoom-out" type="button">
                    <?php esc_html_e('Zoom out', 'markmap-wordpress'); ?>
                </button>
                <button class="markmap-wordpress__zoom-in" type="button">
                    <?php esc_html_e('Zoom in', 'markmap-wordpress'); ?>
                </button>
            </div>
            <div class="markmap-wordpress__editor" data-panel="markdown">
                <textarea spellcheck="false"># Mindmap

## Paste Markdown
- Headings become branches
- Lists become child nodes

## Or Upload
- Choose a `.md` file above
- The mindmap updates instantly</textarea>
            </div>
            <?php endif; ?>
            <div class="markmap-wordpress__status" aria-live="polite"></div>
            <svg class="markmap-wordpress__svg" role="img" aria-label="<?php esc_attr_e('Interactive mindmap', 'markmap-wordpress'); ?>"></svg>
            <?php if ($is_view_only) : ?>
                <div class="markmap-wordpress__canvas-controls" role="group" aria-label="<?php esc_attr_e('Mindmap controls', 'markmap-wordpress'); ?>">
                    <button class="markmap-wordpress__icon-button markmap-wordpress__zoom-out" type="button" aria-label="<?php esc_attr_e('Zoom out', 'markmap-wordpress'); ?>">
                        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                            <path d="M5 12h14"></path>
                        </svg>
                    </button>
                    <button class="markmap-wordpress__icon-button markmap-wordpress__fit" type="button" aria-label="<?php esc_attr_e('Fit mindmap', 'markmap-wordpress'); ?>">
                        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                            <path d="M16 3h3a2 2 0 0 1 2 2v3"></path>
                            <path d="M21 16v3a2 2 0 0 1-2 2h-3"></path>
                            <path d="M8 21H5a2 2 0 0 1-2-2v-3"></path>
                            <path d="M9 9h6v6H9z"></path>
                        </svg>
                    </button>
                    <button class="markmap-wordpress__icon-button markmap-wordpress__zoom-in" type="button" aria-label="<?php esc_attr_e('Zoom in', 'markmap-wordpress'); ?>">
                        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                            <path d="M12 5v14"></path>
                            <path d="M5 12h14"></path>
                        </svg>
                    </button>
                    <button class="markmap-wordpress__icon-button markmap-wordpress__fullscreen" type="button" aria-label="<?php esc_attr_e('Toggle fullscreen', 'markmap-wordpress'); ?>">
                        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                            <path d="M16 3h3a2 2 0 0 1 2 2v3"></path>
                            <path d="M21 16v3a2 2 0 0 1-2 2h-3"></path>
                            <path d="M8 21H5a2 2 0 0 1-2-2v-3"></path>
                        </svg>
                    </button>
                </div>
            <?php endif; ?>
        </div>
        <?php

        return ob_get_clean();
    }

    public function get_sitemap(WP_REST_Request $request): WP_REST_Response {
        $types = $this->normalize_post_types((string) $request->get_param('types'));
        $markdown = ['# ' . wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES)];

        foreach ($types as $type) {
            $post_type = get_post_type_object($type);

            if (!$post_type || !$post_type->public) {
                continue;
            }

            $posts = get_posts([
                'post_type' => $type,
                'post_status' => 'publish',
                'posts_per_page' => 300,
                'orderby' => $post_type->hierarchical ? 'menu_order title' : 'date',
                'order' => $post_type->hierarchical ? 'ASC' : 'DESC',
                'no_found_rows' => true,
            ]);

            if (!$posts) {
                continue;
            }

            $markdown[] = '';
            $markdown[] = '## ' . $post_type->labels->name;

            if ($post_type->hierarchical) {
                $markdown = array_merge($markdown, $this->format_hierarchical_posts($posts));
            } else {
                foreach ($posts as $post) {
                    $markdown[] = '- [' . $this->escape_markdown_link_text(get_the_title($post)) . '](' . get_permalink($post) . ')';
                }
            }
        }

        return new WP_REST_Response([
            'markdown' => implode("\n", $markdown),
            'types' => $types,
        ]);
    }

    /**
     * @param WP_Post[] $posts
     * @return string[]
     */
    private function format_hierarchical_posts(array $posts, int $parent = 0, int $depth = 0): array {
        $lines = [];

        foreach ($posts as $post) {
            if ((int) $post->post_parent !== $parent) {
                continue;
            }

            $indent = str_repeat('  ', $depth);
            $lines[] = $indent . '- [' . $this->escape_markdown_link_text(get_the_title($post)) . '](' . get_permalink($post) . ')';
            $lines = array_merge($lines, $this->format_hierarchical_posts($posts, (int) $post->ID, $depth + 1));
        }

        return $lines;
    }

    /**
     * @return string[]
     */
    private function normalize_post_types(string $types): array {
        $type_names = array_filter(array_map('trim', explode(',', $types)));
        $public_types = get_post_types(['public' => true], 'names');
        $allowed = array_values(array_intersect($type_names, $public_types));

        return $allowed ?: ['page', 'post'];
    }

    private function sanitize_css_size(string $size): string {
        $size = trim($size);

        if (preg_match('/^\d+(\.\d+)?(px|rem|em|vh|vw|%)$/', $size)) {
            return $size;
        }

        return '640px';
    }

    private function render_code_example(string $code): void {
        ?>
        <pre style="background: #fff; border: 1px solid #c3c4c7; border-radius: 4px; max-width: 900px; overflow: auto; padding: 12px;"><code><?php echo esc_html($code); ?></code></pre>
        <?php
    }

    private function normalize_markdown_content(?string $content): string {
        if ($content === null) {
            return '';
        }

        $content = html_entity_decode($content, ENT_QUOTES | ENT_HTML5, get_bloginfo('charset'));
        $content = preg_replace('/<br\s*\/?>/i', "\n", $content);
        $content = preg_replace('/<\/(div|li|h[1-6])>\s*/i', "\n", $content);
        $content = preg_replace('/<\/p>\s*<p>/i', "\n\n", $content);
        $content = preg_replace('/^\s*<p>|<\/p>\s*$/i', '', $content);
        $content = wp_strip_all_tags($content);
        $content = preg_replace("/\r\n?/", "\n", $content);
        $content = preg_replace("/\n{3,}/", "\n\n", $content);

        return trim($content);
    }

    private function escape_markdown_link_text(string $text): string {
        $text = wp_strip_all_tags(wp_specialchars_decode($text, ENT_QUOTES));

        return str_replace([']', '['], ['\]', '\['], $text);
    }
}

new Markmap_WordPress_Plugin();
