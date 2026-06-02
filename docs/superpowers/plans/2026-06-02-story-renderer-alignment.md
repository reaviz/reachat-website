# Story Renderer Alignment (PoC) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace reachat-website's hand-written `status`/`suggestions` demos with reaviz-website's story-renderer pipeline — copy reachat's published `*.stories.tsx`, render the live module via `reablocks-docs-theme`'s `StoryRenderer`, and show source from a build-generated JSON via an edge route.

**Architecture:** reachat's build already rewrites story imports to `'reachat'` (`scripts/stories.cjs`, excluding `./examples` + `./assets`) and ships `dist/stories/` with `examples.ts` + `assets/`. `node_modules/reachat` is a symlink to that repo. The website adds: a copy script (allowlisted to the 2 portable PoC stories), a source-source generator, a `StoryRenderer` client wrapper, an edge `/api/story-source` route, an SVGR `?react` webpack rule, ported CSS, and the two MDX conversions.

**Tech Stack:** Next.js 15.5 (App Router) + Nextra 4.6, React 19, `reablocks-docs-theme@2.3.2` (`StoryRenderer`), Cloudflare Pages SSR (`@cloudflare/next-on-pages`), `@svgr/webpack`, Node-builtins scripts.

**Two repos touched:**
- Library: `/Users/c4r0n0s/Projects/gg/reachat` (Task 1).
- Website: `/Users/c4r0n0s/Projects/gg/reachat-website` (Tasks 2–10), branch `nextra4.6`.

**No automated test runner exists** in reachat-website (no `test` script). Each task's verification is an explicit command + expected output, plus `pnpm start` eyeballing for the runtime gates.

---

## File Structure

**Library (`/Users/c4r0n0s/Projects/gg/reachat`):**
- Modify `scripts/stories.cjs` — extend rewrite glob to include `examples.ts`.
- Modify `stories/ChatSuggestions.stories.tsx` — make `@storybook/react` import type-only.
- Rebuild `dist/stories/` (rewritten imports).

**Website (`/Users/c4r0n0s/Projects/gg/reachat-website`):**
- Create `scripts/copy-stories.mjs` — copy allowlisted stories + `examples.ts` + `assets/` from `node_modules/reachat/dist/stories` → `src/stories/`.
- Create `scripts/generate-story-sources.mjs` — emit `public/_story-sources.json`.
- Create `src/components/ui/story-renderer.tsx` — client `StoryRenderer` wrapper.
- Create `src/app/api/story-source/route.ts` — edge route serving story source.
- Modify `next.config.ts` — add `@svgr/webpack` `*.svg?react` rule.
- Modify `src/app/globals.css` — add story/code-block rules.
- Modify `package.json` — add deps + `copy:stories`/`postinstall`/`build:cloudflare` scripts.
- Modify `.gitignore` — ignore generated story dir + JSON.
- Modify `src/content/docs/examples/status.mdx` + `suggestions.mdx` — use `<StoryRenderer/>`.
- Delete `src/components/examples/status.tsx` + `suggestions.tsx`.

---

## Task 1: reachat library — make PoC stories portable & rebuild dist/stories

**Files (in `/Users/c4r0n0s/Projects/gg/reachat`):**
- Modify: `scripts/stories.cjs`
- Modify: `stories/ChatSuggestions.stories.tsx:2`
- Regenerate: `dist/stories/*`

- [ ] **Step 1: Make the ChatSuggestions Storybook import type-only**

The website bundle has no `@storybook/react`; a value import would fail to resolve. `MessageStatus.stories.tsx` already uses `import type`. Edit `stories/ChatSuggestions.stories.tsx` line 2:

```tsx
// before
import { Meta } from '@storybook/react';
// after
import type { Meta } from '@storybook/react';
```

- [ ] **Step 2: Extend the rewrite glob to cover `examples.ts`**

`scripts/stories.cjs` currently globs only `*.tsx`, so `examples.ts`'s `@/types` import is never rewritten. Change the glob line:

```js
// before
const files = fg.sync(['dist/stories/*.tsx', 'dist/blocks/*.tsx']);
// after
const files = fg.sync(['dist/stories/*.tsx', 'dist/stories/*.ts', 'dist/blocks/*.tsx']);
```

(`./examples` and `./assets` remain in `EXCLUDED_PATHS`, so only `@/`, `../`, `./X` specifiers are rewritten to `reachat`.)

- [ ] **Step 3: Refresh dist/stories from source, then run the rewrite**

