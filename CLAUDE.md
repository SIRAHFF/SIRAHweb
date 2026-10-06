# SIRAH Force Field — website

Static site for the SIRAH coarse-grained force field, maintained by the
Biomolecular Simulations Group at Institut Pasteur de Montevideo.

Built on the Themefisher "Airspace" Bootstrap 4 template. Much of what is
surprising here comes from that template rather than from deliberate choices —
the notes below mark which is which.

## How it reaches the web

```
luciannahss/SIRAHweb (origin, fork)  →  pull request  →  SIRAHFF/SIRAHweb (upstream)
                                                              ↓ GitHub Pages
                                                         www.sirahff.com
```

Work happens on the fork; the group's repository publishes. `CNAME` points at
`www.sirahff.com`, which resolves to `sirahff.github.io`. Merging to
`SIRAHFF/SIRAHweb` publishes the live site, so that repository is not a place to
push straight to — the pull request is the review step before the site changes.

## Working on it

There is **no build step**. `css/style.css` is the source of truth and is edited
directly; there are no Sass sources in the repository. The `.map` files next to
the stylesheets are leftovers from the template vendor, are not referenced, and
can be ignored.

To preview locally, from the repository root:

```
python .claude/serve.py
```

That serves the folder at `http://localhost:8765`. `.claude/launch.json` points
at the same script, so Claude Code's preview starts it too.

It exists because `python -m http.server` lets the browser cache aggressively:
edits to `css/style.css` or `js/script.js` keep showing the old file until a
hard reload, which is an easy afternoon to lose. `serve.py` is the same server
with caching turned off, standard library only. If a change does not appear,
check you are on this server before hunting for the bug elsewhere.

## What is and is not committed

`.gitignore` covers the usual operating-system and editor noise, Python
bytecode, and `*.bak` / `*.orig` files, so a working copy is never mistaken for
the live page.

Inside `.claude/`, `launch.json` and `serve.py` are shared deliberately — they
are the preview setup for everyone. `settings.local.json` is ignored: it records
one person's permission choices on one machine.

The hero video master, `images/hero_pcv2_animation.mp4` (9.8 MB), is **not**
ignored and not referenced by the site; only `hero_pcv2_animation_web.mp4` is.
Anything committed stays in the history for good, so decide deliberately whether
the master belongs in the repository (see "The hero video").

## Pages

Six real pages, plus `404.html` which has no header or footer:

`index.html` · `publications2.html` · `team.html` · `events.html` ·
`event_gallery.html` · `contact.html`

## Shared markup — check before you replace

Header, top bar and footer are repeated in every page rather than included, so a
change to any of them has to be made six times. They are **not** all identical,
and this matters when scripting an edit:

| Block | Identical across pages? |
|---|---|
| Footer | Yes, byte for byte |
| Top bar | Two variants — `events.html` and `publications2.html` carry an extra closing `</div>` |
| Header | No — `index.html` uses `href="#NEWS"` and `href="#ABOUT"`, the other pages use `index.html#NEWS` and `index.html#ABOUT` |

Always assert on the match count before replacing a shared string, and expect
the header to need two variants.

## Traps

These have each cost real debugging time. None are obvious from reading the code.

**Declaring a font weight that is not in the `@import` fails silently.** The
fonts come from one `@import` at the top of `css/style.css`. A weight that is
not requested there falls back to the nearest one that is, with no warning. The
hero heading spent a long time asking for `font-weight: 100` against an import
that started at 300, so it never rendered as intended. When adding a weight to a
rule, check the import first.

**Some content blocks exist twice, and one copy is inert.** Large parts of the
original template are still present inside a commented-out block (search for
`Removed and nothing happen`). `index.html` has two `<h2>About SIRAH</h2>`, and
only one renders. Confirm which copy is live — in the browser, or by checking
whether it sits inside the comment — before editing text that appears more than
once.

**Four pages have unbalanced `<div>` markup, from the template.** Current state:
`team.html` +20, `events.html` −2, `publications2.html` −2, `event_gallery.html`
+1. Browsers tolerate it and the pages render correctly. Do not "fix" this
blind. When replacing a block, extract it by walking the tag balance rather than
matching text, and assert that each file's imbalance is unchanged afterwards.

**Later rules in `style.css` override earlier ones at equal specificity.** The
file is long and the template's own rules sit below the sections added since. A
padding set on `.navigation` near the top of the file is overridden by the
template's `.navigation` rule further down. Check where the winning declaration
actually is before assuming an edit took effect.

