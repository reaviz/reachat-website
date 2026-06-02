import type { Metadata } from 'next';
import { Landing } from '@/components/landing';

export const metadata: Metadata = {
  title: 'reachat - Build Chat Experiences in Hours, Not Weeks.',
  description: 'Open-source UI Building Blocks for LLM / Chat UIs',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  }
};

export default function Home() {
  return <Landing />;
}
