// Copies reachat's prebuilt, import-rewritten stories into src/ so the docs
// site can render them. Node built-ins only (runs in `postinstall`, where
// devDependencies may be absent). `node_modules/reachat` is a symlink to the
// reachat repo, so its `dist/stories` carries the `rewrite:stories` output.
//
// IMPORTANT: `src/components/ui/story-renderer.tsx` dynamic-imports stories via
// a template literal, which makes webpack compile every file copied here into a
// single context bundle. Only list stories whose imports resolve against the
// published `reachat` package + the support files copied below.
//
// The stories import `{ Meta }` from `@storybook/react` as a VALUE but only use
// it as a type (`} as Meta`). Storybook is not a dependency of this site, so we
// rewrite that to a type-only import on copy — it is then elided at build time
// and no longer needs `@storybook/react` to resolve.

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  existsSync,
  cpSync
} from 'node:fs';
import { join } from 'node:path';

const SRC = 'node_modules/reachat/dist/stories';
const DEST = 'src/stories';

// Allowlist of story files rendered by the docs (via <StoryRenderer />).
const STORIES = [
  'MessageStatus.stories.tsx',
  'ChatSuggestions.stories.tsx',
  'Console.stories.tsx',
  'Chat.stories.tsx',
  'Companion.stories.tsx'
];
// Shared module deps the stories import relatively (kept relative by rewrite:stories).
const SUPPORT_FILES = ['examples.ts'];
const SUPPORT_DIRS = ['assets'];

// Make any value `import { ... } from '@storybook/react'` type-only so the
// (absent) storybook package is never required at runtime.
function portableStory(source) {
  return source.replace(
    /import\s+\{([^}]*)\}\s+from\s+(['"])@storybook\/react\2/g,
    'import type {$1} from $2@storybook/react$2'
  );
}

if (!existsSync(SRC)) {
  console.warn(`[copy-stories] source missing, skipping: ${SRC}`);
  process.exit(0);
}

// Clean stale generated story files (mirrors cpx --clean), keep nothing.
if (existsSync(DEST)) rmSync(DEST, { recursive: true, force: true });
mkdirSync(DEST, { recursive: true });

let count = 0;
for (const file of STORIES) {
  const from = join(SRC, file);
  if (!existsSync(from)) {
    console.warn(`[copy-stories] missing, skipping: ${from}`);
    continue;
  }
  writeFileSync(join(DEST, file), portableStory(readFileSync(from, 'utf8')));
  count++;
}
for (const file of SUPPORT_FILES) {
  const from = join(SRC, file);
  if (!existsSync(from)) {
    console.warn(`[copy-stories] missing, skipping: ${from}`);
    continue;
  }
  writeFileSync(join(DEST, file), readFileSync(from, 'utf8'));
  count++;
}
for (const dir of SUPPORT_DIRS) {
  const from = join(SRC, dir);
  if (existsSync(from)) {
    cpSync(from, join(DEST, dir), { recursive: true });
    count++;
  } else {
    console.warn(`[copy-stories] missing, skipping: ${from}`);
  }
}
console.log(`[copy-stories] copied ${count} entries: ${SRC} -> ${DEST}`);
