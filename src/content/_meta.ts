import type { MetaRecord } from 'nextra';

const meta: MetaRecord = {
  index: {
    type: 'page',
    display: 'hidden',
    theme: {
      navbar: false,
      footer: false,
      sidebar: false,
      toc: false,
      breadcrumb: false,
      pagination: false
    }
  },
  docs: {
    title: 'Docs',
    type: 'page'
  },
  storybook: {
    title: 'Storybook',
    type: 'page',
    href: 'https://storybook.reachat.dev'
  },
  support: {
    title: 'Support',
    type: 'page',
    theme: {
      layout: 'full'
    }
  }
};

export default meta;
