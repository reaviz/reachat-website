# reachat-website → Nextra 4.6 + React 19 (App Router) Migration

**Date:** 2026-06-01
**Branch:** `nextra4-migration`
**Reference implementation:** `/Users/c4r0n0s/Projects/gg/reaviz-website` (already on Nextra 4.6 + Next 15 + React 19, App Router, `reablocks-docs-theme@2.3.2`, Tailwind v4, Pagefind, Cloudflare Pages SSR)

## Goal

Migrate reachat-website from **Nextra 2 (Pages Router)** to **Nextra 4.6 + Next 15 + React 19 (App Router)**, mirroring the proven reaviz-website architecture. Confirmed decisions: **Tailwind v3 → v4**, **remove Storybook**, **adopt Pagefind + Cloudflare Pages SSR**.

## Current state (source)

- `nextra ^2.13.4`, `next ^14`, `react ^18`, Pages Router under `src/pages/`.
- `theme.config.tsx` (reablocks-docs-theme v0.0.2 config), `_app.tsx` (PostHog init + reablocks `ThemeProvider` + a `@storybook/blocks` `ExternalDocs`/`Unstyled` wrapper for docs pages), `_document.tsx` (OG/Twitter meta).
- 24 MDX files: `docs/{index,changelog}`, `docs/getting-started/{setup,getting-started,migration}`, `docs/examples/{console,companion,chat,providers,ag-ui,component-catalog,charts,mentions,commands,file-uploads,status,suggestions}`, `docs/customization/{figma,theme,custom,markdown}`, `docs/api/{models,components}`, top-level `support.mdx`. Custom landing at `src/pages/index.tsx`.
- `_meta.json` at root + each docs subfolder. URLs: `/` (landing), `/docs/*`, `/support`, external Storybook link.
- Tailwind v3 with a custom blue palette + `addVariablesForColors` plugin; `globals.css` imports `reablocks-docs-theme/style.css` + `reablocks/dist/index.css` and heavily overrides `.nextra-*` classes.
- Storybook 7.6.3 present but **zero usage in MDX** (verified: no `Canvas`/`BlockCanvas`/`@storybook` in any `.mdx`). Examples render **live `reachat` components inline**.
- `PropsTable` (used 41× in `docs/api/components.mdx`) reads `reachat/docs.json` (present). `<Mdx>` runtime component used 1× in `changelog.mdx` (imports `nextra/mdx`).
- PostHog init in `_app.tsx`. Cloudflare Pages via `wrangler.toml` + `build:cloudflare`.

## Compatibility matrix (verified via npm)

- `reablocks-docs-theme@2.3.2` (latest) peers: `react >=19.1`, `react-dom >=19.1`, `nextra >=4.6`, `next >=14`, `react-compiler-runtime ^19.1.0-rc.2`.
- `reachat@3.2.2` peers: `react >=18`, `react-dom >=18`, `reaviz >=16`. (node_modules currently has stale 2.0.2; reinstall pulls 3.2.2.)
- `reablocks@10` and the theme are decoupled (theme does not peer reablocks) → keep reablocks ^10.
- Proven reaviz set: next 15.5.18, nextra 4.6.1, react 19.2.x, reablocks 8.7.15, reaviz 16.1.4, tailwindcss 4.1.

## Target architecture (mirror reaviz)

