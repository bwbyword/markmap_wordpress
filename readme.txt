=== Markmap for WP ===
Contributors: bwbyword
Tags: markdown, mindmap, sitemap, shortcode, elementor
Requires at least: 5.8
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 0.1.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Render Markdown as interactive Markmap mindmaps in WordPress, or generate visual sitemaps from published content.

== Description ==

Markmap for WP is a WordPress-focused plugin built on top of the upstream Markmap project. It lets you embed interactive Markdown mindmaps in pages, posts, and Elementor Shortcode widgets.

The plugin supports:

* Markdown mode with an editor and `.md` file upload.
* Read-only Markdown embeds using enclosing shortcode content.
* Sitemap mode for generating a visual mindmap from published WordPress content.
* Subtle zoom, fit, and fullscreen controls for clean page embeds.
* Elementor editor preview support after the Shortcode widget preview updates.

The visual renderer uses local bundled browser assets for `d3`, `markmap-view`, and `markmap-lib`.

== Installation ==

1. Upload the `markmap-wp` folder to `/wp-content/plugins/`.
2. Activate **Markmap for WP** through the WordPress Plugins screen.
3. Open **Settings > Markmap for WP** for usage examples.
4. Add `[markmap_wp]` to any page or post.

== Usage ==

= Basic editor =

Add this shortcode to show the interactive Markdown editor, upload control, and mindmap canvas:

`[markmap_wp]`

= Read-only Markdown embed =

Place Markdown between the opening and closing shortcode tags:

`
[markmap_wp mode="markdown" height="70vh"]
# Product Plan

## Discovery
- Interviews
- Analytics

## Build
- Prototype
- Launch
[/markmap_wp]
`

When Markdown is supplied this way, the plugin renders only the visual mindmap canvas with subtle zoom, fit, and fullscreen controls.

= Visual sitemap =

Generate a mindmap from published WordPress pages and posts:

`[markmap_wp mode="sitemap" height="70vh" types="page,post"]`

Include additional public post types by changing `types`:

`[markmap_wp mode="sitemap" types="page,post,product"]`

== Shortcode Options ==

* `mode`: `markdown` or `sitemap`.
* `height`: CSS size for the mindmap canvas, such as `640px`, `70vh`, or `100%`.
* `types`: comma-separated public post types used by sitemap mode.

`height` is the preferred spelling. The plugin also accepts `heigh` as a typo-compatible alias.

== Elementor ==

Use Elementor's Shortcode widget and paste any Markmap for WP shortcode.

Elementor usually refreshes shortcode previews after you click **Apply**. After the preview updates, the mindmap should render inside the editor.

== Frequently Asked Questions ==

= Where are the usage instructions after installation? =

Open **Settings > Markmap for WP** in WordPress Admin.

= Why does Elementor not update while I type? =

Elementor's Shortcode widget normally refreshes shortcode output after you click **Apply**. The plugin initializes the mindmap after Elementor updates the preview.

= Why are controls not working after an update? =

Hard refresh the page and clear any WordPress, page builder, or CDN cache. The plugin versions its assets to help WordPress load fresh JavaScript after updates.

= Does this work without external CDN access? =

Yes. The plugin bundles the required browser assets locally and does not load executable code from a public CDN.

= Where are third-party license notices? =

See `licenses/THIRD-PARTY-NOTICES.txt` and the files in the `licenses` directory.

== Changelog ==

= 0.1.2 =

* Added Elementor editor preview support.
* Added WordPress Admin usage page under Settings.
* Added WordPress plugin `readme.txt`.
* Added zoom controls and improved asset cache busting.
* Bundled browser assets locally and switched plugin wrapper licensing to GPLv2 or later.

= 0.1.0 =

* Initial WordPress plugin shortcode.
* Added Markdown mode, read-only shortcode embeds, and sitemap mode.
