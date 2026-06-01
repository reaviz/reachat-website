'use client';

import { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { ThemeProvider, theme } from 'reablocks';
import posthog from 'posthog-js';

export function Providers({ children }: PropsWithChildren) {
  useEffect(() => {
    try {
      posthog.init('phc_B3nKncJbom5SWf7IpIQtwFbR8JNeHYjjFP5BR947Lot', {
        api_host: '/ingest',
        ui_host: 'https://us.posthog.com'
      });
    } catch {
      /** noop */
    }
  }, []);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