`dist/stories/` is populated by `viteStaticCopy` during `build:js`, but a clean `build:js` may fail on 6 pre-existing `vite-plugin-checker` type errors (per the website's `plan.md`). To avoid that for the PoC, copy the source story files into the existing `dist/stories/` and run only the rewrite step:

Run (from `/Users/c4r0n0s/Projects/gg/reachat`):
```bash
cp stories/MessageStatus.stories.tsx stories/ChatSuggestions.stories.tsx stories/examples.ts dist/stories/
rm -rf dist/stories/assets && cp -r stories/assets dist/stories/assets
node scripts/stories.cjs
```
Expected: console prints `Replacing ../src with reachat`, `Replacing @/types with reachat`, etc. (no errors).

- [ ] **Step 4: Verify the rewritten dist imports**

Run:
```bash
cd /Users/c4r0n0s/Projects/gg/reachat
grep -nE "from '(reachat|\\./examples|\\./assets|@storybook|react|date-fns)'" dist/stories/ChatSuggestions.stories.tsx dist/stories/examples.ts dist/stories/MessageStatus.stories.tsx | grep -E "from '\\.\\./|@/" && echo "FAIL: inner imports remain" || echo "OK: no inner imports"
```
Expected: `OK: no inner imports`. Also confirm `dist/stories/ChatSuggestions.stories.tsx` line 2 reads `import type { Meta }` and the `../src` / `@/types` lines now read `from 'reachat'`, while `./examples` and `./assets/*.svg?react` are unchanged.

- [ ] **Step 5: Commit (in the reachat repo)**

```bash
cd /Users/c4r0n0s/Projects/gg/reachat
git add scripts/stories.cjs stories/ChatSuggestions.stories.tsx
git commit -m "build(stories): rewrite examples.ts paths + type-only Storybook import

Make stories portable from the published package: extend rewrite:stories
to cover examples.ts (@/types -> reachat) and make ChatSuggestions'
@storybook/react import type-only so downstream bundles don't need Storybook."
```
(If the repo's current branch is its protected default, create `git switch -c stories-portable` first.)

---

## Task 2: Website — copy-stories script (allowlisted)

**Files:**
- Create: `/Users/c4r0n0s/Projects/gg/reachat-website/scripts/copy-stories.mjs`

- [ ] **Step 1: Write the copy script**

`import('../../stories/' + path)` makes webpack compile EVERY file in `src/stories/` into one context bundle, so we must copy only the portable PoC stories (not Console/Charts, which reference non-public internals). Create `scripts/copy-stories.mjs`:

```js
// Copies reachat's prebuilt, import-rewritten stories into src/ so the docs
// site can render them. Node built-ins only (runs in `postinstall`, where
// devDependencies may be absent). `node_modules/reachat` is a symlink to the
// reachat repo, so its `dist/stories` carries the `rewrite:stories` output.
//
// IMPORTANT: `src/components/ui/story-renderer.tsx` dynamic-imports stories via
// a template literal, which makes webpack compile every file copied here into a
// single context bundle. Only list stories that are fully portable (imports
// resolve to the published `reachat` package). Add to STORIES as each becomes
// portable; un-portable ones (Console, Charts) would break the build.

import { readdirSync, copyFileSync, mkdirSync, rmSync, existsSync, cpSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'node_modules/reachat/dist/stories';
const DEST = 'src/stories';

// Allowlist of portable story files (expand in later phases).
const STORIES = ['MessageStatus.stories.tsx', 'ChatSuggestions.stories.tsx'];
// Shared module deps the stories import relatively (kept relative by rewrite:stories).
const SUPPORT_FILES = ['examples.ts'];
const SUPPORT_DIRS = ['assets'];

if (!existsSync(SRC)) {
  console.warn(`[copy-stories] source missing, skipping: ${SRC}`);
  process.exit(0);
}

// Clean stale generated story files (mirrors cpx --clean), keep nothing.
if (existsSync(DEST)) rmSync(DEST, { recursive: true, force: true });
mkdirSync(DEST, { recursive: true });

let count = 0;
for (const file of [...STORIES, ...SUPPORT_FILES]) {
  const from = join(SRC, file);
  if (!existsSync(from)) {
    console.warn(`[copy-stories] missing, skipping: ${from}`);
    continue;
  }
  copyFileSync(from, join(DEST, file));
  count++;
}
for (const dir of SUPPORT_DIRS) {
  const from = join(SRC, dir);
  if (existsSync(from)) {
    cpSync(from, join(DEST, dir), { recursive: true });
    count++;
  }
}
console.log(`[copy-stories] copied ${count} entries: ${SRC} -> ${DEST}`);
```

- [ ] **Step 2: Run the script**

Run (from `/Users/c4r0n0s/Projects/gg/reachat-website`):
```bash
node scripts/copy-stories.mjs
```
Expected: `[copy-stories] copied 4 entries: node_modules/reachat/dist/stories -> src/stories`

- [ ] **Step 3: Verify copied contents + resolved imports**

Run:
```bash
ls src/stories && echo "---" && grep -nE "from '\\.\\./|@/" src/stories/*.stories.tsx src/stories/examples.ts && echo "FAIL inner imports" || echo "OK no inner imports"
```
Expected: lists `ChatSuggestions.stories.tsx  MessageStatus.stories.tsx  assets  examples.ts`, then `OK no inner imports`.

- [ ] **Step 4: Commit**

```bash
git add scripts/copy-stories.mjs
git commit -m "feat(stories): add copy-stories script (allowlisted PoC stories)"
```

---

## Task 3: Website — generate-story-sources script

**Files:**
- Create: `/Users/c4r0n0s/Projects/gg/reachat-website/scripts/generate-story-sources.mjs`

- [ ] **Step 1: Write the generator (ported from reaviz, adapted for `.stories.tsx` + bare-arrow render)**

Create `scripts/generate-story-sources.mjs`. Two adaptations vs reaviz: (a) discover `*.stories.tsx` (reachat naming), (b) handle `render: args =>` (no parens) so CSF3 `StoryObj` "Show code" is accurate.

```js
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const STORIES_DIR = 'src/stories';
const OUTPUT_FILE = 'public/_story-sources.json';

function extractComponentName(fileContent) {
  const metaComponentMatch = fileContent.match(/component:\s*([A-Z][a-zA-Z0-9]*)/);
  if (metaComponentMatch) return metaComponentMatch[1] ?? '';
  const metaTypeMatch = fileContent.match(/Meta<typeof\s+([A-Z][a-zA-Z0-9]*)/);
  if (metaTypeMatch) return metaTypeMatch[1] ?? '';
  const defaultExportMatch = fileContent.match(/export\s+default\s+\{\s*component:\s*([^,\s}]+)/);
  if (defaultExportMatch) return defaultExportMatch[1] ?? '';
  const directExportMatch = fileContent.match(/export\s+default\s+([^;{\s]+)/);
  if (directExportMatch && !directExportMatch[1]?.includes('meta')) return directExportMatch[1] ?? '';
  const storyBookTypes = ['Meta', 'StoryObj', 'StoryFn', 'Story'];
  const importMatches = fileContent.matchAll(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"][^'"]*['"]/g);
  for (const match of importMatches) {
    const imports = match[1]?.split(',') ?? [];
    for (const imp of imports) {
      const cleanImport = imp.trim().replace(/\s+as\s+.*$/, '');
      const componentMatch = cleanImport.match(/^([A-Z][a-zA-Z0-9]*)/);
      if (componentMatch && !storyBookTypes.includes(componentMatch[1] ?? '')) return componentMatch[1] ?? '';
    }
  }
  return 'Component';
}

function generateCSFStorySource(componentName, args) {
  const propsArray = [];
  const cleanArgs = args.replace(/\s+/g, ' ').trim();
  const argPairs = [];
  let current = '';
  let depth = 0;
  let inString = false;
  let stringChar = '';
  for (let i = 0; i < cleanArgs.length; i++) {
    const char = cleanArgs[i];
    if (!inString && (char === '"' || char === "'")) { inString = true; stringChar = char; }
    else if (inString && char === stringChar && cleanArgs[i - 1] !== '\\') inString = false;
    else if (!inString) {
      if (char === '{' || char === '[') depth++;
      else if (char === '}' || char === ']') depth--;
      else if (char === ',' && depth === 0) { argPairs.push(current.trim()); current = ''; continue; }
    }
    current += char;
  }
  if (current.trim()) argPairs.push(current.trim());
  for (const pair of argPairs) {
    const colonIndex = pair.indexOf(':');
    if (colonIndex !== -1) {
      const key = pair.substring(0, colonIndex).trim();
      const value = pair.substring(colonIndex + 1).trim();
      if (value === 'true') propsArray.push(key);
      else if (value === 'false') { /* skip */ }
      else if (value.startsWith('"') || value.startsWith("'")) propsArray.push(`${key}=${value}`);
      else propsArray.push(`${key}={${value}}`);
    }
  }
  const propsString = propsArray.length > 0 ? ' ' + propsArray.join(' ') : '';
  return `() => <${componentName}${propsString} />;`;
}

function extractStorySource(fileContent, functionName) {
  const componentName = extractComponentName(fileContent);

  const functionRegex = new RegExp(
    `export\\s+const\\s+${functionName}\\s*=\\s*\\([^)]*\\)\\s*=>\\s*([\\s\\S]*?)(?=\\nexport|$)`,
    'g'
  );
  const functionMatch = functionRegex.exec(fileContent);
  if (functionMatch) {
    let functionBody = functionMatch[1]?.trim() ?? '';
    if (functionBody.endsWith(';')) functionBody = functionBody.slice(0, -1);
    return `() => ${functionBody};`;
  }

  const storyPattern = `export\\s+const\\s+${functionName}\\s*:[^=]*=\\s*\\{`;
  const storyStartMatch = fileContent.match(new RegExp(storyPattern));
  let storyObject = '';
  let objectFound = false;
  if (storyStartMatch) {
    const matchIndex = storyStartMatch.index;
    if (matchIndex !== undefined) {
      const startIndex = matchIndex + storyStartMatch[0].length - 1;
      let braceCount = 0;
      let endIndex = -1;
      let inString = false;
      let stringChar = '';
      for (let i = startIndex; i < fileContent.length; i++) {
        const char = fileContent[i];
        if (!inString && (char === '"' || char === "'")) { inString = true; stringChar = char; }
        else if (inString && char === stringChar && fileContent[i - 1] !== '\\') inString = false;
        else if (!inString) {
          if (char === '{') braceCount++;
          else if (char === '}') { braceCount--; if (braceCount === 0) { endIndex = i; break; } }
        }
      }
      if (endIndex !== -1) { storyObject = fileContent.substring(startIndex + 1, endIndex).trim(); objectFound = true; }
    }
  }

  if (objectFound) {
    const renderIndex = storyObject.indexOf('render:');
    if (renderIndex !== -1) {
      const afterRender = storyObject.substring(renderIndex + 7).trim();
      let params = '';
      let renderFunctionStart = -1;
      if (afterRender.startsWith('(')) {
        const parenEnd = afterRender.indexOf(')');
        if (parenEnd !== -1) {
          params = afterRender.substring(1, parenEnd).trim();
          const arrowIndex = afterRender.indexOf('=>', parenEnd);
          if (arrowIndex !== -1) renderFunctionStart = arrowIndex + 2;
        }
      } else {
        // reachat CSF3 uses bare-identifier params: `render: args => (...)`
        const bareArrow = afterRender.match(/^([a-zA-Z_$][\w$]*)\s*=>/);
        if (bareArrow) { params = bareArrow[1]; renderFunctionStart = bareArrow[0].length; }
      }
      if (renderFunctionStart !== -1) {
        const functionBody = afterRender.substring(renderFunctionStart).trim();
        if (functionBody.startsWith('{')) {
          let braceCount = 0;
          let endIndex = -1;
          for (let i = 0; i < functionBody.length; i++) {
            if (functionBody[i] === '{') braceCount++;
            else if (functionBody[i] === '}') { braceCount--; if (braceCount === 0) { endIndex = i; break; } }
          }
          if (endIndex !== -1) {
            const renderBody = functionBody.substring(1, endIndex).trim().replace(/,\s*$/, '');
            return params ? `(${params}) => {\n${renderBody}\n}` : `() => {\n${renderBody}\n}`;
          }
        } else {
          let renderBody = functionBody;
          const nextProp = renderBody.match(/,\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/);
          if (nextProp) renderBody = renderBody.substring(0, nextProp.index).trim();
          renderBody = renderBody.replace(/,\s*$/, '');
          return params ? `(${params}) => ${renderBody}` : `() => ${renderBody}`;
        }
      }
    }
    const argsMatch = storyObject.match(/args\s*:\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/);
    if (argsMatch) {
      const argsContent = argsMatch[1]?.trim() ?? '';
      if (argsContent) return generateCSFStorySource(componentName, argsContent);
    }
    return `(args) => <${componentName} {...args} />;`;
  }

  return `// Function ${functionName} not found`;
}

function getExportedFunctions(fileContent) {
  const functions = [];
  const regex = /export\s+const\s+([A-Z][a-zA-Z0-9]*)\s*[=:]/g;
  let match;
  while ((match = regex.exec(fileContent)) !== null) functions.push(match[1]);
  return functions;
}

function getStoryFiles(dir) {
  const files = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...getStoryFiles(fullPath));
    else if (entry.name.endsWith('.stories.tsx')) files.push(fullPath);
  }
  return files;
}

