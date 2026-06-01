'use client';

import { Footer as NextraFooter } from 'reablocks-docs-theme';
import Link from 'next/link';

export const Footer = () => (
  <NextraFooter className="flex w-full justify-center py-5">
    <span className="text-center">
      Made with ❤️ by{' '}
      <Link
        className="text-secondary underline"
        href="https://goodcode.us?utm_source=reachat"
      >
        Good Code
      </Link>
    </span>
  </NextraFooter>
);
