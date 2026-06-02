'use client';

import React, { FC, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { StoryRenderer as BaseStoryRenderer } from 'reablocks-docs-theme';
import { DotsLoader, theme } from 'reablocks';

interface StoryRendererProps {
  path: string;
  name: string;
  storybookKey?: string;
  /**
   * Reserve a sized, relatively-positioned preview box. Required for stories
   * whose root uses `position: absolute; inset: 0` (the Chat/Console demos):
   * without a positioned, sized ancestor those fill the viewport instead of
   * the docs preview area. Intrinsically-sized stories (MessageStatus, the
   * 350×500 Chat/Companion demos) don't need it.
   */
  fill?: boolean;
  /** Reserved-box height in px when `fill` is set (default 520). */
  height?: number;
}

export const StoryRenderer: FC<StoryRendererProps> = ({
  path,
  name,
  storybookKey,
  fill = false,
  height
}) => {
  const wrapperClassName = fill
    ? 'story-fill'
    : 'block w-fit mx-auto story-scroll';

  // Memoize the lazy component: `dynamic()` returns a new component identity on
  // every call, so creating it inline would remount the story (losing its state
  // and re-flashing the loader) on any re-render. Keyed on the values that define
  // what/how we render.
  const DynamicComponent = useMemo(
    () =>
      dynamic(
        () =>
          // Restrict the dynamic-import context to story files. Without this,
          // webpack's template-literal context (`./src/stories/ lazy ^\.\/.*$`)
          // also pulls in the sibling `assets/*.svg` (as bare, query-less modules
          // that the `*.svg?react` SVGR rule doesn't match) and fails to parse them.
          // The stories' own `./assets/x.svg?react` + `./examples` imports are still
          // bundled as their static deps.
          import(/* webpackInclude: /\.stories\.tsx$/ */ `../../stories/${path}`)
            .then(storyModule => ({
              default: () => (
                <BaseStoryRenderer
                  wrapperClassName={wrapperClassName}
                  storyModule={storyModule}
                  storyName={name}
                  storyPath={path}
                  storybookUrl="https://storybook.reachat.dev"
                  storybookKey={storybookKey}
                />
              )
            }))
            .catch(() => ({
              default: () => <div>Failed to load story: {path}</div>
            })),
        {
          loading: () => (
            <div className="flex min-h-[100px] items-center justify-center">
              <DotsLoader size="medium" theme={theme.components.dotsLoader} />
            </div>
          ),
          ssr: false
        }
      ),
    [path, name, storybookKey, wrapperClassName]
  );

  // `--story-h` is read by `.story-fill` (in globals.css) and inherits down to
  // the theme's preview wrapper, so we can size the reserved box per story
  // without dynamic Tailwind classes.
  if (fill && height) {
    return (
      <div style={{ ['--story-h' as string]: `${height}px` } as React.CSSProperties}>
        <DynamicComponent />
      </div>
    );
  }

  return <DynamicComponent />;
};
