# Markmap WordPress

Render Markdown as an interactive Markmap mindmap inside a WordPress page, or generate a visual sitemap from published WordPress content.

## Install

1. Copy the `markmap-wordpress` directory into `wp-content/plugins/`.
2. Activate **Markmap WordPress** in WordPress Admin > Plugins.
3. Add this shortcode to any page:

```text
[markmap_wordpress]
```

## Shortcode Options

```text
[markmap_wordpress mode="markdown" height="640px" types="page,post"]
```

- `mode`: `markdown` or `sitemap`.
- `height`: CSS size for the mindmap area, such as `520px` or `70vh`.
- `types`: comma-separated public post types for the sitemap, such as `page,post,product`.

Note: `height` is the preferred spelling. The plugin also accepts `heigh` as a typo-compatible alias.

## Usage

In Markdown mode, paste Markdown into the editor or upload a `.md` file. In Sitemap mode, the plugin fetches published WordPress content through its REST endpoint and renders the site structure as a mindmap.

For a clean read-only embed, place Markdown inside the shortcode:

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

When Markdown is supplied this way, the plugin renders only the visual mindmap with subtle fit and fullscreen controls at the bottom of the canvas.

The visual renderer uses Markmap browser assets from jsDelivr:

- `d3`
- `markmap-view`
- `markmap-lib`
