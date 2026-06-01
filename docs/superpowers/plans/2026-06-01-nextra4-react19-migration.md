# Nextra 4.6 + React 19 (App Router) Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax. There is no unit-test suite; **verification = typecheck/build/dev-render**, run after each task. Commit after each task.

**Goal:** Migrate reachat-website from Nextra 2 (Pages Router) to Nextra 4.6 + Next 15 + React 19 (App Router), mirroring the reaviz-website reference, with Tailwind v4, Pagefind search, and Cloudflare Pages SSR.

**Architecture:** App Router with a custom `app/page.tsx` landing + `app/[...mdxPath]/page.tsx` catch-all rendering MDX from `src/content/`. Theme/nav/footer via `reablocks-docs-theme@2.3.2` configured in `app/layout.tsx`. PostHog + reablocks `ThemeProvider` in a client `Providers`. Storybook removed.

**Tech Stack:** next@15.5, nextra@4.6.1, react@19.1, reablocks-docs-theme@2.3.2, reablocks@10, reachat@3.2.2, tailwindcss@4, pagefind, @cloudflare/next-on-pages.

**Reference files (read-only, copy/adapt from):** `/Users/c4r0n0s/Projects/gg/reaviz-website/src/app/{layout.tsx,[...mdxPath]/page.tsx,globals.css}`, `.../src/mdx-components.tsx`, `.../src/components/ui/{nav.tsx,footer.tsx,mdx.tsx}`, `.../src/content/docs/changelog.mdx`, `.../postcss.config.mjs`, `.../next.config.ts`, `.../wrangler.toml`, `.../tsconfig.json`, `.../next-env.d.ts`.

---

### Task 1: Dependency + scripts swap (`package.json`)

**Files:** Modify `package.json`

- [ ] **Step 1** — Replace `dependencies` versions/entries:
  - Bump: `next` → `^15.5.18`, `nextra` → `^4.6.1`, `react` → `^19.1.0`, `react-dom` → `^19.1.0`, `reablocks-docs-theme` → `2.3.2`, `reachat` → `^3.2.2`, `reablocks` → `^10.0.3`.
  - Remove: `react-live-runner` (only consumer is `runner.tsx`, deleted in Task 8), `reaviz` only if unused by examples — **keep `reaviz`** (examples/charts.mdx may use it; verify before removing).
  - Keep: `@mdx-js/mdx`, `@mdx-js/react`, `clsx`, `date-fns`, `motion`, `posthog-js`, `react-syntax-highlighter`, `sharp`, `tailwind-merge`.
- [ ] **Step 2** — Replace `devDependencies`:
  - Bump: `@types/react` → `^19`, `@types/react-dom` → `^19`, `eslint-config-next` → `^15.5.18`, `tailwindcss` → `^4.1.11`, `typescript` → `^5`.
  - Add: `@tailwindcss/postcss` `^4.1.11`, `pagefind` `^1.3.0`.
  - Remove: all `@storybook/*`, `storybook`, `storybook-addon-react-docgen`, `cpx`, `autoprefixer`, `postcss-import`.
- [ ] **Step 3** — Replace `scripts`:
  ```json
  "dev": "next dev",
  "build": "next build",
  "build:cloudflare": "next build && pagefind --site .next/server/app --output-path public/_pagefind && npx @cloudflare/next-on-pages",
  "preview": "npx wrangler pages dev .vercel/output/static",
  "postbuild": "pagefind --site .next/server/app --output-path public/_pagefind",
  "start": "next start",
  "lint": "next lint"
  ```
  Remove `storybook` and `build-storybook`. Add `"pnpm": { "overrides": { "prismjs": "^1.30.0" } }` (matches reaviz; avoids the prismjs advisory pulled transitively).
- [ ] **Step 4** — Do NOT install yet (deferred to Task 12 so all source is in place; running install now would 404 on missing files). Commit:
  ```bash
  git add package.json && git commit -m "chore: bump deps for Nextra 4 + React 19, drop Storybook"
  ```

