import path from 'node:path';
import type { NextConfig } from 'next';

import nextra from 'nextra';

const withNextra = nextra({
  latex: true,
  defaultShowCopyCode: true
});

const nextConfig: NextConfig = withNextra({
  reactStrictMode: true,
  // Pin the workspace root so a stray lockfile elsewhere on the machine doesn't
  // make Next infer the wrong tracing root (also keeps the Cloudflare build correct).
  outputFileTracingRoot: path.join(import.meta.dirname),
  images: {
    unoptimized: true
  },
  // ts-morph (via reablocks-docs-theme/tsdoc) is Node-only; keep it out of the
  // RSC/edge bundler so optional `source-map-support` etc. don't trigger warnings.
  serverExternalPackages: ['ts-morph', '@ts-morph/common'],

  // When reachat is `pnpm link`-ed for local testing it brings its own copies of
  // reablocks/reaviz, which creates duplicate React contexts ("useTheme must be
  // used within a ThemeProvider"). Force a single copy from this app's
  // node_modules. Harmless when reachat is installed normally (already deduped).
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      reablocks: path.resolve(import.meta.dirname, 'node_modules/reablocks'),
      reaviz: path.resolve(import.meta.dirname, 'node_modules/reaviz')
    };
    // ts-morph's @ts-morph/common references optional `source-map-support`;
    // when reablocks-docs-theme is linked it surfaces as an unresolved-module
    // warning. Stub it out.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'source-map-support': false
    };
    return config;
  },

  // Rewrites required for PostHog ingestion endpoints
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*'
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*'
      },
      {
        source: '/ingest/decide',
        destination: 'https://us.i.posthog.com/decide'
      }
    ];
  }
});

export default nextConfig;
