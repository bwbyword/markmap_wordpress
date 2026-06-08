![Interactive Markdown Mindmap banner](banner.png)

# Interactive Markdown Mindmap

Interactive Markdown Mindmap is a standalone WordPress plugin that renders Markdown as interactive Markmap mindmaps, or generates a visual sitemap from published WordPress content.

This project uses the upstream [Markmap](https://github.com/markmap/markmap) browser libraries, but the repository itself is intentionally shaped as a WordPress plugin rather than a fork of the full Markmap monorepo.

## Features

- Native drag-and-drop Elementor widget with a Markdown editing box in the Elementor Content panel.
- `[interactive_markdown_mindmap]` shortcode for pages, posts, and Elementor Shortcode widgets.
- Markdown mode with an editor and `.md` file upload.
- Read-only Markdown embeds using enclosing shortcode content.
- Sitemap mode for generating a visual mindmap from published WordPress content.
- Content Brick syntax for planning page sections inside Markdown.
- CSS-only wireframe blocks for content bricks in Bird's Eye View.
- Drag, move, and remove content bricks within each page stack.
- Toggle content bricks between wireframe cards and the original text list view.
- Mainpage First and Structure First planning modes.
- Bird's Eye View for seeing every content brick list at once.
- Brick count badges on collapsed page nodes.
- Horizontal and vertical mindmap layout toggle.
- Subtle zoom, fit, and fullscreen controls for clean page embeds.
- Elementor editor preview support after the Shortcode widget preview refreshes.
- Bundled local browser assets for `d3`, `markmap-view`, and `markmap-lib`.

## Install

Copy this repository folder into WordPress:

```text
wp-content/plugins/interactive-markdown-mindmap
```

Then activate **Interactive Markdown Mindmap** in WordPress Admin > Plugins.

The main plugin file must be directly inside the plugin folder:

```text
wp-content/plugins/interactive-markdown-mindmap/interactive-markdown-mindmap.php
```

If the files are nested one level deeper, WordPress will not show the plugin in the Plugins list.

After activation, open **Settings > Interactive Markdown Mindmap** for usage examples, Elementor notes, troubleshooting, and standalone plugin notes.

## Basic Usage

Add the shortcode to any WordPress page or post:

```text
[interactive_markdown_mindmap]
```

This displays the interactive Markdown editor, file upload control, and mindmap canvas.

## Elementor Widget

In Elementor, drag **Interactive Markdown Mindmap** into the layout. Edit Markdown directly in the widget's Content panel, set the canvas height, or switch the source to Visual Site Map to generate a mindmap from public content types.

Use the Layout control to choose the default horizontal or vertical mindmap view.

## Read-Only Markdown Embed

Place Markdown between the opening and closing shortcode tags:

```text
[interactive_markdown_mindmap mode="markdown" height="70vh"]
# Product Plan

## Discovery
- Interviews
- Analytics

## Build
- Prototype
- Launch
[/interactive_markdown_mindmap]
```

When Markdown is supplied this way, the plugin renders only the visual mindmap canvas with subtle zoom, fit, and fullscreen controls at the bottom.

## Visual Sitemap

Generate a mindmap from published WordPress content:

```text
[interactive_markdown_mindmap mode="sitemap" height="70vh" types="page,post"]
```

The `types` option accepts comma-separated public post types, such as:

```text
[interactive_markdown_mindmap mode="sitemap" types="page,post,product"]
```

## Content Bricks

Add content bricks as indented list items under any page or section:

```text
# Website Plan

## Homepage
- [brick][header] Header
- [brick][hero] Hero
- [brick][features] Services
- [brick][text] About

## Contact
- [brick][form] Contact Form
- [brick][footer] Footer
```

Normal view shows a brick count badge on the parent node. Bird's Eye View expands all brick lists at once as stackable CSS wireframe blocks.

In Bird's Eye View, users can drag content bricks within the same page stack, use the up/down controls, or remove a brick. When an editor is available, the Markdown source is updated with the new brick order.

Use the brick-style toggle or shortcode option to switch between the wireframe cards and the original text list:

```text
[interactive_markdown_mindmap mode="markdown" birdseye="true" brick_style="text"]
```

Supported brick type tags include `[header]`, `[hero]`, `[image]`, `[slider]`, `[text]`, `[video]`, `[list]`, `[features]`, `[cards]`, `[form]`, `[map]`, `[table]`, `[chart]`, `[faq]`, `[accordion]`, `[cta]`, `[subscribe]`, `[footer]`, and other custom tags. Unknown tags fall back to a generic text wireframe.

## Shortcode Options

- `mode`: `markdown` or `sitemap`.
- `height`: CSS size for the mindmap canvas, such as `640px`, `70vh`, or `100%`.
- `types`: comma-separated public post types used by sitemap mode.
- `planning`: `structure-first` or `mainpage-first`.
- `birdseye`: `true` or `false`.
- `default_view`: `horizontal` or `vertical`. Aliases: `layout`, `view`, and `orientation`.
- `brick_style`: `wireframe` or `text`.

`height` is the preferred spelling. The plugin also accepts `heigh` as a typo-compatible alias.

## Repository Structure

- `interactive-markdown-mindmap.php`: main WordPress plugin file.
- `assets/`: plugin CSS, JavaScript, and bundled browser builds.
- `licenses/`: third-party license texts.
- `readme.txt`: WordPress.org plugin readme.
- `licenses/THIRD-PARTY-NOTICES.txt`: bundled dependency notices and patch notes.
- `LICENSE.txt`: GPLv2 license text for the WordPress plugin wrapper.

## WordPress.org Notes

The WordPress plugin wrapper is licensed as GPLv2 or later for WordPress.org compatibility.

The plugin does not inject a public powered-by link. It also avoids loading executable browser code from public CDNs by bundling the required browser assets locally.

Bundled third-party assets retain their original GPL-compatible notices in [`licenses/THIRD-PARTY-NOTICES.txt`](./licenses/THIRD-PARTY-NOTICES.txt) and [`licenses/`](./licenses/).

## Upstream Credit

The core Markdown-to-mindmap engine comes from [markmap/markmap](https://github.com/markmap/markmap), created and maintained by the Markmap project.

For general Markmap documentation, visit:

- [Markmap docs](https://markmap.js.org/docs)
- [Markmap playground](https://markmap.js.org/repl)

## License

Interactive Markdown Mindmap is licensed as GPLv2 or later.

Bundled Markmap packages are MIT licensed, and D3 is ISC licensed. See [`licenses/THIRD-PARTY-NOTICES.txt`](./licenses/THIRD-PARTY-NOTICES.txt) for details.
