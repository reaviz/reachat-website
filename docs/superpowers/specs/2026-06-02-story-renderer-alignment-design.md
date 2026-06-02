# reachat-website → Story Renderer alignment with reaviz-website

Date: 2026-06-02
Branch: `nextra4.6`
Status: Approved design — pending spec review → implementation plan

## Goal

Replace reachat-website's hand-written, drift-prone live demos (`src/components/examples/*.tsx` + manually duplicated ```tsx code blocks) with reaviz-website's **story-renderer model**: copy reachat's published `*.stories.tsx`, render the whole story module live via `reablocks-docs-theme`'s `StoryRenderer`, and show source from a build-generated JSON served by an edge route.

One story file is the single source of truth for both the rendered demo and its displayed source — eliminating the demo/code drift that exists today.

## Decisions (locked)

- **Blocker strategy:** Fix at the **reachat library** so stories are consumable from the installed package (not a website-only copy-script rewrite).
- **Rollout:** **Validated PoC first** — build the full pipeline and prove it end-to-end on two pages, then expand.
- **Scope of renderer:** **`StoryRenderer` only** (read-only live preview + "Show code"). No editable `<Runner>` / react-live-runner playground.
- **Library fix mechanism:** **dist-transform** (preserve reachat's own Storybook; rewrite imports only in the published `dist/stories/`). Self-alias was the considered alternative.
- **PoC story exports:** `MessageStatus.stories.tsx:WithSteps` and `ChatSuggestions.stories.tsx:Basic`.

## Current state (source)

- **reachat-website demos:** `src/components/examples/{chat,companion,console,status,suggestions}.tsx` — each `'use client'`, inline fixtures, fixed dark-box wrapper, imported into MDX as `<XExample/>`; source hand-duplicated in a ```tsx block below. Only 5 of 12 example pages have a live demo.
- **Already present:** `reablocks-docs-theme@2.3.2` (ships `StoryRenderer` + `getStorySource`), Nextra 4.6, React 19, Cloudflare Pages SSR build (`build:cloudflare`, `wrangler.toml`), `(docs)` route group that scopes `reablocks/index.css` (load-bearing — see Risks).
- **Missing:** `scripts/`, `public/_story-sources.json`, `src/app/api/story-source/route.ts`, `src/components/ui/story-renderer.tsx`, `@svgr/webpack` `*.svg?react` rule, `src/stories/`.

## reaviz-website reference architecture (what we mirror)

Three parts:

1. **Build pipeline.** `scripts/copy-stories.mjs` (Node-builtins only, runs on `postinstall`) copies `node_modules/reaviz/dist/stories/*.story.tsx` → `src/stories/components`. `scripts/generate-story-sources.mjs` regex-walks `src/stories/**`, extracts each `export const Uppercase` story body, writes `public/_story-sources.json` keyed `"<relPath>:<ExportName>"`.
2. **Runtime.** `src/components/ui/story-renderer.tsx` (`'use client'`) does `next/dynamic(() => import('../../stories/' + path), {ssr:false})` to import the **whole** story module (so module-level scope resolves), hands it to `reablocks-docs-theme`'s `StoryRenderer`, which executes the CSF export live (`story.render(args,ctx)` / `story(args)` / `<Component {...args}/>`). "Show code" fetches `/api/story-source` (`runtime='edge'`, Cloudflare has no `fs`) which reads the generated JSON.
3. **Glue.** Each MDX imports `StoryRenderer` explicitly (no global registration); `globals.css` ports reablocks code-block/story CSS overrides.

reachat's stories are the same Storybook CSF: 5 of 6 main files are function-flavor (`export const X = () => <JSX/>`) like reaviz; `MessageStatus` is CSF3 `StoryObj` (`{args, render}`). The vendored `StoryRenderer` already dispatches both.

## Target architecture

### A. reachat library changes (`/Users/c4r0n0s/Projects/gg/reachat`)

Make stories portable from the package without disturbing reachat's own Storybook (which imports `../src`):

- **Build-time dist transform:** reachat's build emits `dist/stories/*` — both `*.stories.tsx` **and** the shared `examples.ts` — with internal specifiers rewritten `'../src' | '../src/X' | '@/types' | '@/...' → 'reachat'`, and copies `stories/assets/` → `dist/stories/assets/`. Source `stories/*` keep `../src` for Storybook.
- **PoC scope of the fix:** only `ChatSuggestions.stories.tsx` + `examples.ts` (which imports `@/types`) must resolve. `MessageStatus.stories.tsx` needs no fix (public exports only, no SVG).
- **Deferred (Phase 2 — Console):** export the currently-non-public internals from `src/index.ts`: `MessageActions`, `MessageFiles`, `MessageQuestion`, `MessageResponse`, `MessageSources`, `remarkCve`, `createChartComponentDef`.
- Rebuild `dist` (`npm run build:js`); consumed via the existing local `pnpm link`.

### B. Website build pipeline (`scripts/` + `package.json`)

- `scripts/copy-stories.mjs` (Node-builtins only): copy `node_modules/reachat/dist/stories/*.stories.tsx` + `examples.ts` + `assets/` → `src/stories/` (flat). Clean stale files each run; warn-and-skip if source dir missing.
- `scripts/generate-story-sources.mjs`: adapted from reaviz — discover `*.stories.tsx`, handle function-flavor **and** CSF3 `StoryObj`, write `public/_story-sources.json` keyed `"<file>.stories.tsx:<ExportName>"`.
- `package.json`: add `"copy:stories"`, `"postinstall": "pnpm run copy:stories && node scripts/generate-story-sources.mjs"`, and prepend `node scripts/generate-story-sources.mjs &&` to `build:cloudflare`.
- `.gitignore`: add `src/stories/` and `public/_story-sources.json`.

### C. Website runtime

- `src/components/ui/story-renderer.tsx` (`'use client'`): port reaviz's wrapper. Props `{ path, name, storybookKey? }`; `next/dynamic(() => import('../../stories/' + path), {ssr:false, loading: DotsLoader})` → `BaseStoryRenderer` with `storybookUrl="https://storybook.reachat.dev"`, `wrapperClassName="block w-fit mx-auto story-scroll"`.
- `src/app/api/story-source/route.ts` (`runtime='edge'`): port verbatim — fetch `/_story-sources.json` from origin, return `sources["<storyPath>:<functionName>"]`.
- `next.config.ts`: add an `@svgr/webpack` rule supporting `*.svg?react` (mirror reaviz's SVGR rule + `?url` exclusion) so copied story assets bundle. Keep the existing reablocks/reaviz dedupe alias and `source-map-support` stub.
- `src/app/globals.css`: port reaviz's `.story-scroll` / `.docblock-code-toggle` / `pre` / `.prismjs > div` / `.story-container` override block.
- MDX wiring: each converted page adds `import { StoryRenderer } from '@/components/ui/story-renderer';` and invokes `<StoryRenderer path="..." name="..." />`. StoryRenderer mounts inside the `(docs)` route group so it inherits the scoped `reablocks/index.css`.

## PoC scope (Phase 1)

| Page | Replaces | Story (`path:name`) | Path exercised |
|---|---|---|---|
| `src/content/docs/examples/status.mdx` | `<StatusExample/>` | `MessageStatus.stories.tsx:WithSteps` | trivial (no deps, CSF3 StoryObj) |
| `src/content/docs/examples/suggestions.mdx` | `<SuggestionsExample/>` | `ChatSuggestions.stories.tsx:Basic` | full (examples.ts + SVG + `../src` rewrite, fn-style) |

After the two demos render live, delete `src/components/examples/status.tsx` + `suggestions.tsx` and their hand-duplicated ```tsx blocks.

## Verification gates

- `pnpm build` → all static pages build (currently 28); no `createTSDocProps`/import throws.
- `pnpm start` (NOT just `pnpm dev`) → both demos render live; "Show code" shows correct, matching source; **landing responsive `md:` toggles still work** (no regression from CSS scoping — header not stuck mobile, no duplicate footer).
- `pnpm build:cloudflare` + `pnpm preview` → edge `/api/story-source` serves source under Cloudflare/next-on-pages.
- reachat `dist` rebuilt and linked; `import('reachat/...')` specifiers in copied stories resolve.

## Top risks

- **CSS scoping (load-bearing).** `reablocks/index.css` must remain only inside `(docs)`; its `@layer utilities` would clobber the landing's responsive variants. Ported `globals.css` story rules must not reintroduce this. Verify in `pnpm start`, not dev (per project memory).
- **No build-time gate on live demos.** Client-island React errors and the regex source-extractor degrade at runtime, not build (per project memory). PoC must be eye-verified in `pnpm start`.
- **SVGR `?react` query.** Must be wired in Next exactly as the copied stories import (`./assets/x.svg?react`); mismatch fails the ChatSuggestions bundle.
- **Source-extractor fidelity.** `generate-story-sources.mjs` is regex/brace-based; CSF3 `StoryObj` (MessageStatus) and function-flavor must both extract correctly or "Show code" shows a fallback.
- **Library rebuild coupling.** PoC depends on the reachat `dist` transform landing and the local link picking it up.

## Out of scope (this pass)

- Editable `<Runner>` / react-live-runner playground.
- Console page (needs Phase 2 library internal-exports) and Charts demo.
- The 7 example pages that currently only link to Storybook (mentions, ag-ui, commands, file-uploads, providers, component-catalog, charts).
- Publishing reachat to npm (local `pnpm link` is sufficient for PoC).

## Phase 2 (after PoC validated)

- chat / companion → `Chat`/`Companion` stories (clean after specifier-rewrite + SVG).
- console → `Console` stories, gated on exporting the non-public internals from reachat.
- Optionally fill the 7 Storybook-link-only pages.
