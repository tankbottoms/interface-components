# Changelog

Versions are `MM.NN.sha5` — major.minor from `package.json`, then five characters
of the commit that built the deploy. The patch segment is deliberately absent:
the SHA is the patch.

## 1.15 — palette, security headers, QA harness

**Palette**

- The site accent palette is now the **eight elegant pastels in sheet order**
  (Orchid Mist, Violet, Peach, Vanilla, Blush, Rose, Aqua, Mint), matching
  section 02 of `/interface/palette`. It previously used chart-series order,
  which meant the same eight hues were published in two competing sequences.
- `accentSwatches` is now **derived from `elegantPastels`** rather than
  hand-copied. The duplicate list had already drifted once; one array is the
  palette and everything else is a view of it.
- Mint remains the default accent. A stored accent from a retired palette still
  migrates to mint automatically.

**Responsive**

- Added a tablet tier. A single 900px breakpoint sent 3- and 4-up grids straight
  to one column, so an iPad in portrait laid out exactly like a phone and gave
  back roughly half its width as margin. Now `≤1024px` halves those grids to two
  columns and only `≤640px` collapses to one.

**Security**

- `static/_headers` — `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, a `Permissions-Policy` that
  denies camera/microphone/geolocation/payment/USB, both Cross-Origin-*
  isolation headers, and HSTS. The site previously shipped none of these.
- Content-Security-Policy generated per page in **hash mode** via `kit.csp`.
  Every page is prerendered, so there is no server to mint a nonce; SvelteKit
  hashes its own inline hydration script at build time. `script-src` is
  hash-only. `style-src` keeps `'unsafe-inline'` because the pattern pages set
  swatch and chart colours through `style=` attributes — that is the palette
  being demonstrated, and CSP does not hash attributes.
- `compatibility_date` bumped from 2024-01-01 to 2025-11-01.

**Tooling and hygiene**

- Added `lint` (oxlint + the `tools/oxlint/anti-slop` rule plugin, which was
  configured but had no entry point), `test`, and `qa` scripts. The lint
  apparatus was previously unrunnable through the documented commands.
- New `tools/qa/responsive.ts` — loads every route at four viewports and reports
  horizontal overflow with the offending selector, console errors, failed
  requests, and any request leaving the origin.
- `update-check/wrangler-latest.json` (wrangler's own update cache, committed by
  accident) untracked and gitignored.
- `package.json` author set to `M.P.`
- README: corrected the live URL, which pointed at a hostname the site is not
  deployed to; corrected "Deploy to Cloudflare Pages", a target that was dropped;
  documented the six Interface pages, which were absent; documented `check`,
  `lint`, `test` and `qa`.

## 1.14 — build stamp

- Build stamp added to the footer of every page, not just the home hero. The
  question it answers — "is this the page I just deployed, or the one my browser
  kept?" — gets asked from whichever page happens to be open.
- Version format corrected from four segments to three. `1.13.0.dfa8b` read as a
  truncated number rather than a version plus a hash.

## 1.13 — interface patterns

- New `/interface` section: charting, layout & data, documents, wayfinding,
  settings & analytics, palette.
- Guided tour with fairy-dust highlighting — no page darkening, no square
  cut-outs.
- Glyph-only title badges; charting cards centred.
- Type-health: `svelte-check` driven to zero across 380 files. Path aliases
  migrated from `tsconfig.paths` to `kit.alias`.
