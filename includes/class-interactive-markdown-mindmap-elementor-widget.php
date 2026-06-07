<?php
/**
 * Elementor widget for Interactive Markdown Mindmap.
 *
 * @package InteractiveMarkdownMindmap
 */

if (!defined('ABSPATH')) {
    exit;
}

final class Interactive_Markdown_Mindmap_Elementor_Widget extends \Elementor\Widget_Base {
    public function get_name(): string {
        return 'interactive_markdown_mindmap';
    }

    public function get_title(): string {
        return __('Interactive Markdown Mindmap', 'interactive-markdown-mindmap');
    }

    public function get_icon(): string {
        return 'eicon-editor-list-ul';
    }

    public function get_categories(): array {
        return ['interactive-markdown-mindmap', 'general'];
    }

    public function get_keywords(): array {
        return ['markdown', 'mindmap', 'markmap', 'sitemap', 'site map'];
    }

    public function get_script_depends(): array {
        return ['interactive-markdown-mindmap'];
    }

    public function get_style_depends(): array {
        return ['interactive-markdown-mindmap'];
    }

    protected function register_controls(): void {
        $this->start_controls_section(
            'section_content',
            [
                'label' => __('Mindmap Content', 'interactive-markdown-mindmap'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'mode',
            [
                'label' => __('Source', 'interactive-markdown-mindmap'),
                'type' => \Elementor\Controls_Manager::SELECT,
                'default' => 'markdown',
                'options' => [
                    'markdown' => __('Markdown', 'interactive-markdown-mindmap'),
                    'sitemap' => __('Visual Site Map', 'interactive-markdown-mindmap'),
                ],
            ]
        );

        $this->add_control(
            'markdown',
            [
                'label' => __('Markdown', 'interactive-markdown-mindmap'),
                'type' => \Elementor\Controls_Manager::TEXTAREA,
                'default' => "# Mindmap\n\n## Discovery\n- Research\n- Notes\n\n## Build\n- Draft\n- Publish",
                'rows' => 14,
                'condition' => [
                    'mode' => 'markdown',
                ],
            ]
        );

        $this->add_control(
            'types',
            [
                'label' => __('Post Types', 'interactive-markdown-mindmap'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => 'page,post',
                'condition' => [
                    'mode' => 'sitemap',
                ],
            ]
        );

        $this->add_control(
            'height',
            [
                'label' => __('Canvas Height', 'interactive-markdown-mindmap'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => '640px',
                'placeholder' => '640px',
            ]
        );

        $this->end_controls_section();
    }

    protected function render(): void {
        $settings = $this->get_settings_for_display();
        $mode = isset($settings['mode']) && $settings['mode'] === 'sitemap' ? 'sitemap' : 'markdown';
        $markdown = isset($settings['markdown']) ? (string) $settings['markdown'] : '';

        echo Interactive_Markdown_Mindmap_Plugin::instance()->render_mindmap(
            [
                'mode' => $mode,
                'height' => isset($settings['height']) ? (string) $settings['height'] : '640px',
                'types' => isset($settings['types']) ? (string) $settings['types'] : 'page,post',
            ],
            $mode === 'markdown' ? $markdown : null,
            true
        );
    }
}