---

### Task 2: next.config + postcss + tsconfig + gitignore

**Files:** Create `next.config.ts`, `postcss.config.mjs`; Delete `next.config.js`, `postcss.config.js`, `next.config.ts.plan`; Modify `tsconfig.json`, `.gitignore`, `next-env.d.ts`

- [ ] **Step 1** — Create `next.config.ts` (reaviz's, **minus** the SVGR rule since reachat imports no `.svg` as component, **plus** reachat's PostHog `/ingest` rewrites):
  ```ts
  import type { NextConfig } from 'next';
  import nextra from 'nextra';

  const withNextra = nextra({
    latex: true,
    defaultShowCopyCode: true,
  });

  const nextConfig: NextConfig = withNextra({
    reactStrictMode: true,
    images: { unoptimized: true },
    serverExternalPackages: ['ts-morph', '@ts-morph/common'],
    async rewrites() {
      return [
        { source: '/ingest/static/:path*', destination: 'https://us-assets.i.posthog.com/static/:path*' },
        { source: '/ingest/:path*', destination: 'https://us.i.posthog.com/:path*' },
        { source: '/ingest/decide', destination: 'https://us.i.posthog.com/decide' },
      ];
    },
  });

  export default nextConfig;
  ```
- [ ] **Step 2** — Create `postcss.config.mjs`:
  ```js
  const config = { plugins: { "@tailwindcss/postcss": {} } };
  export default config;
  ```