**The hero overlay is generated, so a video painted later covers it.**
`.slider:before` is the 80% dark-red layer that keeps the white hero text
legible, and it is created as the *first* child. A positioned `<video>` comes
later in tree order and would paint over it, leaving the text on bare footage.
The stacking is therefore explicit: video `z-index: 0`, overlay `1`, `.container`
`2`. Remove any one of the three and the text loses its backing.

**The logo is cropped in CSS, and the numbers come from the image file.**
`images/banner-sirah-simple.png` has wide empty margins: within its 2126×957
canvas the artwork occupies 1812×606 starting at (30, 210), so only 63% of the
height is ink. `.navigation .navbar-brand` crops the file down to that artwork.
**If the PNG is re-exported, those four numbers must be updated**, or the crop
will cut into the mark. Re-exporting it trimmed would be better, and would let
the whole rule collapse back to a plain `width`/`height`.

## Coupled values

Several numbers have to move together. Changing one alone leaves a subtle break.

**The navbar collapse point is 1200px** (`navbar-expand-xl`). Six places track
it: four `@media (max-width: 1199.98px)` blocks, one `@media (min-width: 1200px)`
for the hover dropdown, and `$(window).width() < 1200` in `js/script.js`. The JS
one is the easiest to miss — below it, the dropdown opens on click; above it, on
hover. Get them out of step and the Download menu stops working in the gap.

**The header is a fixed 88px**, and two values depend on it: `scroll-margin-top`
on `a[name]` (so in-page anchors clear the header) and the mobile menu's
`max-height: calc(100vh - 88px)`.

**The hero poster is named twice.** The `poster` attribute on the `<video>` in
`index.html` and the `background` of `.slider` in `css/style.css` both point at
`images/hero_pcv2_cover.webp`. They are meant to be the same picture, so the
page does not change when the video starts. Change both or neither.

**The hero text colours were chosen against the video.** The paragraph is
`#c8c8c8` and the title `#E3E3E4`, over the 80% overlay. See "The hero video"
for the measured contrast; a new video needs the same check.

**The section-title spacing differs by section on purpose.** `.section-title`
has `margin-bottom: 70px` globally, but `.testimonial` and `.feature` override
it. In `.feature` it is zeroed so the text column ends level with the figure
beside it. Note that the heading's own `margin-bottom` collapses with this one,
so the larger of the two wins — reducing only one may change nothing.

## The hero video

The hero (`.slider` in `index.html`) plays `images/hero_pcv2_animation_web.mp4`
behind the title. `images/hero_pcv2_cover.webp` is both its `poster` and the
CSS background, so it shows before the video loads, when it cannot load, and on
phones.

**Files.**

| File | Size | Role |
|---|---|---|
| `hero_pcv2_animation.mp4` | 9.8 MB | Master: 1920×800, 12 s, 25 fps. Not used by the page |
| `hero_pcv2_animation_web.mp4` | 2.5 MB | What the page plays: 1280×534, H.264, no audio |
| `hero_pcv2_cover.webp` | 113 KB | Poster and fallback, 1920×800 |

**Re-encoding.** From the master:

```
ffmpeg -i hero_pcv2_animation.mp4 -vf scale=1280:-2 -c:v libx264 -crf 32 -preset slow -pix_fmt yuv420p -an -movflags +faststart hero_pcv2_animation_web.mp4
```

`-movflags +faststart` puts the index at the front so playback can begin before
the file has finished downloading (the first test clip lacked it). `-pix_fmt
yuv420p` avoids the `yuvj420p` the master carries, which renders with slightly
different colour across browsers.

**Why 1280 wide, and why H.264.** The scene is thousands of spheres in motion,
which is close to the worst case for compression: the master ran at 6.6 Mb/s.
The 80% overlay lets only about a fifth of the picture through, so the detail
lost by shrinking to 1280 is not visible. Measured through the overlay (SSIM,
1.0 = identical): 1280 px at CRF 30 scores 0.982 and at CRF 34 0.972, for
3.1 MB and 2.0 MB. VP9 (9.3 MB at CRF 38) came out *larger* than H.264 on this
footage, and AV1 (6.7 MB at CRF 40) took over ten minutes to encode and is still
2.7 times the H.264 file. Do not compare frame rates across variants when
testing: an early comparison that resampled only one side read 0.78 and wrongly
suggested the downscale was a disaster.

**It plays only from 768px up.** The `<source>` carries
`media="(min-width: 768px)"`, so phones never download the file; CSS also hides
the element below 768px and under `prefers-reduced-motion`. The section is about
445×525 on a phone, nearly square, so a 2.4:1 video would show only a narrow
centre slice anyway. Whether the file is still fetched under reduced motion on a
wide screen has not been checked.

**The loop is seamless.** The last frame differs from the first by 7.2, against a
typical 13.0 between neighbouring frames. A new cut needs the same check, or it
will visibly jump every 12 seconds.

