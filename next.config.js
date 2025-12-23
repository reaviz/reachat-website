const { webpack } = require('@storybook/csf-plugin');

const withNextra = require('nextra')({
  theme: 'reablocks-docs-theme',
  themeConfig: './theme.config.tsx'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    scrollRestoration: true,
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
        'node_modules/sharp',
        'node_modules/@img/sharp-linux-x64',
      ],
    },
  },
  typescript: {
    ignoreBuildErrors: true
  },
  webpack: (config, _options) => {
    config.plugins.push(
      webpack({})
    );

    return config;
  }
};

module.exports = withNextra(nextConfig);
