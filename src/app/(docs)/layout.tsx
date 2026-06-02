import { Layout, LastUpdated } from 'reablocks-docs-theme';
import { Search } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import type { PropsWithChildren } from 'react';
import { Nav } from '@/components/ui/nav';
import { Footer } from '@/components/ui/footer';
// Precompiled reablocks component styles — scoped to the docs route group so the
// landing never loads them (see app/globals.css). Wrapped in a local .css file
// because the bare `reablocks/index.css` subpath resolves through Next's CSS
// pipeline but not its JS module resolver.
import './reablocks.css';

// Docs-only layout: wraps the documentation routes in the reablocks-docs-theme
// chrome (navbar / sidebar / toc / footer). The landing page (`app/page.tsx`)
// deliberately lives outside this group so it renders as a standalone marketing
// page with no docs sidebar — matching the original reachat.dev. (The theme
// can't strip its own chrome on the app-router `/` route because there is no
// `content/index.mdx` node for it to match against, so a route-group split is
// the reliable way to keep the two layouts separate.)
export default async function DocsLayout({ children }: PropsWithChildren) {
  return (
    <Layout
      navbar={<Nav />}
      pageMap={await getPageMap()}
      docsRepositoryBase="https://github.com/reaviz/reachat-website/tree/master"
      editLink="Edit this page on GitHub"
      sidebar={{ defaultMenuCollapseLevel: 3, autoCollapse: false }}
      footer={<Footer />}
      // The theme eagerly creates its default `lastUpdated`/`search` elements
      // with its prebuilt (production) jsx-runtime, which React 19's dev
      // renderer rejects (500 in `next dev`). Passing elements created by the
      // app's own runtime avoids that. In production we let the theme use its
      // own (nicely styled) Search default.
      lastUpdated={<LastUpdated />}
      search={process.env.NODE_ENV === 'development' ? <Search /> : undefined}
      nextThemes={{ defaultTheme: 'dark' }}
    >
      {children}
    </Layout>
  );
}
