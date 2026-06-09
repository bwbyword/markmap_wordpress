<?php
/**
 * Plugin Name: Baiwei Markdown Mindmap
 * Description: Render Markdown files as interactive mindmaps or generate a visual sitemap from site content.
 * Version: 0.1.24
 * Author: baiwei
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: baiwei-markdown-mindmap
 *
 * Baiwei Markdown Mindmap is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 2 of the License, or any later version.
 */

if (!defined('ABSPATH')) {
    exit;
}

final class Baiwei_Markdown_Mindmap_Plugin {
    private const VERSION = '0.1.24';
    private const REST_NAMESPACE = 'baiwei-markdown-mindmap/v1';
    private static ?self $instance = null;

    public function __construct() {
        self::$instance = $this;

        add_action('init', [$this, 'register_shortcodes']);
        add_action('wp_enqueue_scripts', [$this, 'register_assets']);
        add_action('elementor/frontend/after_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('elementor/editor/after_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('elementor/elements/categories_registered', [$this, 'register_elementor_category']);
        add_action('elementor/widgets/register', [$this, 'register_elementor_widgets']);
        add_action('admin_menu', [$this, 'register_admin_page']);
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), [$this, 'add_plugin_action_links']);
        add_action('rest_api_init', [$this, 'register_rest_routes']);
    }

    public static function instance(): self {
        if (!self::$instance) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function register_shortcodes(): void {
        add_shortcode('baiwei_markdown_mindmap', [$this, 'render_shortcode']);
    }

    public function register_elementor_category($elements_manager): void {
        if (!method_exists($elements_manager, 'add_category')) {
            return;
        }

        $elements_manager->add_category(
            'baiwei-markdown-mindmap',
            [
                'title' => __('Baiwei Markdown', 'baiwei-markdown-mindmap'),
                'icon' => 'fa fa-sitemap',
            ]
        );
    }

    public function register_elementor_widgets($widgets_manager): void {
        if (!class_exists('\Elementor\Widget_Base')) {
            return;
        }

        $this->register_assets();

        if (!class_exists('Baiwei_Markdown_Mindmap_Elementor_Widget')) {
            require_once __DIR__ . '/includes/class-baiwei-markdown-mindmap-elementor-widget.php';
        }

        if (method_exists($widgets_manager, 'register')) {
            $widgets_manager->register(new \Baiwei_Markdown_Mindmap_Elementor_Widget());
            return;
        }

        if (method_exists($widgets_manager, 'register_widget_type')) {
            $widgets_manager->register_widget_type(new \Baiwei_Markdown_Mindmap_Elementor_Widget());
        }
    }

    public function register_admin_page(): void {
        add_options_page(
            __('Baiwei Markdown Mindmap', 'baiwei-markdown-mindmap'),
            __('Baiwei Markdown Mindmap', 'baiwei-markdown-mindmap'),
            'manage_options',
            'baiwei-markdown-mindmap',
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
            esc_url(admin_url('options-general.php?page=baiwei-markdown-mindmap')),
            esc_html__('Usage', 'baiwei-markdown-mindmap')
        );

        array_unshift($links, $settings_link);

        return $links;
    }

    public function register_assets(): void {
        wp_register_style(
            'baiwei-markdown-mindmap',
            plugin_dir_url(__FILE__) . 'assets/baiwei-markdown-mindmap.css',
            [],
            self::VERSION
        );

        wp_register_script(
            'baiwei-markdown-mindmap-d3',
            plugin_dir_url(__FILE__) . 'assets/vendor/d3.min.js',
            [],
            '7.9.0',
            true
        );

        wp_register_script(
            'markmap-view',
            plugin_dir_url(__FILE__) . 'assets/vendor/markmap-view.js',
            ['baiwei-markdown-mindmap-d3'],
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
            'baiwei-markdown-mindmap',
            plugin_dir_url(__FILE__) . 'assets/baiwei-markdown-mindmap.js',
            ['markmap-lib'],
            self::VERSION,
            true
        );

        wp_localize_script('baiwei-markdown-mindmap', 'BaiweiMarkdownMindmap', [
            'restUrl' => esc_url_raw(rest_url(self::REST_NAMESPACE . '/sitemap')),
            'nonce' => wp_create_nonce('wp_rest'),
        ]);
    }

    public function enqueue_assets(): void {
        if (!wp_script_is('baiwei-markdown-mindmap', 'registered')) {
            $this->register_assets();
        }

        wp_enqueue_style('baiwei-markdown-mindmap');
        wp_enqueue_script('baiwei-markdown-mindmap');
    }

    public function render_admin_page(): void {
        if (!current_user_can('manage_options')) {
            return;
        }

        ?>
        <div class="wrap">
            <div style="align-items: center; display: flex; gap: 18px; margin: 18px 0 24px; max-width: 900px;">
                <img
                    src="<?php echo esc_url(plugin_dir_url(__FILE__) . 'assets/logo.png'); ?>"
                    alt="<?php esc_attr_e('Baiwei Markdown Mindmap logo', 'baiwei-markdown-mindmap'); ?>"
                    width="96"
                    height="96"
                    style="border-radius: 20px; height: 96px; object-fit: contain; width: 96px;"
                >
                <div>
                    <h1 style="margin-bottom: 8px;"><?php esc_html_e('Baiwei Markdown Mindmap Usage', 'baiwei-markdown-mindmap'); ?></h1>
                    <p style="font-size: 15px; margin: 0;">
                        <?php esc_html_e('Use the shortcode below to render Markdown mindmaps or visual sitemaps inside WordPress pages, posts, and Elementor layouts.', 'baiwei-markdown-mindmap'); ?>
                    </p>
                </div>
            </div>

            <h2><?php esc_html_e('Quick Start', 'baiwei-markdown-mindmap'); ?></h2>
            <p><?php esc_html_e('Add this shortcode to any page or post to show the interactive editor, upload control, and mindmap canvas.', 'baiwei-markdown-mindmap'); ?></p>
            <?php $this->render_code_example('[baiwei_markdown_mindmap]'); ?>

            <h2><?php esc_html_e('Read-Only Markdown Embed', 'baiwei-markdown-mindmap'); ?></h2>
            <p><?php esc_html_e('Place Markdown between the opening and closing shortcode tags to show only the visual mindmap canvas with subtle zoom, fit, and fullscreen controls.', 'baiwei-markdown-mindmap'); ?></p>
            <?php $this->render_code_example('[baiwei_markdown_mindmap mode="markdown" height="70vh"]
# Product Plan

## Discovery
- Interviews
- Analytics

## Build
- Prototype
- Launch
[/baiwei_markdown_mindmap]'); ?>
            <?php $this->render_code_example('[baiwei_markdown_mindmap mode="markdown" default_view="vertical" height="70vh"]
# Website Plan

## Homepage
- [brick][hero] Hero
- [brick][features] Features

## Contact
- [brick][form] Contact Form
[/baiwei_markdown_mindmap]'); ?>

            <h2><?php esc_html_e('Visual Sitemap', 'baiwei-markdown-mindmap'); ?></h2>
            <p><?php esc_html_e('Use sitemap mode to generate a mindmap from published WordPress content. The types option accepts comma-separated public post types.', 'baiwei-markdown-mindmap'); ?></p>
            <?php $this->render_code_example('[baiwei_markdown_mindmap mode="sitemap" height="70vh" types="page,post"]'); ?>
            <?php $this->render_code_example('[baiwei_markdown_mindmap mode="sitemap" types="page,post,product"]'); ?>

            <h2><?php esc_html_e('Content Bricks', 'baiwei-markdown-mindmap'); ?></h2>
            <p><?php esc_html_e('Add content bricks as indented list items under a page or section. Normal view shows a brick count badge on the parent node; Bird\'s Eye View expands all brick lists as stackable CSS wireframe blocks.', 'baiwei-markdown-mindmap'); ?></p>
            <?php $this->render_code_example('# Website Plan

## Homepage
- [brick][header] Header
- [brick][hero] Hero
- [brick][features] Services
- [brick][text] About

## Contact
- [brick][form] Contact Form
- [brick][footer] Footer'); ?>
            <p><?php esc_html_e('In Bird\'s Eye View, brick blocks can be moved up or down, dragged within the same stack, or removed. The Markdown source is updated with the new brick order. Use the brick style toggle to switch between wireframe cards and the original text list view.', 'baiwei-markdown-mindmap'); ?></p>
            <p><?php esc_html_e('Common brick tags include header, hero, image, slider, text, video, list, features, cards, form, map, table, chart, faq, accordion, cta, subscribe, footer, and more. Unknown tags still render with a generic text wireframe.', 'baiwei-markdown-mindmap'); ?></p>

            <h2><?php esc_html_e('Shortcode Options', 'baiwei-markdown-mindmap'); ?></h2>
            <table class="widefat striped" style="max-width: 900px;">
                <thead>
                    <tr>
                        <th><?php esc_html_e('Option', 'baiwei-markdown-mindmap'); ?></th>
                        <th><?php esc_html_e('Values', 'baiwei-markdown-mindmap'); ?></th>
                        <th><?php esc_html_e('Description', 'baiwei-markdown-mindmap'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>mode</code></td>
                        <td><code>markdown</code>, <code>sitemap</code></td>
                        <td><?php esc_html_e('Chooses whether the plugin renders Markdown input or a generated WordPress sitemap.', 'baiwei-markdown-mindmap'); ?></td>
                    </tr>
                    <tr>
                        <td><code>height</code></td>
                        <td><code>640px</code>, <code>70vh</code>, <code>100%</code></td>
                        <td><?php esc_html_e('Sets the mindmap canvas height. The typo-compatible alias heigh is also accepted.', 'baiwei-markdown-mindmap'); ?></td>
                    </tr>
                    <tr>
                        <td><code>types</code></td>
                        <td><code>page,post</code></td>
                        <td><?php esc_html_e('Controls which public post types are included in sitemap mode.', 'baiwei-markdown-mindmap'); ?></td>
                    </tr>
                    <tr>
                        <td><code>planning</code></td>
                        <td><code>structure-first</code>, <code>mainpage-first</code></td>
                        <td><?php esc_html_e('Controls whether users plan the hierarchy first or prioritize the root page content bricks first.', 'baiwei-markdown-mindmap'); ?></td>
                    </tr>
                    <tr>
                        <td><code>birdseye</code></td>
                        <td><code>true</code>, <code>false</code></td>
                        <td><?php esc_html_e('Shows all content brick lists at once for a full project-scope view.', 'baiwei-markdown-mindmap'); ?></td>
                    </tr>
                    <tr>
                        <td><code>default_view</code></td>
                        <td><code>horizontal</code>, <code>vertical</code></td>
                        <td><?php esc_html_e('Sets whether the mindmap loads in horizontal or vertical view by default. The aliases layout, view, and orientation are also supported.', 'baiwei-markdown-mindmap'); ?></td>
                    </tr>
                    <tr>
                        <td><code>brick_style</code></td>
                        <td><code>wireframe</code>, <code>text</code></td>
                        <td><?php esc_html_e('Controls whether Bird\'s Eye content bricks appear as wireframe cards or as the original text-based list.', 'baiwei-markdown-mindmap'); ?></td>
                    </tr>
                </tbody>
            </table>

            <h2><?php esc_html_e('Elementor', 'baiwei-markdown-mindmap'); ?></h2>
            <p>
                <?php esc_html_e('Drag the Baiwei Markdown Mindmap widget into an Elementor layout, then edit Markdown directly in the widget Content panel. The standard Elementor Shortcode widget can still render the shortcode if you prefer shortcode-based embeds.', 'baiwei-markdown-mindmap'); ?>
            </p>

            <h2><?php esc_html_e('Troubleshooting', 'baiwei-markdown-mindmap'); ?></h2>
            <ul style="list-style: disc; padding-left: 20px;">
                <li><?php esc_html_e('If new controls do not work immediately, hard refresh the page or clear any WordPress/page-builder cache.', 'baiwei-markdown-mindmap'); ?></li>
                <li><?php esc_html_e('The visual renderer ships with local d3, markmap-view, and markmap-lib browser assets, so it does not load executable code from a public CDN.', 'baiwei-markdown-mindmap'); ?></li>
                <li><?php esc_html_e('For Elementor, click Apply in the Shortcode widget after changing the shortcode content.', 'baiwei-markdown-mindmap'); ?></li>
            </ul>

            <h2><?php esc_html_e('Standalone Plugin Notes', 'baiwei-markdown-mindmap'); ?></h2>
            <ul style="list-style: disc; padding-left: 20px;">
                <li><?php esc_html_e('The WordPress plugin wrapper is licensed as GPLv2 or later for WordPress.org compatibility.', 'baiwei-markdown-mindmap'); ?></li>
                <li><?php esc_html_e('D3 and Markmap browser assets are bundled locally. Public pages do not need to load executable code from public CDNs.', 'baiwei-markdown-mindmap'); ?></li>
                <li><?php esc_html_e('Third-party credits and license notices are included in licenses/THIRD-PARTY-NOTICES.txt and the licenses directory.', 'baiwei-markdown-mindmap'); ?></li>
                <li><?php esc_html_e('The plugin does not add a public powered-by link. Upstream documentation links are shown only on this admin usage page.', 'baiwei-markdown-mindmap'); ?></li>
            </ul>

            <h2><?php esc_html_e('Upstream Markmap', 'baiwei-markdown-mindmap'); ?></h2>
            <p>
                <?php esc_html_e('The core Markdown-to-mindmap engine comes from the upstream Markmap project.', 'baiwei-markdown-mindmap'); ?>
                <a href="https://markmap.js.org/docs" target="_blank" rel="noreferrer noopener"><?php esc_html_e('Read the Markmap docs', 'baiwei-markdown-mindmap'); ?></a>
                <?php esc_html_e('or', 'baiwei-markdown-mindmap'); ?>
                <a href="https://markmap.js.org/repl" target="_blank" rel="noreferrer noopener"><?php esc_html_e('try the Markmap playground', 'baiwei-markdown-mindmap'); ?></a>.
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
        return $this->render_mindmap((array) $atts, $content, false);
    }

    public function render_mindmap(array $atts, ?string $content = null, bool $force_view_only = false): string {
        $atts = shortcode_atts(
            [
                'height' => '640px',
                'heigh' => '',
                'mode' => 'markdown',
                'planning' => 'structure-first',
                'birdseye' => 'false',
                'layout' => 'horizontal',
                'default_view' => '',
                'default-view' => '',
                'view' => '',
                'orientation' => '',
                'brick_style' => 'wireframe',
                'brick-style' => '',
                'brickstyle' => '',
                'types' => 'page,post',
            ],
            $atts,
            'baiwei_markdown_mindmap'
        );

        $mode = in_array($atts['mode'], ['markdown', 'sitemap'], true) ? $atts['mode'] : 'markdown';
        $planning = in_array($atts['planning'], ['mainpage-first', 'structure-first'], true) ? $atts['planning'] : 'structure-first';
        $birdseye = filter_var($atts['birdseye'], FILTER_VALIDATE_BOOLEAN);
        $layout_attr = $atts['default_view'] !== ''
            ? $atts['default_view']
            : ($atts['default-view'] !== ''
                ? $atts['default-view']
                : ($atts['view'] !== ''
                    ? $atts['view']
                    : ($atts['orientation'] !== '' ? $atts['orientation'] : $atts['layout'])));
        $layout_attr = strtolower((string) $layout_attr);
        $layout = in_array($layout_attr, ['horizontal', 'vertical'], true) ? $layout_attr : 'horizontal';
        $brick_style_attr = $atts['brick-style'] !== '' ? $atts['brick-style'] : ($atts['brickstyle'] !== '' ? $atts['brickstyle'] : $atts['brick_style']);
        $brick_style = in_array($brick_style_attr, ['wireframe', 'text'], true) ? $brick_style_attr : 'wireframe';
        $types = implode(',', $this->normalize_post_types((string) $atts['types']));
        $height_attr = $atts['heigh'] !== '' ? $atts['heigh'] : $atts['height'];
        $height = $this->sanitize_css_size((string) $height_attr);
        $markdown_content = $this->normalize_markdown_content($content);
        $is_view_only = $force_view_only || ($mode === 'markdown' && $markdown_content !== '');

        $this->enqueue_assets();

        $instance_id = wp_unique_id('baiwei-markdown-mindmap-');

        ob_start();
        ?>
        <div
            id="<?php echo esc_attr($instance_id); ?>"
            class="baiwei-markdown-mindmap<?php echo $is_view_only ? ' baiwei-markdown-mindmap--view-only' : ''; ?>"
            data-mode="<?php echo esc_attr($mode); ?>"
            data-planning-mode="<?php echo esc_attr($planning); ?>"
            data-birdseye="<?php echo esc_attr($birdseye ? 'true' : 'false'); ?>"
            data-layout="<?php echo esc_attr($layout); ?>"
            data-brick-style="<?php echo esc_attr($brick_style); ?>"
            data-types="<?php echo esc_attr($types); ?>"
            style="--baiwei-markdown-mindmap-height: <?php echo esc_attr($height); ?>;"
        >
            <?php if ($is_view_only && $mode === 'markdown') : ?>
                <script type="application/json" class="baiwei-markdown-mindmap__source"><?php echo wp_json_encode($markdown_content, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?></script>
            <?php endif; ?>
            <?php if (!$is_view_only) : ?>
            <div class="baiwei-markdown-mindmap__toolbar" role="group" aria-label="<?php esc_attr_e('Mindmap source', 'baiwei-markdown-mindmap'); ?>">
                <button class="baiwei-markdown-mindmap__mode is-active" type="button" data-mode="markdown">
                    <?php esc_html_e('Markdown', 'baiwei-markdown-mindmap'); ?>
                </button>
                <button class="baiwei-markdown-mindmap__mode" type="button" data-mode="sitemap">
                    <?php esc_html_e('Sitemap', 'baiwei-markdown-mindmap'); ?>
                </button>
                <label class="baiwei-markdown-mindmap__file">
                    <span><?php esc_html_e('Open .md', 'baiwei-markdown-mindmap'); ?></span>
                    <input type="file" accept=".md,.markdown,text/markdown,text/plain">
                </label>
                <button class="baiwei-markdown-mindmap__fit" type="button">
                    <?php esc_html_e('Fit', 'baiwei-markdown-mindmap'); ?>
                </button>
                <button class="baiwei-markdown-mindmap__zoom-out" type="button">
                    <?php esc_html_e('Zoom out', 'baiwei-markdown-mindmap'); ?>
                </button>
                <button class="baiwei-markdown-mindmap__zoom-in" type="button">
                    <?php esc_html_e('Zoom in', 'baiwei-markdown-mindmap'); ?>
                </button>
                <button class="baiwei-markdown-mindmap__planning<?php echo esc_attr($planning === 'structure-first' ? ' is-active' : ''); ?>" type="button" data-planning-mode="structure-first">
                    <?php esc_html_e('Structure first', 'baiwei-markdown-mindmap'); ?>
                </button>
                <button class="baiwei-markdown-mindmap__planning<?php echo esc_attr($planning === 'mainpage-first' ? ' is-active' : ''); ?>" type="button" data-planning-mode="mainpage-first">
                    <?php esc_html_e('Mainpage first', 'baiwei-markdown-mindmap'); ?>
                </button>
                <button class="baiwei-markdown-mindmap__birdseye<?php echo esc_attr($birdseye ? ' is-active' : ''); ?>" type="button" aria-pressed="<?php echo esc_attr($birdseye ? 'true' : 'false'); ?>">
                    <?php esc_html_e('Bird\'s Eye', 'baiwei-markdown-mindmap'); ?>
                </button>
                <button class="baiwei-markdown-mindmap__layout<?php echo esc_attr($layout === 'horizontal' ? ' is-active' : ''); ?>" type="button" data-layout="horizontal">
                    <?php esc_html_e('Horizontal', 'baiwei-markdown-mindmap'); ?>
                </button>
                <button class="baiwei-markdown-mindmap__layout<?php echo esc_attr($layout === 'vertical' ? ' is-active' : ''); ?>" type="button" data-layout="vertical">
                    <?php esc_html_e('Vertical', 'baiwei-markdown-mindmap'); ?>
                </button>
                <button class="baiwei-markdown-mindmap__brick-style<?php echo esc_attr($brick_style === 'wireframe' ? ' is-active' : ''); ?>" type="button" data-brick-style="wireframe" aria-pressed="<?php echo esc_attr($brick_style === 'wireframe' ? 'true' : 'false'); ?>">
                    <?php esc_html_e('Brick cards', 'baiwei-markdown-mindmap'); ?>
                </button>
                <button class="baiwei-markdown-mindmap__brick-style<?php echo esc_attr($brick_style === 'text' ? ' is-active' : ''); ?>" type="button" data-brick-style="text" aria-pressed="<?php echo esc_attr($brick_style === 'text' ? 'true' : 'false'); ?>">
                    <?php esc_html_e('Brick text', 'baiwei-markdown-mindmap'); ?>
                </button>
            </div>
            <div class="baiwei-markdown-mindmap__editor" data-panel="markdown">
                <textarea spellcheck="false"># Mindmap

## Homepage
- [brick][header] Header
- [brick][hero] Hero
- [brick][features] Services
- [brick][text] About

## Contact
- [brick][form] Contact Form
- [brick][footer] Footer</textarea>
            </div>
            <?php endif; ?>
            <div class="baiwei-markdown-mindmap__status" aria-live="polite"></div>
            <svg class="baiwei-markdown-mindmap__svg" role="img" aria-label="<?php esc_attr_e('Interactive mindmap', 'baiwei-markdown-mindmap'); ?>"></svg>
            <?php if ($is_view_only) : ?>
                <div class="baiwei-markdown-mindmap__canvas-controls" role="group" aria-label="<?php esc_attr_e('Mindmap controls', 'baiwei-markdown-mindmap'); ?>">
                    <button class="baiwei-markdown-mindmap__icon-button baiwei-markdown-mindmap__zoom-out" type="button" aria-label="<?php esc_attr_e('Zoom out', 'baiwei-markdown-mindmap'); ?>">
                        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                            <path d="M5 12h14"></path>
                        </svg>
                    </button>
                    <button class="baiwei-markdown-mindmap__icon-button baiwei-markdown-mindmap__fit" type="button" aria-label="<?php esc_attr_e('Fit mindmap', 'baiwei-markdown-mindmap'); ?>">
                        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                            <path d="M16 3h3a2 2 0 0 1 2 2v3"></path>
                            <path d="M21 16v3a2 2 0 0 1-2 2h-3"></path>
                            <path d="M8 21H5a2 2 0 0 1-2-2v-3"></path>
                            <path d="M9 9h6v6H9z"></path>
                        </svg>
                    </button>
                    <button class="baiwei-markdown-mindmap__icon-button baiwei-markdown-mindmap__zoom-in" type="button" aria-label="<?php esc_attr_e('Zoom in', 'baiwei-markdown-mindmap'); ?>">
                        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                            <path d="M12 5v14"></path>
                            <path d="M5 12h14"></path>
                        </svg>
                    </button>
                    <button class="baiwei-markdown-mindmap__icon-button baiwei-markdown-mindmap__fullscreen" type="button" aria-label="<?php esc_attr_e('Toggle fullscreen', 'baiwei-markdown-mindmap'); ?>">
                        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                            <path d="M16 3h3a2 2 0 0 1 2 2v3"></path>
                            <path d="M21 16v3a2 2 0 0 1-2 2h-3"></path>
                            <path d="M8 21H5a2 2 0 0 1-2-2v-3"></path>
                        </svg>
                    </button>
                    <button class="baiwei-markdown-mindmap__icon-button baiwei-markdown-mindmap__birdseye" type="button" aria-label="<?php esc_attr_e('Toggle Bird\'s Eye View', 'baiwei-markdown-mindmap'); ?>" aria-pressed="<?php echo esc_attr($birdseye ? 'true' : 'false'); ?>">
                        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                            <path d="M4 5h16"></path>
                            <path d="M4 12h16"></path>
                            <path d="M4 19h16"></path>
                        </svg>
                    </button>
                    <button class="baiwei-markdown-mindmap__icon-button baiwei-markdown-mindmap__brick-style<?php echo esc_attr($brick_style === 'wireframe' ? ' is-active' : ''); ?>" type="button" data-brick-style="<?php echo esc_attr($brick_style === 'wireframe' ? 'text' : 'wireframe'); ?>" aria-label="<?php esc_attr_e('Toggle content brick style', 'baiwei-markdown-mindmap'); ?>" aria-pressed="<?php echo esc_attr($brick_style === 'wireframe' ? 'true' : 'false'); ?>">
                        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                            <path d="M5 5h6v5H5z"></path>
                            <path d="M13 5h6v5h-6z"></path>
                            <path d="M5 14h14"></path>
                            <path d="M5 18h10"></path>
                        </svg>
                    </button>
                    <button class="baiwei-markdown-mindmap__icon-button baiwei-markdown-mindmap__layout" type="button" data-layout="<?php echo esc_attr($layout === 'vertical' ? 'horizontal' : 'vertical'); ?>" aria-label="<?php esc_attr_e('Toggle horizontal or vertical layout', 'baiwei-markdown-mindmap'); ?>">
                        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                            <path d="M4 7h9"></path>
                            <path d="M13 7l-3-3"></path>
                            <path d="M13 7l-3 3"></path>
                            <path d="M7 11v9"></path>
                            <path d="M7 20l-3-3"></path>
                            <path d="M7 20l3-3"></path>
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

new Baiwei_Markdown_Mindmap_Plugin();
