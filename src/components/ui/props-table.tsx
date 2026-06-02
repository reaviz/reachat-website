import { createTSDocProps } from 'reablocks-docs-theme/tsdoc';

/**
 * TSDoc-driven props table. Reads the `reachat` package's TypeScript
 * declarations at build time, so the Name / Type / Default columns (the
 * Default column comes from `@default` JSDoc tags) stay in sync with the
 * library. Usage:
 *   <PropsTable name="Chat" />                          // resolves ChatProps / ComponentProps<typeof Chat>
 *   <PropsTable name="useAgUi" typeName="UseAgUiOptions" />  // resolve a specific exported type
 */
export const PropsTable = createTSDocProps({ packageName: 'reachat' });
