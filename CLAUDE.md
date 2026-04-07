# Interface Components

## Project

SvelteKit + Lit 3 web component library with live demos. Deploys to Cloudflare Workers (workers.dev) and Pages (pages.dev).

## Stack

- **Runtime:** Bun
- **Framework:** SvelteKit 2 + Svelte 5
- **Components:** Lit 3 (magx Panel + Sparkline)
- **Build:** Vite 6
- **Deploy:** Cloudflare Workers with assets (`wrangler deploy`) + Pages (`wrangler pages deploy build`)

## Commands

```bash
bun run dev       # dev server
bun run build     # production build
bun run preview   # preview build
bun run deploy    # build + deploy to CF Pages
```

## Build Version Convention

**Format:** `MM.NN.sha5` (e.g., `1.1.0.a3b4c`)

- `MM.NN` = semver major.minor from `package.json`
- `.sha5` = first 5 characters of the git commit SHA at build time
- Injected at build via Vite `define` in `vite.config.ts` as `__BUILD_VERSION__`
- Displayed in the header next to the nav icon

**Versioning rules:**
- Bump **minor** on each feature iteration
- Bump **major** on breaking changes or major redesigns
- Patch version is implicit via the SHA

**On deploy, always report:**
1. List of features/fixes added
2. Confirmation of CF push (workers.dev + pages.dev URLs)
3. Build version string (version + SHA) for verification

## Architecture

- `/magx/Panel/` - Lit web component: draggable panels
- `/magx/Sparkline/` - Lit web component: canvas sparkline charts
- `/src/routes/` - SvelteKit pages (+page.svelte, +layout.svelte)
- `/src/lib/components/` - Svelte demo components
- `/src/lib/stores/` - Svelte stores (search, theme, highlight color)
- `/src/lib/data/` - Component definitions, FA icon data
- `/src/lib/styles/` - Theme CSS variables, global layout

## Responsive Breakpoints

- Mobile: `<768px` (sidebar hidden, 2-col sparkline grid)
- Desktop: sidebar 240px, auto-fill sparkline grid

## Theming

- CSS variables in `src/lib/styles/theme.css`
- Light/dark auto-detect + manual toggle
- Accent color configurable via header icon click (persisted to localStorage)
