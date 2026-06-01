import type { MetaRecord } from 'nextra';

const meta: MetaRecord = {
  index: {
    type: 'page',
    display: 'hidden',
    theme: {
      layout: 'raw',
      sidebar: false,
      pagination: false,
      footer: false,
      navbar: false,
      toc: false,
      breadcrumb: false
    }
  },
  docs: {
    title: 'Docs',
    type: 'page'
  },
  storybook: {
    title: 'Storybook',
    type: 'page',
    href: 'https://storybook.reachat.dev',
    newWindow: true
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
