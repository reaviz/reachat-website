'use client';

import { Navbar } from 'reablocks-docs-theme';
import Image from 'next/image';

export const Nav = () => (
  <Navbar
    logo={
      <Image
        src="/logo.svg"
        alt="reachat"
        width={105}
        height={24}
        className="h-fit w-[105px]"
      />
    }
    projectLink="https://github.com/reaviz/reachat"
  />
);