**The video is cropped, not scaled, to fit.** `object-fit: cover` fills a hero
that is 597px tall above 992px (481px measured at 800px, where the padding
shrinks) and as wide as the window, with no
CSS zoom or transform. The camera zoom you see is part of the footage: the
particle starts partly off-frame left, pulls out to whole at ~4 s, is a close-up
at ~8 s, and returns to the start. How much is cropped depends on width:

| Window | Hero | Visible |
|---|---|---|
| 800 | 785×481 | 68% of the width |
| 1024 | 1009×597 | 70% of the width |
| 1440 | 1425×597 | 99.5%, nearly all |
| 1920 | 1905×597 | 75% of the height |

**Three labels sit at the left edge and get cropped on narrower windows.**
"Protein", "DNA" and "Water & Ions" appear in turn between 5 and 8.5 s, each
with an arrow. Measured left edge of the text in the 1920px frame, and the
window width below which it starts to be cut:

| Label | Time | Text starts at | Cut below (window) |
|---|---|---|---|
| Water & Ions | ~7.4–8.5 s | 56 px | **~1365 px** |
| Protein | ~5.3–6.3 s | 151 px | ~1220 px |
| DNA | ~6.4–7.4 s | 410 px | never, from 768px up |

1366px is a common laptop width, so "Water & Ions" is right at the edge there. The
arrow tail of "Water & Ions" starts at x = 0 in the file, so it is cut at every
width; that comes from the footage. The crop was confirmed by geometry (112
source pixels per side at a 1280px window) and not by a screenshot. The durable
fix is to move the labels inward in the animation; `object-position: left center`
would trade them for the red core on the right.

**Text contrast over the footage** (WCAG, measured on 60 frames at 1440px, with
the 80% overlay applied):

| Text | Worst single pixel | 5% lightest pixels, worst frame |
|---|---|---|
| Title `#E3E3E4` | 6.96:1 | 7.92:1 |
| Paragraph `#c8c8c8` | 5.09:1 | 6.09:1 |

The paragraph was `#b9b9b9` and fell to 4.34:1 at one pixel of one frame, under
the 4.5:1 AA line, because this scene has pale spheres; hence `#c8c8c8`. Measured
at 1440px only; on wider windows the hero is shorter against the video, so the
text lands over a different part of the frame.

## Conventions

**Type.** Bricolage Grotesque (variable, 200–800) for headings, IBM Plex Sans
(300–700 plus italic) for body. Scale on a 1.25 ratio from a 16px body: h1 31,
h2 25, h3 20, card titles 17, body 16, citations 15, meta 13. Citations carry
`font-variant-numeric: tabular-nums` so volume and page numbers align.

**Colour.** `#A60F0F` is the accent, used for links, hover states, active
markers and headings. `#F5F5F5` is the one grey that divides the page into
bands — top bar, About section, footer. Body text `#7B7B7B`, nav links
`#5C5C5C`, hairlines `#E3E3E3`. Hero title `#E3E3E4`, hero paragraph `#c8c8c8`
(raised from `#b9b9b9` so it holds 4.5:1 over the video).

**Interaction.** Anything draggable also has a non-drag control: the
before/after comparison is driven by a real `<input type="range">`, which
carries the value, the keyboard access and the accessible name, while the handle
inside the image is decorative. Keep that pattern — a drag-only control is not
reachable by keyboard.

**Motion** tracks what the user is doing rather than running on its own. The
reading-progress rule and the comparison wipe follow input 1:1, with no
transition. Where there is a transition, `prefers-reduced-motion` turns it off.

## Known and left alone

- `images/sirah-logo-novo-4.png`, `aadna-3.png` and `cgdna-1.png` are no longer
  referenced but are still in the repository, as is `images/CPP_bilayer.png`
  (730 KB), the old hero background.
- `index.html` has two anchors named `ABOUT`; only the first is reachable.
- The nav markup still carries unreplaced template placeholders as class names
  (`@@news`, `@@contact`, `@@download`, `@@downloadAmber`, `@@downloadGromacs`).
  They are inert.
- `contact.html` says "Follow us" in the top bar and "Follow us in our social
  media profiles:" in the body.
- `images/sirah_box_bg_cut.png` (`.bg-5`, used by `contact.html` and
  `team.html`) is a 3332×1259, 1176 KB PNG. Because `.bg-5` uses
  `background-attachment: fixed`, `cover` sizes against the *viewport*, not the
  284px band, so the height needed is viewport height × pixel density: it is
  already short for retina screens. A 2560×1440 WebP at quality 75 measured
  64 KB. The overlay hides 80% of the picture, so more resolution would not
  show. Not changed.
