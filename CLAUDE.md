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

**The section-title spacing differs by section on purpose.** `.section-title`
has `margin-bottom: 70px` globally, but `.testimonial` and `.feature` override
it. In `.feature` it is zeroed so the text column ends level with the figure
beside it. Note that the heading's own `margin-bottom` collapses with this one,
so the larger of the two wins — reducing only one may change nothing.

## Conventions

**Type.** Bricolage Grotesque (variable, 200–800) for headings, IBM Plex Sans
(300–700 plus italic) for body. Scale on a 1.25 ratio from a 16px body: h1 31,
h2 25, h3 20, card titles 17, body 16, citations 15, meta 13. Citations carry
`font-variant-numeric: tabular-nums` so volume and page numbers align.

**Colour.** `#A60F0F` is the accent, used for links, hover states, active
markers and headings. `#F5F5F5` is the one grey that divides the page into
bands — top bar, About section, footer. Body text `#7B7B7B`, nav links
`#5C5C5C`, hairlines `#E3E3E3`.

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
  referenced but are still in the repository.
- `index.html` has two anchors named `ABOUT`; only the first is reachable.
- The nav markup still carries unreplaced template placeholders as class names
  (`@@news`, `@@contact`, `@@download`, `@@downloadAmber`, `@@downloadGromacs`).
  They are inert.
- `contact.html` says "Follow us" in the top bar and "Follow us in our social
  media profiles:" in the body.
