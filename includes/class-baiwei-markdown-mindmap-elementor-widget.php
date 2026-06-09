<?php
/**
 * Elementor widget for Baiwei Markdown Mindmap.
 *
 * @package BaiweiMarkdownMindmap
 */

if (!defined('ABSPATH')) {
    exit;
}

final class Baiwei_Markdown_Mindmap_Elementor_Widget extends \Elementor\Widget_Base {
    public function get_name(): string {
        return 'baiwei_markdown_mindmap';
    }

    public function get_title(): string {
        return __('Baiwei Markdown Mindmap', 'baiwei-markdown-mindmap');
    }

    public function get_icon(): string {
        return 'eicon-editor-list-ul';
    }

    public function get_categories(): array {
        return ['baiwei-markdown-mindmap', 'general'];
    }

    public function get_keywords(): array {
        return ['markdown', 'mindmap', 'markmap', 'sitemap', 'site map'];
    }

    public function get_script_depends(): array {
        return ['baiwei-markdown-mindmap'];
    }

    public function get_style_depends(): array {
        return ['baiwei-markdown-mindmap'];
    }

    protected function register_controls(): void {
        $this->start_controls_section(
            'section_content',
            [
                'label' => __('Mindmap Content', 'baiwei-markdown-mindmap'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'mode',
            [
                'label' => __('Source', 'baiwei-markdown-mindmap'),
                'type' => \Elementor\Controls_Manager::SELECT,
                'default' => 'markdown',
                'options' => [
                    'markdown' => __('Markdown', 'baiwei-markdown-mindmap'),
                    'sitemap' => __('Visual Site Map', 'baiwei-markdown-mindmap'),
                ],
            ]
        );

        $this->add_control(
            'markdown',
            [
                'label' => __('Markdown', 'baiwei-markdown-mindmap'),
                'type' => \Elementor\Controls_Manager::TEXTAREA,
                'default' => "# Website Plan\n\n## Homepage\n- [brick][header] Header\n- [brick][hero] Hero\n- [brick][features] Services\n- [brick][text] About\n\n## Contact\n- [brick][form] Contact Form\n- [brick][footer] Footer",
                'rows' => 14,
                'condition' => [
                    'mode' => 'markdown',
                ],
            ]
        );

        $this->add_control(
            'types',
            [
                'label' => __('Post Types', 'baiwei-markdown-mindmap'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => 'page,post',
                'condition' => [
                    'mode' => 'sitemap',
                ],
            ]
        );

        $this->add_control(
            'planning',
            [
                'label' => __('Planning Mode', 'baiwei-markdown-mindmap'),
                'type' => \Elementor\Controls_Manager::SELECT,
                'default' => 'structure-first',
                'options' => [
                    'structure-first' => __('Structure First', 'baiwei-markdown-mindmap'),
                    'mainpage-first' => __('Mainpage First', 'baiwei-markdown-mindmap'),
                ],
            ]
        );

        $this->add_control(
            'birdseye',
            [
                'label' => __('Bird\'s Eye View', 'baiwei-markdown-mindmap'),
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'label_on' => __('Show', 'baiwei-markdown-mindmap'),
                'label_off' => __('Hide', 'baiwei-markdown-mindmap'),
                'return_value' => 'true',
                'default' => '',
            ]
        );

        $this->add_control(
            'height',
            [
                'label' => __('Canvas Height', 'baiwei-markdown-mindmap'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => '640px',
                'placeholder' => '640px',
            ]
        );

        $this->add_control(
            'layout',
            [
                'label' => __('Default View', 'baiwei-markdown-mindmap'),
                'type' => \Elementor\Controls_Manager::CHOOSE,
                'default' => 'horizontal',
                'options' => [
                    'horizontal' => [
                        'title' => __('Horizontal', 'baiwei-markdown-mindmap'),
                        'icon' => 'eicon-h-align-left',
                    ],
                    'vertical' => [
                        'title' => __('Vertical', 'baiwei-markdown-mindmap'),
                        'icon' => 'eicon-v-align-top',
                    ],
                ],
                'toggle' => false,
                'description' => __('Choose how the mindmap loads before visitors use the view toggle.', 'baiwei-markdown-mindmap'),
            ]
        );

        $this->add_control(
            'brick_style',
            [
                'label' => __('Content Brick Style', 'baiwei-markdown-mindmap'),
                'type' => \Elementor\Controls_Manager::SELECT,
                'default' => 'wireframe',
                'options' => [
                    'wireframe' => __('Wireframe Cards', 'baiwei-markdown-mindmap'),
                    'text' => __('Text List', 'baiwei-markdown-mindmap'),
                ],
            ]
        );

        $this->end_controls_section();
    }

    protected function render(): void {
        $settings = $this->get_settings_for_display();
        $mode = isset($settings['mode']) && $settings['mode'] === 'sitemap' ? 'sitemap' : 'markdown';
        $markdown = isset($settings['markdown']) ? (string) $settings['markdown'] : '';

        $mindmap_html = Baiwei_Markdown_Mindmap_Plugin::instance()->render_mindmap(
            [
                'mode' => $mode,
                'height' => isset($settings['height']) ? (string) $settings['height'] : '640px',
                'planning' => isset($settings['planning']) ? (string) $settings['planning'] : 'structure-first',
                'birdseye' => !empty($settings['birdseye']) ? 'true' : 'false',
                'layout' => isset($settings['layout']) ? (string) $settings['layout'] : 'horizontal',
                'brick_style' => isset($settings['brick_style']) ? (string) $settings['brick_style'] : 'wireframe',
                'types' => isset($settings['types']) ? (string) $settings['types'] : 'page,post',
            ],
            $mode === 'markdown' ? $markdown : null,
            true
        );

        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- render_mindmap() escapes dynamic attributes, text, and embedded Markdown JSON internally.
        echo $mindmap_html;
    }
}