- [ ] **Step 3** — Delete `next.config.js`, `postcss.config.js`, `next.config.ts.plan`.
- [ ] **Step 4** — `tsconfig.json`: set `"target": "ES2017"`, add `".next/types/**/*.ts"` to `include`, keep `paths {"@/*": ["./src/*"]}`. (Match reaviz tsconfig, minus the `svgr.d.ts`/`src/stories` entries which reachat doesn't have.)
  ```json
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
  ```
- [ ] **Step 5** — `.gitignore`: add `_pagefind/` and `*.tsbuildinfo` if absent.
- [ ] **Step 6** — `next-env.d.ts`: replace with reaviz's 4-line app-router version (adds `next/navigation-types/compat/navigation` + routes ref). (Next regenerates on build; safe to leave too.)
- [ ] **Step 7** — Commit: `git add -A && git commit -m "chore: Nextra 4 next.config + Tailwind v4 postcss + tsconfig"`

---

### Task 3: Content move — `src/pages/**.mdx` → `src/content/`

**Files:** `git mv` MDX tree; later delete `src/pages/`

- [ ] **Step 1** — Create `src/content/`. Move the docs tree and support page (preserve bytes):
  ```bash
  mkdir -p src/content
  git mv src/pages/docs src/content/docs
  git mv src/pages/support.mdx src/content/support.mdx
  ```
- [ ] **Step 2** — Do NOT move `_app.tsx`, `_document.tsx`, `index.tsx` (handled in later tasks). After Tasks 4–8, `src/pages/` will be deleted entirely.
- [ ] **Step 3** — Commit: `git add -A && git commit -m "refactor: move MDX content to src/content"`

---

### Task 4: Convert `_meta.json` → `_meta.ts`

**Files:** Create `_meta.ts` in each content dir; delete the `_meta.json`s

- [ ] **Step 1** — `src/content/_meta.ts` (root nav; **keep `index` with raw/no-chrome theme** — this is what suppresses docs chrome on the `/` landing route even though its content is `app/page.tsx`):
  ```ts
  import type { MetaRecord } from 'nextra';
  const meta: MetaRecord = {
    index: {
      type: 'page',
      display: 'hidden',
      theme: { layout: 'raw', sidebar: false, pagination: false, footer: false, navbar: false, toc: false, breadcrumb: false },
    },
    docs: { title: 'Docs', type: 'page' },
    storybook: { title: 'Storybook', type: 'page', href: 'https://storybook.reachat.dev', newWindow: true },
    support: { title: 'Support', type: 'page', theme: { layout: 'full' } },
  };
  export default meta;
  ```
- [ ] **Step 2** — `src/content/docs/_meta.ts`:
  ```ts
  import type { MetaRecord } from 'nextra';
  const meta: MetaRecord = {
    index: { title: '👋 ⏐ Introduction', theme: { timestamp: false, layout: 'full', pagination: false } },
    'getting-started': '🚀 ⏐ Getting Started',
    examples: '🪄 ⏐ Examples',
    customization: '🎨 ⏐ Customization',
    api: '🏗️ ⏐ API',
    changelog: { title: '📓 ⏐ Changelog', theme: { timestamp: false } },
  };
  export default meta;
  ```
- [ ] **Step 3** — `src/content/docs/getting-started/_meta.ts`:
  ```ts
  import type { MetaRecord } from 'nextra';
  const meta: MetaRecord = { setup: 'Setup', 'getting-started': 'Getting Started', migration: 'Migration' };
  export default meta;
  ```
- [ ] **Step 4** — `src/content/docs/examples/_meta.ts`:
  ```ts
  import type { MetaRecord } from 'nextra';
  const meta: MetaRecord = {
    console: 'Console', companion: 'Companion', chat: 'Chat', providers: 'Providers',
    'ag-ui': 'AG-UI Protocol', 'component-catalog': 'Component Catalog', charts: 'Charts',
    mentions: 'Mentions', commands: 'Commands', 'file-uploads': 'File Uploads',
    status: 'Message Status', suggestions: 'Suggestions',
  };
  export default meta;
  ```
- [ ] **Step 5** — `src/content/docs/customization/_meta.ts`:
  ```ts
  import type { MetaRecord } from 'nextra';
  const meta: MetaRecord = { figma: 'Figma', theme: 'Theme', custom: 'Custom Components', markdown: 'Markdown' };
  export default meta;
  ```
- [ ] **Step 6** — `src/content/docs/api/_meta.ts`:
  ```ts
  import type { MetaRecord } from 'nextra';
  const meta: MetaRecord = { models: 'Models', components: 'Components' };
  export default meta;
  ```
- [ ] **Step 7** — Delete all `_meta.json` under `src/content`: `find src/content -name _meta.json -delete`
- [ ] **Step 8** — Commit: `git add -A && git commit -m "refactor: convert _meta.json to _meta.ts"`

---

### Task 5: App Router skeleton — layout, catch-all, providers, mdx-components

**Files:** Create `src/app/layout.tsx`, `src/app/[...mdxPath]/page.tsx`, `src/app/providers.tsx`, `src/mdx-components.tsx`

- [ ] **Step 1** — `src/mdx-components.tsx` (copy reaviz verbatim):
  ```tsx
  import { useMDXComponents as getDocsMDXComponents } from 'reablocks-docs-theme';
  const docsComponents = getDocsMDXComponents();
  export const useMDXComponents: typeof getDocsMDXComponents = (components) => ({
    ...docsComponents,
    ...components,
  });
  ```
- [ ] **Step 2** — `src/app/[...mdxPath]/page.tsx` (copy reaviz verbatim, swap "Reaviz" strings → "reachat"). Source: reaviz `src/app/[...mdxPath]/page.tsx`. Uses `generateStaticParamsFor("mdxPath")`, `importPage`, `isValidMdxPath`, `Wrapper = useMDXComponents().wrapper!`.
- [ ] **Step 3** — `src/app/providers.tsx` (client; reablocks ThemeProvider + PostHog, ported from old `_app.tsx`):
  ```tsx
  'use client';
  import { useEffect } from 'react';
  import { ThemeProvider, theme } from 'reablocks';
  import posthog from 'posthog-js';
  import type { PropsWithChildren } from 'react';

  export function Providers({ children }: PropsWithChildren) {
    useEffect(() => {
      try {
        posthog.init('phc_B3nKncJbom5SWf7IpIQtwFbR8JNeHYjjFP5BR947Lot', {
          api_host: '/ingest',
          ui_host: 'https://us.posthog.com',
        });
      } catch { /* noop */ }
    }, []);
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
  }
  ```
- [ ] **Step 4** — `src/app/layout.tsx` (adapt reaviz; reachat metadata + OG tags from old `_document.tsx`/`theme.config.tsx`; wrap children in `<Providers>` inside `<Layout>`; logo via the reachat SVG logo inline or `/logo.svg`). Skeleton:
  ```tsx
  import { Layout } from 'reablocks-docs-theme';
  import { Head } from 'nextra/components';
  import { getPageMap } from 'nextra/page-map';
  import type { Metadata } from 'next';
  import type { PropsWithChildren } from 'react';
  import { Nav } from '@/components/ui/nav';
  import { Footer } from '@/components/ui/footer';
  import { Providers } from './providers';
  import 'reablocks-docs-theme/style.css';
  import './globals.css';

  export const metadata: Metadata = {
    title: 'reachat - Build Chat Experiences in Hours, Not Weeks.',
    description: 'Open-source UI Building Blocks for LLM and ChatUIs for ReactJS',
    icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
    openGraph: {
      images: 'https://reachat.dev/preview.png',
      title: 'reachat - Build Chat Experiences in Hours, Not Weeks.',
      description: 'Open-source UI Building Blocks for LLM and ChatUIs for ReactJS',
    },
    twitter: {
      title: 'reachat - Build Chat Experiences in Hours, Not Weeks.',
      description: 'Open-source UI Building Blocks for LLM and ChatUIs for ReactJS',
    },
  };

  export default async function RootLayout({ children }: PropsWithChildren) {
    return (
      <html lang="en" dir="ltr" suppressHydrationWarning className="h-full">
        <Head />
        <body className="flex flex-col antialiased text-white">
          <Layout
            navbar={<Nav />}
            pageMap={await getPageMap()}
            docsRepositoryBase="https://github.com/reaviz/reachat-website/tree/master"
            editLink="Edit this page on GitHub"
            sidebar={{ defaultMenuCollapseLevel: 3, autoCollapse: false }}
            footer={<Footer />}
            nextThemes={{ defaultTheme: 'dark', forcedTheme: 'dark' }}
          >
            <Providers>{children}</Providers>
          </Layout>
        </body>
      </html>
    );
  }
  ```
  Note: reachat is dark-only today (`html.dark` forced on landing). Use `nextThemes={{ defaultTheme: 'dark' }}` first; if light styles leak, add `forcedTheme: 'dark'`.
- [ ] **Step 5** — Commit: `git add -A && git commit -m "feat: App Router layout, catch-all route, providers, mdx-components"`

---

### Task 6: Docs `Nav` + `Footer` components (theme-based)

**Files:** Create `src/components/ui/nav.tsx`, `src/components/ui/footer.tsx`. (NOTE: the existing landing nav is `src/components/layout/nav.tsx` — leave it; this is a new docs Nav.)

- [ ] **Step 1** — `src/components/ui/nav.tsx` (client; reablocks-docs-theme `<Navbar>` with reachat logo). Use the inline reachat logo SVG from old `theme.config.tsx`, or `/logo.svg`:
  ```tsx
  'use client';
  import { Navbar } from 'reablocks-docs-theme';
  import Image from 'next/image';
  export const Nav = () => (
    <Navbar
      logo={<Image src="/logo.svg" alt="reachat" width={105} height={24} className="h-fit w-[105px]" />}
      projectLink="https://github.com/reaviz/reachat"
    />
  );
  ```
- [ ] **Step 2** — `src/components/ui/footer.tsx` (client; reachat's "Made with ❤️ by GoodCode" footer from old theme.config):
  ```tsx
  'use client';
  import { Footer as NextraFooter } from 'reablocks-docs-theme';
  import Link from 'next/link';
  export const Footer = () => (
    <NextraFooter className="flex w-full justify-center py-5">
      <span className="text-center">
        Made with ❤️ by{' '}
        <Link className="text-secondary underline" href="https://goodcode.us?utm_source=reachat">Good Code</Link>
      </span>
    </NextraFooter>
  );
  ```
- [ ] **Step 3** — Commit: `git add -A && git commit -m "feat: docs Nav + Footer via reablocks-docs-theme"`

---

### Task 7: Landing page — `index.tsx` → `app/page.tsx` (+ client `Landing`)

**Files:** Create `src/app/page.tsx` (server, metadata), `src/components/landing.tsx` (client, the current Home body)

- [ ] **Step 1** — Create `src/components/landing.tsx`: copy the full JSX body of the current `src/pages/index.tsx` `Home()` into a `'use client'` component named `Landing`. Changes: add `'use client'` at top; **remove** `import Head from 'next/head'` and the `<Head>…</Head>` block (metadata moves to page.tsx); keep `useState`/`useEffect` scroll logic (already uses `removeEventListener` correctly); keep `next/font/google` Inter import + `inter.className` (next/font is allowed in client components); keep imports of `@/components/layout/nav`, `@/components/ui/*`, `@/icons/*`, `@/utils/cn`. Remove the `export const metadata` (moves to page.tsx).
- [ ] **Step 2** — Create `src/app/page.tsx` (server component, metadata only):
  ```tsx
  import type { Metadata } from 'next';
  import { Landing } from '@/components/landing';
  export const metadata: Metadata = {
    title: 'reachat - Build Chat Experiences in Hours, Not Weeks.',
    description: 'Open-source UI Building Blocks for LLM / Chat UIs',
    icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  };
  export default function Home() { return <Landing />; }
  ```
- [ ] **Step 3** — Commit: `git add -A && git commit -m "feat: landing page in App Router (server metadata + client Landing)"`

---

### Task 8: Component fixes + deletions + changelog rework

**Files:** Modify `src/components/utils/Count/Count.tsx`, `src/components/ui/mdx.tsx`, `src/content/docs/changelog.mdx`; Delete `src/components/ui/{block-canvas,toggle-canvas,runner}.tsx`, `src/pages/`, `theme.config.tsx`

- [ ] **Step 1** — `Count.tsx`: remove `Count.defaultProps` block (React 19). Defaults already live in `useCount`/`COUNT_DEFAULTS`, so just delete lines 13–19. Result is `export const Count: FC<CountProps> = ({ className, ...rest }) => { const ref = useCount(rest); return <span ref={ref} className={className} />; };`
- [ ] **Step 2** — `src/components/ui/mdx.tsx`: replace entirely with reaviz's `'use client'` `evaluate`-based version (source: reaviz `src/components/ui/mdx.tsx`). It has no `nextra/*` import.
- [ ] **Step 3** — `src/content/docs/changelog.mdx`: replace with the Nextra-4 async-server-component pattern (reaviz's, with reachat's repo URL):
  ```mdx
  import Mdx from '@/components/ui/mdx';

  export async function Changelog() {
    try {
      const response = await fetch('https://raw.githubusercontent.com/reaviz/reachat/master/CHANGELOG.md');
      if (!response.ok) throw new Error('Failed to fetch changelog');
      const text = await response.text();
      return <Mdx>{text}</Mdx>;
    } catch (error) {
      return (
        <div className="p-4 text-center">
          <p>Unable to load changelog. Please visit the <a href="https://github.com/reaviz/reachat/blob/master/CHANGELOG.md" className="text-primary underline">GitHub repository</a> for the latest changelog.</p>
        </div>
      );
    }
  }

  <Changelog />
  ```
- [ ] **Step 4** — Delete unused/Storybook-coupled components and Pages Router leftovers:
  ```bash
  git rm src/components/ui/block-canvas.tsx src/components/ui/toggle-canvas.tsx src/components/ui/runner.tsx
  git rm -r src/pages
  git rm theme.config.tsx
  rm -rf .storybook
  ```
- [ ] **Step 5** — Commit: `git add -A && git commit -m "fix: React 19 Count, Nextra 4 Mdx/changelog, delete Storybook+Pages-Router files"`

---

### Task 9: Tailwind v4 `globals.css`

**Files:** Create `src/app/globals.css`; delete `src/styles/globals.css` + `tailwind.config.ts`

- [ ] **Step 1** — Create `src/app/globals.css` starting with: `@import "tailwindcss";` then `@source './**/*.{ts,tsx}';`, `@source '../../node_modules/reablocks';`, `@source '../../node_modules/reachat';`. Keep importing reablocks component CSS for v10 theming: add `@import "reablocks/index.css";` near the top (verify exact path post-install; fallback `reablocks/dist/index.css`).
- [ ] **Step 2** — Add `@theme` block porting reachat's `tailwind.config.ts` tokens:
  ```css
  @theme {
    --breakpoint-2xl: 1440px;
    --font-sans: Inter, sans-serif;
    --font-inter: Inter, sans-serif;

    --text-sm: 0.75rem;   --text-sm--line-height: 1rem;
    --text-base: 0.875rem; --text-base--line-height: 1.25rem;
    --text-lg: 1rem;      --text-lg--line-height: 1.5rem;

    --color-blue-100: #E7EFFF; --color-blue-200: #C3D7FF; --color-blue-300: #87AEFF;
    --color-blue-400: #4C86FF; --color-blue-500: #105EFF; --color-blue-600: #0D4ED2;
    --color-blue-700: #0A3DA6; --color-blue-800: #082D79; --color-blue-900: #051C4C; --color-blue-950: #041028;

    --color-primary: #105EFF;
    --color-primary-hover: #4C86FF;
    --color-secondary: #87AEFF;
    --color-content-primary: #F2F3F7;
    --color-content-secondary: #C6CBD9;

    --shadow-button: 0px 4px 16px 0px rgba(0,0,0,0.25);
    --shadow-card: 0px 4px 16px 0px rgba(0,0,0,0.25);
  }
  ```
- [ ] **Step 3** — Add the custom gradient utilities as plain CSS (Tailwind v4 has no `bg-{image}` namespace; the landing references `bg-gradient-line` and `bg-gradient-code`):
  ```css
  .bg-gradient-line { background-image: linear-gradient(90deg, rgba(38,38,49,0) 19.91%, #87AEFF 100%); }
  .bg-gradient-code { background-image: linear-gradient(180deg, rgba(54,70,109,0.90) 0%, rgba(45,58,93,0.90) 100%); }
  .text-content-primary { color: var(--color-content-primary); }
  .text-content-secondary { color: var(--color-content-secondary); }
  ```
- [ ] **Step 4** — Port the still-relevant overrides from the OLD `src/styles/globals.css` (dark/light `--background` vars, `body` bg/color, `.rb-code`, `.rb-code-block`, `pre.highlighter code`, `.prismjs > div`, `input` ring reset, `svg { overflow: visible }`, `.text-balance` util). **Drop** all Storybook-only rules (`.sbdocs*`, `.docblock-code-toggle*`) and re-check the `.nextra-*` selectors against Nextra 4 (the `.nx-sticky`, `.nextra-nav-container-blur`, etc. likely changed — keep only ones that still match; verify in dev).
- [ ] **Step 5** — Delete `src/styles/globals.css` and `tailwind.config.ts`.
- [ ] **Step 6** — Commit: `git add -A && git commit -m "feat: Tailwind v4 globals.css with ported reachat tokens"`

---

### Task 10: Install + first build (verification gate A)

- [ ] **Step 1** — `pnpm install` → expect clean resolution (peer warnings for `react-compiler-runtime` are non-fatal; reaviz builds without it). If a hard ERR_PNPM peer failure occurs, add `react-compiler-runtime@^19.1.0-rc.2` to deps and re-install.
- [ ] **Step 2** — `pnpm exec tsc --noEmit` (or `pnpm build`) and fix type errors iteratively. Expected categories: stale `nextra/*` v2 imports (none should remain — grep `grep -rn "nextra/mdx\|nextra/data\|next/router\|next/head\|getStaticProps" src`), React 19 type tightenings.
- [ ] **Step 3** — `pnpm build`. Expected: compiles, generates static params for all `/docs/*` + `/support`, runs Pagefind postbuild. Fix errors until green. **Do NOT proceed until `pnpm build` succeeds.**
- [ ] **Step 4** — Commit any fixes: `git commit -am "fix: resolve build/type errors for Nextra 4 migration"`

---

### Task 11: Dev render verification (gate B) + CSS iteration

- [ ] **Step 1** — `pnpm dev`, then verify each route renders correctly (use the `verify`/`run` skill or curl + screenshot):
  - `/` — landing: animations, gradient-line divider, hero images, feature cards, "Install in 3 Steps", footer; NO docs sidebar/navbar chrome (confirms root `_meta` `index` raw theme works).
  - `/docs` — Introduction (full layout), sidebar nav with emoji section titles, dark theme.
  - `/docs/examples/console` — live `<Chat/>` renders **styled** (confirms reablocks `ThemeProvider` reaches inline MDX components). If unstyled, verify `<Providers>` ThemeProvider placement / the `reablocks/index.css` import.
  - `/docs/api/components` — 41-row `<PropsTable>` populated from `reachat/docs.json`.
  - `/docs/changelog` — remote changelog renders via `<Mdx>`.
  - Search box (Pagefind) returns results after a build.
- [ ] **Step 2** — Iterate on `src/app/globals.css` until landing tokens + docs theming + inline `<Chat/>` match the pre-migration look. Re-run build after CSS edits affecting Pagefind/SSR.
- [ ] **Step 3** — Commit: `git commit -am "style: finalize Tailwind v4 / theme overrides for parity"`

---

### Task 12: Cloudflare build + wrangler (gate C)

**Files:** Modify `wrangler.toml`

- [ ] **Step 1** — `wrangler.toml` → reaviz layout (top-level `pages_build_output_dir`, `[vars]` with the devDeps fix):
  ```toml
  name = "reachat-website"
  compatibility_date = "2024-09-23"
  compatibility_flags = ["nodejs_compat"]
  pages_build_output_dir = ".vercel/output/static"

  [vars]
  NODE_ENV = "production"
  NPM_CONFIG_PRODUCTION = "false"
  ```
- [ ] **Step 2** — `pnpm build:cloudflare` → expect `.vercel/output/static` produced (next build → pagefind → next-on-pages). Fix any edge-runtime issues (none expected — no API routes in reachat).
- [ ] **Step 3** — `pnpm preview` → smoke-test landing + a docs page locally on the worker.
- [ ] **Step 4** — Commit: `git add -A && git commit -m "chore: Cloudflare Pages SSR wrangler + pagefind build"`

---

## Self-review notes
- **Spec coverage:** deps (T1), config/postcss/tsconfig (T2), content move (T3), meta conversion (T4), app skeleton/layout/providers/mdx-components (T5), nav/footer (T6), landing (T7), React-19 + Mdx + changelog + deletions (T8), Tailwind v4 (T9), build (T10), dev render (T11), deploy (T12). All spec sections mapped.
- **Naming consistency:** docs Nav/Footer live at `src/components/ui/{nav,footer}.tsx`; landing nav stays at `src/components/layout/nav.tsx`; landing body at `src/components/landing.tsx`; `useMDXComponents` exported from `src/mdx-components.tsx` and consumed by the catch-all.
- **Open risks resolved during execution (not pre-decided):** exact `reablocks/index.css` path; whether a second reablocks `ThemeProvider` is needed (T5/T11); which `.nextra-*` overrides survive Nextra 4 (T9/T11); `react-compiler-runtime` only if install fails (T10).