function main() {
  console.log('Generating story sources...');
  const sources = {};
  if (!existsSync(STORIES_DIR)) {
    console.warn(`[generate-story-sources] ${STORIES_DIR} missing; writing empty manifest`);
  } else {
    for (const filePath of getStoryFiles(STORIES_DIR)) {
      const relativePath = filePath.replace(STORIES_DIR + '/', '');
      const fileContent = readFileSync(filePath, 'utf-8');
      for (const fn of getExportedFunctions(fileContent)) {
        sources[`${relativePath}:${fn}`] = extractStorySource(fileContent, fn);
      }
    }
  }
  if (!existsSync('public')) mkdirSync('public');
  writeFileSync(OUTPUT_FILE, JSON.stringify(sources));
  console.log(`Generated ${Object.keys(sources).length} story sources`);
}

main();
```

- [ ] **Step 2: Run it and verify the manifest keys + WithSteps source**

Run:
```bash
node scripts/generate-story-sources.mjs
node -e "const s=require('./public/_story-sources.json'); console.log(Object.keys(s).filter(k=>k.includes('WithSteps')||k.endsWith(':Basic'))); console.log('---WithSteps---'); console.log(s['MessageStatus.stories.tsx:WithSteps']);"
```
Expected: keys include `MessageStatus.stories.tsx:WithSteps` and `ChatSuggestions.stories.tsx:Basic`; the `WithSteps` value is `(args) => (\n      <div className="w-[400px]">\n      <MessageStatus {...args} />\n      </div>\n    )` (the real render JSX, NOT a `{...args}` fallback or `// not found`).

