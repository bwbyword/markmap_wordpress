# Markmap WordPress

This repository is a WordPress-focused fork of [markmap/markmap](https://github.com/markmap/markmap).

The upstream Markmap project turns Markdown into interactive mindmaps. This fork keeps that foundation and adds an installable WordPress plugin so Markmap can be used directly inside WordPress pages.

## What This Fork Adds

- A WordPress plugin in [`markmap-wordpress`](./markmap-wordpress).
- A `[markmap_wordpress]` shortcode for embedding mindmaps in pages and posts.
- Markdown mode for pasting Markdown or uploading a `.md` file.
- Read-only Markdown embeds using enclosing shortcode content.
- Sitemap mode for generating a visual mindmap from published WordPress content.
- Subtle fit and fullscreen controls for clean page embeds.
- A WordPress REST endpoint that converts public post types into sitemap Markdown.

## Install The Plugin

Copy the plugin directory into WordPress:

```text
wp-content/plugins/markmap-wordpress
```

Then activate **Markmap WordPress** in WordPress Admin > Plugins.

The plugin files live here:

```text
markmap-wordpress/
```

## Basic Usage

Add the shortcode to any WordPress page or post:

```text
[markmap_wordpress]
```

This displays the interactive Markdown editor, file upload control, and mindmap canvas.

## Read-Only Markdown Embed

Place Markdown between the opening and closing shortcode tags:

```text
[markmap_wordpress mode="markdown" height="70vh"]
# Product Plan

## Discovery
- Interviews
- Analytics

## Build
- Prototype
- Launch
[/markmap_wordpress]
```

When Markdown is supplied this way, the plugin renders only the visual mindmap canvas with subtle fit and fullscreen controls at the bottom.

## Visual Sitemap

Generate a mindmap from published WordPress content:

```text
[markmap_wordpress mode="sitemap" height="70vh" types="page,post"]
```

The `types` option accepts comma-separated public post types, such as:

```text
[markmap_wordpress mode="sitemap" types="page,post,product"]
```

## Shortcode Options

- `mode`: `markdown` or `sitemap`.
- `height`: CSS size for the mindmap canvas, such as `640px`, `70vh`, or `100%`.
- `types`: comma-separated public post types used by sitemap mode.

`height` is the preferred spelling. The plugin also accepts `heigh` as a typo-compatible alias.

## Repository Structure

- `markmap-wordpress/`: the WordPress plugin added by this fork.
- `packages/`: upstream Markmap packages.
- `README.md`: this WordPress-focused overview.

## Upstream Credit

The core Markdown-to-mindmap engine comes from [markmap/markmap](https://github.com/markmap/markmap), created and maintained by the Markmap project.

For general Markmap documentation, visit:

- [Markmap docs](https://markmap.js.org/docs)
- [Markmap playground](https://markmap.js.org/repl)

## License

This fork follows the upstream Markmap license. See [LICENSE](./LICENSE).
