=== Interactive Markdown Mindmap ===
Contributors: bwbyword
Tags: markdown, mindmap, sitemap, shortcode, elementor
Requires at least: 5.8
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 0.1.21
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
* CSS-only wireframe blocks for content bricks in Bird's Eye View.
* Drag, move, and remove content bricks within each page stack.
* Toggle content bricks between wireframe cards and the original text list view.
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
- [brick][hero] Hero
- [brick][features] Services
- [brick][text] About

## Contact
- [brick][form] Contact Form
- [brick][footer] Footer
`

Bird's Eye View expands brick lists as stackable CSS wireframe blocks. Users can drag content bricks within the same page stack, use the up/down controls, or remove a brick. When an editor is available, the Markdown source is updated with the new brick order.

Use the brick-style toggle or shortcode option to switch between wireframe cards and the original text list:

`[interactive_markdown_mindmap mode="markdown" birdseye="true" brick_style="text"]`

Supported brick type tags include `[header]`, `[hero]`, `[image]`, `[slider]`, `[text]`, `[video]`, `[list]`, `[features]`, `[cards]`, `[form]`, `[map]`, `[table]`, `[chart]`, `[faq]`, `[accordion]`, `[cta]`, `[subscribe]`, `[footer]`, and other custom tags. Unknown tags fall back to a generic text wireframe.

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
* `brick_style`: `wireframe` or `text`.

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

= 0.1.21 =

* Re-applied wireframe content-brick cards after Markmap restores raw text nodes during fold and unfold animations.

= 0.1.20 =

* Added a content-brick style toggle and `brick_style` option for switching Bird's Eye View between wireframe cards and the original text list.

= 0.1.19 =

* Kept CSS wireframe content-brick stacks active after folding and unfolding branches in vertical Bird's Eye View.

= 0.1.18 =

* Added CSS-only wireframe content-brick cards in Bird's Eye View, with move, drag, and remove controls that update the Markdown source.

= 0.1.17 =

* Restored readable connector lines and fold circles after enabling Bird's Eye View in vertical layout mode.

= 0.1.16 =

* Balanced vertical Bird's Eye layouts so large sitemap maps stay readable instead of flattening into a single wide row.

= 0.1.15 =

* Rebuilt the vertical SVG tree cleanly when toggling Bird's Eye View to prevent mixed layout artifacts.

= 0.1.14 =

* Restored horizontal rendering when switching back from vertical layout mode.

= 0.1.13 =

* Preserved native horizontal layout geometry after toggling Bird's Eye View off.

= 0.1.12 =

* Restored vertical-mode content card dimensions when unfolding hidden nodes.

= 0.1.11 =

* Restored vertical-mode card content opacity when unfolding previously hidden nodes.

= 0.1.10 =

* Restored hidden vertical-mode descendants correctly when unfolding previously folded nodes.

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