- [ ] **Step 3: Commit**

```bash
git add scripts/generate-story-sources.mjs
git commit -m "feat(stories): add generate-story-sources (handles .stories.tsx + bare-arrow render)"
```

---

## Task 4: Website — package.json deps + scripts, .gitignore

**Files:**
- Modify: `/Users/c4r0n0s/Projects/gg/reachat-website/package.json`
- Modify: `/Users/c4r0n0s/Projects/gg/reachat-website/.gitignore`

- [ ] **Step 1: Add dependencies**

`examples.ts` imports `date-fns`; the SVGR rule needs `@svgr/webpack`. Add to `package.json`:
- `dependencies`: `"date-fns": "^3.6.0"`
- `devDependencies`: `"@svgr/webpack": "^8.1.0"`

Run:
```bash
cd /Users/c4r0n0s/Projects/gg/reachat-website
pnpm add date-fns@^3.6.0
pnpm add -D @svgr/webpack@^8.1.0
```
Expected: both resolve and install; `pnpm-lock.yaml` updates.

- [ ] **Step 2: Add scripts**

In `package.json` `scripts`, add `copy:stories`, `postinstall`, and prepend generate to `build:cloudflare`:

```json
"copy:stories": "node scripts/copy-stories.mjs",
"build:cloudflare": "node scripts/copy-stories.mjs && node scripts/generate-story-sources.mjs && next build && pagefind --site .next/server/app --output-path public/_pagefind && npx @cloudflare/next-on-pages",
"postinstall": "node scripts/copy-stories.mjs && node scripts/generate-story-sources.mjs"
```
(Keep existing `dev`, `build`, `preview`, `postbuild`, `start`, `lint`.)

