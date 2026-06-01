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
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  },
  openGraph: {
    images: 'https://reachat.dev/preview.png',
    title: 'reachat - Build Chat Experiences in Hours, Not Weeks.',
    description: 'Open-source UI Building Blocks for LLM and ChatUIs for ReactJS'
  },
  twitter: {
    title: 'reachat - Build Chat Experiences in Hours, Not Weeks.',
    description: 'Open-source UI Building Blocks for LLM and ChatUIs for ReactJS'
  }
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
          nextThemes={{ defaultTheme: 'dark' }}
        >
          <Providers>{children}</Providers>
        </Layout>
      </body>
    </html>
  );
}