### Dependencies (`package.json`)
- **Bump:** next→^15.5, nextra→^4.6.1, react/react-dom→^19.1, @types/react(-dom)→^19, eslint-config-next→^15.5, reablocks-docs-theme→2.3.2, reachat→^3.2.2, tailwindcss→^4.1.
- **Add:** @tailwindcss/postcss, @svgr/webpack, pagefind, react-compiler-runtime, react-runner (R19 peer of react-live-runner, as in reaviz).
- **Remove:** all @storybook/*, storybook, storybook-addon-react-docgen, cpx, autoprefixer, postcss-import, reablocks-docs-theme@0.0.2.
- **Scripts:** add Pagefind `postbuild` + reaviz-style `build:cloudflare` (`next build && pagefind --site .next/server/app --output-path public/_pagefind && npx @cloudflare/next-on-pages`); drop `storybook`/`build-storybook`.

### App Router skeleton (new `src/app/`)
- `layout.tsx` — async; `<Head/>` from `nextra/components`; `<Layout>` from `reablocks-docs-theme` with `pageMap={await getPageMap()}`, `navbar={<Nav/>}`, `footer={<Footer/>}`, `docsRepositoryBase="https://github.com/reaviz/reachat-website"`, `sidebar={{ defaultMenuCollapseLevel: 3 }}`, `nextThemes`. Imports `reablocks-docs-theme/style.css` then `./globals.css`. Hosts OG/Twitter metadata from old `_document.tsx`/`theme.config.tsx`. Wraps children in client `<Providers>`.
- `[...mdxPath]/page.tsx` — non-optional catch-all (keeps `/` free for `app/page.tsx`): `generateStaticParamsFor('mdxPath')`, `importPage`, `generateMetadata`, `Wrapper = useMDXComponents().wrapper`, reaviz's `isValidMdxPath` guard.
- `page.tsx` — custom landing (see below).
- `providers.tsx` — `'use client'`: reablocks `ThemeProvider` + PostHog init (from `_app.tsx`).
- `src/mdx-components.tsx` — merge `getDocsMDXComponents()` from theme + reachat overrides (`Mdx`, `PropsTable`, and the `rb-code`/`prismjs` `code`/`pre` overrides from the old theme.config).
- **Delete:** `src/pages/_app.tsx`, `src/pages/_document.tsx`, `theme.config.tsx`.

### Content (`src/pages/**.mdx` → `src/content/`)
- Move `docs/**` (23 MDX, byte-for-byte) + `support.mdx`. **No `contentDirBasePath`** → URLs unchanged (`/docs/*`, `/support`). Discard `next.config.ts.plan`.
- Convert every `_meta.json` → `_meta.ts` (`export default {…} satisfies MetaRecord`), preserving titles/`type: 'page'`/external `href`/per-page `theme`. Root `_meta.ts` drops the `index` entry.

### Landing (`index.tsx` → `app/page.tsx`)
- `'use client'`; preserve all animations (`TracingBeams`, `HeroParallax`, `AnimateIn`, `Count`, `SignatureDivider`, `Card`/`IconCard`, `Nav`). Drop `next/head` → `export const metadata`. Fix latent `document.removeListener` → `removeEventListener`. Visual output unchanged.

### Components & React 19
- **Keep:** nav, hero-parallax, tracing-beams, signature-divider, animate-in, card, icon-card, badge, divider, props-table (docs.json, unchanged), useViewportDimensions, icons.
- **Fix:** `Count.tsx` `defaultProps` → default params. `mdx.tsx` replace `nextra/mdx` import with Nextra 4 source.
- **Delete (unused + Storybook-coupled):** `block-canvas.tsx`, `toggle-canvas.tsx`, `runner.tsx`.

### Styling — Tailwind v4
- `postcss.config.mjs` → single `@tailwindcss/postcss`. Delete `tailwind.config.ts` + `postcss.config.js`.
- `globals.css` → `@import "tailwindcss"`; port blue palette / `primary`/`secondary`/`content` / gradients (`gradient-line`, `gradient-code`) / `shadow-button` / 14px font scale into `@theme`; add `@source` for `./**/*.{ts,tsx}` + `node_modules/reablocks` + `node_modules/reachat`. Re-audit `.nextra-*` overrides against Nextra 4 class names; keep `rb-code`/code-block rules.

### next.config / deploy / search
- `next.config.ts` = reaviz's (`withNextra({ latex, defaultShowCopyCode })`, `serverExternalPackages: ['ts-morph','@ts-morph/common']`, SVGR webpack rule, `images.unoptimized`) **plus** reachat's PostHog `/ingest` rewrites. Delete `next.config.js`.
- `wrangler.toml`: top-level `pages_build_output_dir`, `[vars] NODE_ENV=production` + `NPM_CONFIG_PRODUCTION=false`. `.gitignore`: add `_pagefind/`. tsconfig: add `@/*` alias already present; ensure `.next/types` include.

## Verification gates

1. `pnpm install` clean.
2. `pnpm build` succeeds (no Pages-Router / nextra-v2 import errors).
3. `pnpm dev` renders: landing `/`; `/docs/examples/console` with live `<Chat/>`; `/docs/api/components` 41-row PropsTable; `/docs/changelog` `<Mdx>`; sidebar nav; dark mode toggle; search box.
4. `pnpm build:cloudflare` + `pnpm preview` produce a working SSR bundle.

## Top risks

1. Nextra 4 renamed `.nextra-*` classes → heavy `globals.css` overrides may need rework (diff against reaviz's smaller set).
2. Live `<reachat>`/`reablocks` components inside RSC-rendered MDX may need a `'use client'` boundary; theme proves the pattern.
3. `reablocks@10` (app) vs theme's bundled reablocks → possible duplicate-instance theming quirks; verify visually.

## Out of scope

- The separate `storybook.reachat.dev` deploy (untouched; nav still links to it).
- Content rewrites/redesign (MDX preserved byte-for-byte).
