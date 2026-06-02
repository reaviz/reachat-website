import { Head } from 'nextra/components';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
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

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className="h-full">
      <Head />
      <body className="flex flex-col antialiased text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