- [ ] **Step 3: Ignore generated artifacts**

Append to `.gitignore`:
```
# Generated story sources (copied from reachat on postinstall/build)
/src/stories/
/public/_story-sources.json
```

- [ ] **Step 4: Verify the build:cloudflare wiring + gitignore**

Run:
```bash
node -e "const p=require('./package.json'); console.log(p.scripts['copy:stories']); console.log(p.scripts.postinstall); console.log(/generate-story-sources/.test(p.scripts['build:cloudflare']));"
git check-ignore src/stories/MessageStatus.stories.tsx public/_story-sources.json
```
Expected: prints the two script values, `true`, and both paths echoed back by `git check-ignore` (confirming they're ignored).

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml .gitignore
git commit -m "chore(stories): add date-fns + @svgr/webpack, copy/generate scripts, gitignore generated stories"
```

---

## Task 5: Website — SVGR `?react` webpack rule

**Files:**
- Modify: `/Users/c4r0n0s/Projects/gg/reachat-website/next.config.ts:18-40` (inside `webpack(config)`)

- [ ] **Step 1: Add a scoped SVGR rule for `*.svg?react`**

The copied `ChatSuggestions` story imports `./assets/x.svg?react`. Add a rule that turns ONLY `?react`-queried SVGs into React components, leaving every other svg import on Next's default loader (avoids changing site-wide svg behavior). In `next.config.ts`, inside `webpack(config) { ... }`, before `return config;`, add:

```ts
    // reachat story assets import SVGs as React components via the `?react`
    // query (vite-plugin-svgr convention). Handle only that query so other
    // svg imports keep Next's default (URL) behavior.
    config.module.rules.push({
      test: /\.svg$/i,
      resourceQuery: /react/,
      use: ['@svgr/webpack']
    });
```

Keep the existing `config.resolve.alias` (reablocks/reaviz dedupe) and `config.resolve.fallback['source-map-support'] = false` untouched.

- [ ] **Step 2: Verify config parses (typecheck)**

Run:
```bash
cd /Users/c4r0n0s/Projects/gg/reachat-website
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i "next.config" || echo "OK: next.config typechecks"
```
Expected: `OK: next.config typechecks` (no next.config errors).

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat(build): SVGR rule for *.svg?react (reachat story assets)"
```

---

## Task 6: Website — StoryRenderer client wrapper

**Files:**
- Create: `/Users/c4r0n0s/Projects/gg/reachat-website/src/components/ui/story-renderer.tsx`

- [ ] **Step 1: Write the wrapper (ported from reaviz; reachat Storybook URL)**

```tsx
'use client';

import React, { FC } from 'react';
import dynamic from 'next/dynamic';
import { StoryRenderer as BaseStoryRenderer } from 'reablocks-docs-theme';
import { DotsLoader, theme } from 'reablocks';

interface StoryRendererProps {
  path: string;
  name: string;
  storybookKey?: string;
}

export const StoryRenderer: FC<StoryRendererProps> = ({
  path,
  name,
  storybookKey
}) => {
  const DynamicComponent = dynamic(
    () =>
      import(`../../stories/${path}`)
        .then(storyModule => ({
          default: () => (
            <BaseStoryRenderer
              wrapperClassName="block w-fit mx-auto story-scroll"
              storyModule={storyModule}
              storyName={name}
              storyPath={path}
              storybookUrl="https://storybook.reachat.dev"
              storybookKey={storybookKey}
            />
          )
        }))
        .catch(() => ({
          default: () => <div>Failed to load story: {path}</div>
        })),
    {
      loading: () => (
        <div className="flex min-h-[100px] items-center justify-center">
          <DotsLoader size="medium" theme={theme.components.dotsLoader} />
        </div>
      ),
      ssr: false
    }
  );

  return <DynamicComponent />;
};
```

- [ ] **Step 2: Verify it typechecks against the installed theme**

Run:
```bash
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i "story-renderer" || echo "OK: story-renderer typechecks"
```
Expected: `OK: story-renderer typechecks` (the `StoryRenderer`/`DotsLoader`/`theme` named imports resolve from the installed `reablocks-docs-theme@2.3.2` / `reablocks`).

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/story-renderer.tsx
git commit -m "feat(stories): StoryRenderer client wrapper (reablocks-docs-theme)"
```

---

## Task 7: Website — edge route for story source

**Files:**
- Create: `/Users/c4r0n0s/Projects/gg/reachat-website/src/app/api/story-source/route.ts`

- [ ] **Step 1: Write the edge route (ported verbatim from reaviz)**

```ts
import { NextRequest } from 'next/server';

// next-on-pages requires every non-static route to run on the Edge runtime;
// a Node-runtime route fails the Cloudflare Pages build.
export const runtime = 'edge';

/**
 * Serves the JSX source for a story export, consumed by the docs StoryRenderer
 * (`/api/story-source?storyPath=...&functionName=...`).
 *
 * On the Edge runtime the Node filesystem is unavailable, so the theme's
 * fs-based `getStorySource` cannot run in production. Instead we read the
 * pre-generated `/_story-sources.json` asset (built by
 * `scripts/generate-story-sources.mjs`). `next dev` serves the same file from
 * `/public`, so dev and prod share a single code path.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const storyPath = searchParams.get('storyPath') ?? '';
  const functionName = searchParams.get('functionName') ?? '';

  if (!storyPath || !functionName) {
    return Response.json(
      { error: 'Missing storyPath or functionName' },
      { status: 400 }
    );
  }

  const response = await fetch(new URL('/_story-sources.json', origin));
  if (!response.ok) {
    return Response.json({ error: 'Story sources not found' }, { status: 500 });
  }

  const sources = (await response.json()) as Record<string, string>;
  const source = sources[`${storyPath}:${functionName}`];

  return Response.json({
    source: source ?? `// ${functionName} not found in ${storyPath}`
  });
}
```

- [ ] **Step 2: Verify the route is discovered (dev smoke test)**

Run (with the manifest from Task 3 present in `public/`):
```bash
( pnpm dev >/tmp/reachat-dev.log 2>&1 & echo $! >/tmp/reachat-dev.pid )
sleep 12
curl -s "http://localhost:3000/api/story-source?storyPath=MessageStatus.stories.tsx&functionName=WithSteps"
kill "$(cat /tmp/reachat-dev.pid)" 2>/dev/null
```
Expected: JSON `{"source":"(args) => (\n      <div className=\"w-[400px]\">\n      <MessageStatus {...args} />\n      </div>\n    )"}` (the WithSteps render source). If the dev port differs, adjust to the port printed in `/tmp/reachat-dev.log`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/story-source/route.ts
git commit -m "feat(stories): edge route serving story source from manifest"
```

---

## Task 8: Website — story/code-block CSS

**Files:**
- Modify: `/Users/c4r0n0s/Projects/gg/reachat-website/src/app/globals.css` (after the existing code-sample block, ~line 119)

- [ ] **Step 1: Add story-renderer CSS (only rules not already present)**

`globals.css` already has `.rb-code`, `.rb-code-block`, `pre.highlighter code`, `.prismjs > div`. Add the story-specific rules from reaviz that are missing. Insert after the `.prismjs > div { ... }` rule (before `input { ... }`):

```css
/* Story renderer (ported from reaviz-website) */
.story-scroll {
  display: flex !important;
  justify-content: safe center !important;
  max-width: 100% !important;
  overflow: auto !important;
  padding: 5rem !important;
}

.docblock-code-toggle,
.docblock-code-toggle ~ button {
  background: black !important;
  color: white !important;
  border: none !important;
  border-radius: 0 !important;
}

.sbdocs-preview {
  border-color: hsl(
    var(--nextra-primary-hue) var(--nextra-primary-saturation) 94% / 0.1
  ) !important;
}

pre {
  background-color: hsl(
    var(--nextra-primary-hue) var(--nextra-primary-saturation) 77% / 0.1
  );
  box-shadow: none;
  border-radius: 0.75rem;
}

.story-container.story-preview > div {
  max-width: 100%;
  overflow-x: auto;
}
```

- [ ] **Step 2: Verify the rules are present and CSS still parses**

Run:
```bash
grep -c "story-scroll\|docblock-code-toggle\|story-preview" src/app/globals.css
```
Expected: `3` (or more) — the three new selectors are present. (Final visual correctness is verified in Task 11 under `pnpm start`.)

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style(stories): port story-renderer + code-toggle CSS from reaviz"
```

---

## Task 9: Website — convert status.mdx to StoryRenderer

**Files:**
- Modify: `/Users/c4r0n0s/Projects/gg/reachat-website/src/content/docs/examples/status.mdx:1` and `:92`
- Delete: `/Users/c4r0n0s/Projects/gg/reachat-website/src/components/examples/status.tsx`

- [ ] **Step 1: Swap the import (line 1)**

```mdx
// before
import { StatusExample } from '@/components/examples/status';
// after
import { StoryRenderer } from '@/components/ui/story-renderer';
```

- [ ] **Step 2: Swap the demo invocation (line 92)**

```mdx
// before
<StatusExample />
// after
<StoryRenderer path="MessageStatus.stories.tsx" name="WithSteps" storybookKey="components-messagestatus--with-steps" />
```

- [ ] **Step 3: Delete the now-unused example component**

```bash
git rm src/components/examples/status.tsx
```

- [ ] **Step 4: Verify no remaining references**

Run:
```bash
grep -rn "StatusExample\|examples/status" src/content src/components || echo "OK: no references to StatusExample"
```
Expected: `OK: no references to StatusExample`.

- [ ] **Step 5: Commit**

```bash
git add src/content/docs/examples/status.mdx
git commit -m "docs(status): render MessageStatus via StoryRenderer; drop hand-written demo"
```

---

## Task 10: Website — convert suggestions.mdx to StoryRenderer

**Files:**
- Modify: `/Users/c4r0n0s/Projects/gg/reachat-website/src/content/docs/examples/suggestions.mdx:1` and `:44`
- Delete: `/Users/c4r0n0s/Projects/gg/reachat-website/src/components/examples/suggestions.tsx`

- [ ] **Step 1: Swap the import (line 1)**

```mdx
// before
import { SuggestionsExample } from '@/components/examples/suggestions';
// after
import { StoryRenderer } from '@/components/ui/story-renderer';
```

- [ ] **Step 2: Swap the demo invocation (line 44)**

```mdx
// before
<SuggestionsExample />
// after
<StoryRenderer path="ChatSuggestions.stories.tsx" name="Basic" storybookKey="components-chatsuggestions--basic" />
```

- [ ] **Step 3: Delete the now-unused example component**

```bash
git rm src/components/examples/suggestions.tsx
```

- [ ] **Step 4: Verify no remaining references**

Run:
```bash
grep -rn "SuggestionsExample\|examples/suggestions" src/content src/components || echo "OK: no references to SuggestionsExample"
```
Expected: `OK: no references to SuggestionsExample`.

- [ ] **Step 5: Commit**

```bash
git add src/content/docs/examples/suggestions.mdx
git commit -m "docs(suggestions): render ChatSuggestions via StoryRenderer; drop hand-written demo"
```

---

## Task 11: Verification gates (build + runtime + Cloudflare)

**Files:** none (verification only).

- [ ] **Step 1: Production build**

Run:
```bash
cd /Users/c4r0n0s/Projects/gg/reachat-website
node scripts/copy-stories.mjs && node scripts/generate-story-sources.mjs && pnpm build
```
Expected: build completes; the static page count is unchanged from before this work (~28 ○ pages), plus the new `/api/story-source` listed separately as an `ƒ` (edge) route. No `Module not found` (confirms `reachat`, `date-fns`, and `./assets/*.svg?react` all resolved in the `src/stories` context bundle). If it fails on a story other than the two PoC files, confirm `copy-stories.mjs` only copied the allowlist.

- [ ] **Step 2: Serve the production build and eyeball both demos**

Run:
```bash
pnpm start
```
Then in a browser:
- `/docs/examples/status` → `MessageStatus` renders live with the 4-step progress; "Show code" reveals `<div className="w-[400px]"><MessageStatus {...args} /></div>`-style source; "View Storybook" links to `storybook.reachat.dev`.
- `/docs/examples/suggestions` → `Chat` + `ChatSuggestions` chips render live (SVG icons load — confirms SVGR `?react`); "Show code" reveals the `Basic` body.
- **Landing (`/`)** → responsive `md:` toggles still work: header NOT stuck mobile, no duplicate footer (the `reablocks/index.css` scoping regression must NOT have returned).

Expected: all three pass. Stop with Ctrl-C.

- [ ] **Step 3: Cloudflare build + preview (edge route)**

Run:
```bash
pnpm build:cloudflare
pnpm preview
```
Then:
```bash
curl -s "http://localhost:8788/api/story-source?storyPath=ChatSuggestions.stories.tsx&functionName=Basic" | head -c 200
```
Expected: `pnpm build:cloudflare` completes (copy → generate → next build → pagefind → next-on-pages); `pnpm preview` serves; the curl returns JSON with a non-`// not found` `source`. (Adjust the port if wrangler prints a different one.) Stop with Ctrl-C.

> **Deploy caveat (not blocking the local PoC):** this works locally because `node_modules/reachat` is a symlink carrying Task 1's rewritten `dist/stories`. A real Cloudflare deploy installs `reachat` from the registry, so the Task 1 library changes must be **published** (or the build must consume the reachat workspace) before the deployed site's `postinstall`/`build:cloudflare` can copy portable stories. Tracked as out-of-scope per the spec.

- [ ] **Step 4: Final commit (if any lockfile/build-config drift)**

```bash
git status --porcelain
# commit only intended residual changes (e.g. pnpm-lock.yaml), not generated/ignored files
```

---

## Phase 2 (out of scope for this plan)

- Add `Chat`/`Companion` stories to the `copy-stories.mjs` allowlist → convert `chat.mdx`/`companion.mdx`.
- Export Console's non-public internals from reachat (`MessageActions`, `MessageFiles`, `MessageQuestion`, `MessageResponse`, `MessageSources`, `remarkCve`, `createChartComponentDef`) → add `Console.stories.tsx` → convert `console.mdx`.
- Optionally fill the 7 Storybook-link-only example pages.
