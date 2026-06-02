/**
 * @file Build-time generator for the docs "Show code" manifest.
 *
 * Walks the copied story files under {@link STORIES_DIR} (produced by
 * `scripts/copy-stories.mjs`) and, for each exported story, extracts a
 * human-readable JSX source snippet into {@link OUTPUT_FILE}. The docs
 * `StoryRenderer` ("Show code" panel) fetches that manifest through the edge
 * route `/api/story-source?storyPath=…&functionName=…`, keyed
 * `"<relativePath>:<ExportName>"`.
 *
 * Run from `postinstall` and at the head of `build:cloudflare`.
 *
 * Extraction is regex / brace-matching string parsing — NOT a real TS/AST
 * parser — so the emitted source is *illustrative*: the live preview is the
 * actually-compiled story (rendered separately by the theme), while this text
 * is only what the reader sees in "Show code". Shapes the heuristics don't
 * cover degrade to a `(args) => <Component {...args} />` or `// not found`
 * fallback rather than throwing.
 *
 * Run: `node scripts/generate-story-sources.mjs`
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

/** Directory the copied `*.stories.tsx` live in (relative to repo root). */
const STORIES_DIR = 'src/stories';
/** Generated manifest consumed by the edge `/api/story-source` route. */
const OUTPUT_FILE = 'public/_story-sources.json';

/**
 * Best-effort resolve of the primary component name documented by a CSF story
 * file, used to synthesize fallback snippets. Tries, in order: meta
 * `component: X`, `Meta<typeof X>`, a `export default { component: X }`, a bare
 * `export default X`, then the first non-Storybook-type named import.
 *
 * @param {string} fileContent - Full source text of a `*.stories.tsx` file.
 * @returns {string} The component identifier, or `'Component'` if none resolves.
 */
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

/**
 * Synthesize a JSX snippet from a CSF3 `args` object literal when a story has
 * `args` but no `render`. String-parses the comma-separated key/value pairs
 * (respecting strings and nested `{}`/`[]`) and rebuilds them as JSX props:
 * `true` → bare attr, `false` → dropped, string → `key="v"`, anything else →
 * `key={v}`.
 *
 * @param {string} componentName - Component to render (from {@link extractComponentName}).
 * @param {string} args - Inner text of the story's `args: { … }` object (no braces).
 * @returns {string} e.g. `() => <MessageStatus text="…" status={loading} />;`
 */
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

/**
 * Extract a displayable source snippet for one exported story. Strategy, in
 * order:
 *  1. Function-flavor `export const X = (…) => BODY` → returns `() => BODY;`.
 *  2. CSF3 StoryObj `export const X: Story = { … }` (brace-matched):
 *     - a `render:` fn → its body (handles both `(args) =>` and bare
 *       `args =>` params; block `{ … }` or expression bodies);
 *     - else an `args: { … }` object → {@link generateCSFStorySource};
 *     - else `(args) => <Component {...args} />;`.
 *  3. Nothing matched → `// Function <name> not found`.
 *
 * @param {string} fileContent - Full source text of the story file.
 * @param {string} functionName - The exported story name to extract.
 * @returns {string} A JSX arrow-function snippet (illustrative, see file header).
 */
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

/**
 * Collect the names of exported stories — `export const <Name>` where `Name`
 * starts uppercase (so meta/helpers like lowercase consts are skipped).
 *
 * @param {string} fileContent - Full source text of the story file.
 * @returns {string[]} Uppercase-initial exported const names.
 */
function getExportedFunctions(fileContent) {
  const functions = [];
  const regex = /export\s+const\s+([A-Z][a-zA-Z0-9]*)\s*[=:]/g;
  let match;
  while ((match = regex.exec(fileContent)) !== null) functions.push(match[1]);
  return functions;
}

/**
 * Recursively collect `*.stories.tsx` file paths under a directory.
 *
 * @param {string} dir - Directory to walk (recurses into subdirectories).
 * @returns {string[]} Absolute-from-cwd paths of every `*.stories.tsx` found.
 */
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

/**
 * Entry point: walk {@link STORIES_DIR}, extract a snippet for every exported
 * story, and write the `{ "<relativePath>:<ExportName>": source }` map to
 * {@link OUTPUT_FILE} (minified). Missing stories dir → writes an empty
 * manifest (so the route still resolves) rather than failing the build.
 *
 * @returns {void}
 */
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
