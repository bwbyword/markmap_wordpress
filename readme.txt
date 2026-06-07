=== Interactive Markdown Mindmap ===
Contributors: bwbyword
Tags: markdown, mindmap, sitemap, shortcode, elementor
Requires at least: 5.8
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 0.1.9
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Render Markdown as interactive Markmap mindmaps in WordPress, or generate visual sitemaps from published content.

== Description ==

Interactive Markdown Mindmap is a WordPress-focused plugin built on top of the upstream Markmap project. It lets you embed interactive Markdown mindmaps in pages, posts, and Elementor Shortcode widgets.

The plugin supports:

* Markdown mode with an editor and `.md` file upload.
* Read-only Markdown embeds using enclosing shortcode content.
* Sitemap mode for generating a visual mindmap from published WordPress content.
* Content Brick planning syntax for defining page sections inside Markdown.
* Mainpage First and Structure First planning modes.
* Bird's Eye View for showing all content brick lists at once.
* Brick count badges on collapsed page nodes.
* Horizontal and vertical mindmap layout toggle.
* Subtle zoom, fit, and fullscreen controls for clean page embeds.
* Drag-and-drop Elementor widget with a Markdown editing box in the Elementor Content panel.
* Elementor editor preview support after widget or shortcode preview updates.

The visual renderer uses local bundled browser assets for `d3`, `markmap-view`, and `markmap-lib`.

== Installation ==

1. Upload the `interactive-markdown-mindmap` folder to `/wp-content/plugins/`.
2. Activate **Interactive Markdown Mindmap** through the WordPress Plugins screen.
3. Open **Settings > Interactive Markdown Mindmap** for usage examples.
4. Add `[interactive_markdown_mindmap]` to any page or post.

== Usage ==

= Basic editor =

Add this shortcode to show the interactive Markdown editor, upload control, and mindmap canvas:

`[interactive_markdown_mindmap]`

= Read-only Markdown embed =

Place Markdown between the opening and closing shortcode tags:

`
[interactive_markdown_mindmap mode="markdown" height="70vh"]
# Product Plan

## Discovery
- Interviews
- Analytics

## Build
- Prototype
- Launch
[/interactive_markdown_mindmap]
`

When Markdown is supplied this way, the plugin renders only the visual mindmap canvas with subtle zoom, fit, and fullscreen controls.

= Content bricks =

Add content bricks under any page or section:

`
# Website Plan

## Homepage
- [brick][header] Header
- [brick][image] Hero
- [brick][text] About

## Contact
- [brick][form] Contact Form
- [brick][footer] Footer
`

Supported brick type tags include `[image]`, `[text]`, `[video]`, `[form]`, `[list]`, `[header]`, and `[footer]`.

= Visual sitemap =

Generate a mindmap from published WordPress pages and posts:

`[interactive_markdown_mindmap mode="sitemap" height="70vh" types="page,post"]`

Include additional public post types by changing `types`:

`[interactive_markdown_mindmap mode="sitemap" types="page,post,product"]`

== Shortcode Options ==

* `mode`: `markdown` or `sitemap`.
* `height`: CSS size for the mindmap canvas, such as `640px`, `70vh`, or `100%`.
* `types`: comma-separated public post types used by sitemap mode.
* `planning`: `structure-first` or `mainpage-first`.
* `birdseye`: `true` or `false`.
* `layout`: `horizontal` or `vertical`.

`height` is the preferred spelling. The plugin also accepts `heigh` as a typo-compatible alias.

== Elementor ==

Drag the **Interactive Markdown Mindmap** widget into an Elementor layout, then edit Markdown in the widget's Content panel.

You can also use Elementor's Shortcode widget and paste any Interactive Markdown Mindmap shortcode. Elementor usually refreshes shortcode previews after you click **Apply**. After the preview updates, the mindmap should render inside the editor.

== Frequently Asked Questions ==

= Where are the usage instructions after installation? =

Open **Settings > Interactive Markdown Mindmap** in WordPress Admin.

= Why does Elementor not update while I type? =

Elementor's Shortcode widget normally refreshes shortcode output after you click **Apply**. The plugin initializes the mindmap after Elementor updates the preview.

= Why are controls not working after an update? =

Hard refresh the page and clear any WordPress, page builder, or CDN cache. The plugin versions its assets to help WordPress load fresh JavaScript after updates.

= Does this work without external CDN access? =

Yes. The plugin bundles the required browser assets locally and does not load executable code from a public CDN.

= Where are third-party license notices? =

See `licenses/THIRD-PARTY-NOTICES.txt` and the files in the `licenses` directory.

== Changelog ==

= 0.1.9 =

* Removed folded vertical-mode nodes and links immediately so fold behavior matches the horizontal view.

= 0.1.8 =

* Kept fold and unfold interactions in the active vertical layout instead of falling back to horizontal animation.

= 0.1.7 =

* Made non-error canvas status messages fade out automatically after a few seconds.

= 0.1.6 =

* Improved vertical layout spacing to prevent overlapping branches and content-brick cards.

= 0.1.5 =

* Added a horizontal and vertical layout toggle for mindmap views.
* Added shortcode and Elementor controls for choosing the initial layout.

= 0.1.4 =

* Added Content Brick syntax for page-section planning.
* Added Mainpage First and Structure First planning modes.
* Added Bird's Eye View for expanded content-brick planning.
* Added brick count badges to collapsed page nodes.

= 0.1.3 =

* Added a native drag-and-drop Elementor widget.
* Added Markdown editing in the Elementor widget Content panel.
* Added visual site map mode to the Elementor widget.

= 0.1.2 =

* Added Elementor editor preview support.
* Added WordPress Admin usage page under Settings.
* Added WordPress plugin `readme.txt`.
* Added zoom controls and improved asset cache busting.
* Bundled browser assets locally and switched plugin wrapper licensing to GPLv2 or later.

= 0.1.0 =

* Initial WordPress plugin shortcode.
* Added Markdown mode, read-only shortcode embeds, and sitemap mode.
