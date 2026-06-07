# Interactive Markdown Mindmap

Interactive Markdown Mindmap is a standalone WordPress plugin that renders Markdown as interactive Markmap mindmaps, or generates a visual sitemap from published WordPress content.

This project uses the upstream [Markmap](https://github.com/markmap/markmap) browser libraries, but the repository itself is intentionally shaped as a WordPress plugin rather than a fork of the full Markmap monorepo.

## Features

- `[interactive_markdown_mindmap]` shortcode for pages, posts, and Elementor Shortcode widgets.
- Markdown mode with an editor and `.md` file upload.
- Read-only Markdown embeds using enclosing shortcode content.
- Sitemap mode for generating a visual mindmap from published WordPress content.
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

## Shortcode Options

- `mode`: `markdown` or `sitemap`.
- `height`: CSS size for the mindmap canvas, such as `640px`, `70vh`, or `100%`.
- `types`: comma-separated public post types used by sitemap mode.

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
