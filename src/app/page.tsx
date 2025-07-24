import { FC } from "react";
import { Metadata } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { TracingBeams } from '@/components/ui/tracing-beams';
import { AnimateIn } from '@/components/utils/AnimateIn';
import { Card } from "@/components/ui/card";
import { IconCard } from "@/components/ui/icon-card";
import { SignatureDivider } from "@/components/ui/signature-divider";
import { Header } from '@/components/main';
import WrenchIcon from '@/icons/Wrench';
import WaveIcon from '@/icons/Wave';
import SnapIcon from '@/icons/Snap';
import BatteryIcon from '@/icons/Battery';
import SwordsIcon from '@/icons/Swords';
import KnowledgeIcon from '@/icons/Knowledge';

import LogoIcon from '../../public/logo.svg';

import { Inter } from 'next/font/google';
import { LandingFooter } from 'reablocks-docs-theme';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'reachat - Open Source ReactJS Component Library',
  description: 'Open-source UI Building Blocks for LLM and ChatUIs for ReactJS',
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};
/**
 * Home page component
 * @returns Home page component
 */
const Home: FC = () => {
  return (
    <main
      className={`flex min-h-screen w-full flex-col items-center overflow-y-hidden bg-gradient-to-b from-[#11111F] from-50% via-[#11111F] to-[#121212] ${inter.className} antiasliased overflow-x-hidden text-white`}
    >
      <div className="pointer-events-none absolute top-0 h-screen w-full bg-gradient-to-b from-[#00000020] to-transparent" />
      <Header />
      <TracingBeams className="">
        <div className="">
          <section className="container relative mt-20 flex flex-col px-4 md:mt-40 md:items-center md:px-24">
            <div className="mb-4 flex flex-col gap-4 md:mb-20 md:items-center md:text-center">
              <a
                href="https://github.com/reaviz/reachat"
                target="_blank"
                className="self-center"
              >
                <img
                  alt="GitHub stars"
                  src="https://img.shields.io/github/stars/reaviz/reachat?style=social"
                />
              </a>
              <h3 className="text-content text-center text-4xl font-bold !leading-[150%] md:text-[60px] md:!leading-[120%]">
                Build Chat Experiences <br />
                <span className="md:text-[90px]">
                  <span 
                    className="bg-opacity-50 bg-gradient-to-b bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(163, 163, 163, 1) 100%)'
                    }}>
                    In Hours, Not Weeks
                  </span>
                </span>
              </h3>

              <div className="bg-(image:--gradient-line) h-px w-[45%] self-start" />

              <div className="relative">
                <AnimateIn className="absolute left-[-25px] z-0 mt-[50px] md:mt-[100px] h-[50%] xl:h-[70%] w-[calc(100%+50px)] rounded-full bg-[#2310FF] bg-opacity-50 blur-3xl backdrop-blur-3xl" />
                <Image
                  src="/console.png"
                  alt="console"
                  width={1000}
                  height={500}
                  className="relative z-10 w-full"
                />
              </div>

              <Image
                src="/popup.png"
                alt="console"
                width={460}
                height={500}
                className="absolute bottom-[-75px] right-0 z-20 hidden w-[250px] md:block lg:bottom-[-75px] lg:w-[340px] xl:bottom-[-175px] xl:w-[460px]"
              />
              <p className="text-center text-base text-content-secondary md:hidden">
                Open-source UI Building Blocks for LLM and ChatUIs for ReactJS
              </p>
              <div className="mb-8 flex items-center gap-4 md:mb-24 md:hidden">
                <Link className="flex-1" href="/docs">
                  <button className="w-full min-w-[125px] whitespace-nowrap rounded-md border border-primary bg-[#16161E] px-4 py-2 font-semibold text-content-primary shadow-button transition-colors hover:brightness-110">
                    Get Started
                  </button>
                </Link>
                <Link className="flex-1" href="https://storybook.reachat.dev">
                  <button className="w-full min-w-[125px] whitespace-nowrap rounded-md bg-primary px-4 py-2 font-semibold text-content-primary shadow-button transition-colors hover:brightness-110">
                    Storybook →
                  </button>
                </Link>
              </div>
            </div>
          </section>
        </div>

        <section className="container px-4 md:mt-10 md:px-24 lg:mt-28">
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AnimateIn>
              <Card className="h-full items-center text-center md:items-start md:text-left">
                <IconCard>
                  <WrenchIcon />
                </IconCard>
                <span className="text-xl font-semibold">
                  Highly Customizable
                </span>
                <span>
                  Tailor the chat interface to your needs with customizable
                  components and theming options.
                </span>
              </Card>
            </AnimateIn>
            <AnimateIn transition={{ delay: 0.05 }}>
              <Card className="h-full items-center text-center md:items-start md:text-left">
                <IconCard>
                  <WaveIcon />
                </IconCard>
                <span className="text-xl font-semibold">
                  Rich Media Support
                </span>
                <span>
                  Seamlessly integrate file uploads, embeds, and markdown
                  formatting for enhanced communication.
                </span>
              </Card>
            </AnimateIn>
            <AnimateIn transition={{ delay: 0.1 }}>
              <Card className="h-full items-center text-center md:items-start md:text-left">
                <IconCard>
                  <SnapIcon />
                </IconCard>
                <span className="text-xl font-semibold">Easy to Use</span>
                <span>
                  Intuitive but flexible API for building custom chat
                  experiences.
                </span>
              </Card>
            </AnimateIn>
            <AnimateIn>
              <Card className="h-full items-center text-center md:items-start md:text-left">
                <IconCard>
                  <BatteryIcon />
                </IconCard>
                <span className="text-xl font-semibold">
                  Multi-model Support
                </span>
                <span>
                  Seamlessly switch between different AI models or integrate
                  multiple models within the same interface for versatile
                  capabilities.
                </span>
              </Card>
            </AnimateIn>
            <AnimateIn transition={{ delay: 0.05 }}>
              <Card className="h-full items-center text-center md:items-start md:text-left">
                <IconCard>
                  <SwordsIcon />
                </IconCard>
                <span className="text-xl font-semibold">Battle-Tested</span>
                <span>
                  Used in production across dozens of enterprise products.
                </span>
              </Card>
            </AnimateIn>
            <AnimateIn transition={{ delay: 0.1 }}>
              <Card className="h-full items-center text-center md:items-start md:text-left">
                <IconCard>
                  <KnowledgeIcon />
                </IconCard>
                <span className="text-xl font-semibold">Open Source</span>
                <span>
                  Free to use, and available for both personal and commercial
                  projects.
                </span>
              </Card>
            </AnimateIn>
          </div>
        </section>
        <SignatureDivider className="w-full py-12 md:w-3/4" />
        <section className="container px-4 md:px-24">
          <span className="mb-2 block text-center text-6xl font-semibold md:text-left lg:hidden">
            Chat UIs without all the baggage
          </span>
          <div className="flex flex-col items-center gap-12 py-4 md:flex-row md:gap-4 md:py-8">
            <div className="z-10 flex flex-1 flex-col items-center gap-8 text-center md:items-start md:text-left">
              <span className="hidden text-4xl font-semibold md:text-6xl lg:block">
                Chat UIs without all the baggage
              </span>
              <span className="text-content-secondary md:text-xl">
                Reachat is a powerful, flexible, and user-friendly AI chat
                interface library for ReactJS. It allows you to bring
                conversational AI capabilities to your applications without
                spending weeks building custom components. Its not coupled to
                any particular backend or LLM, so you can use it with any
                backend or LLM of your choice.
              </span>
              <div className="flex items-center gap-2">
                <Link href="/docs">
                  <button className="bg-primary px-8 py-4 transition-all hover:brightness-125">
                    Get started →
                  </button>
                </Link>
              </div>
            </div>
            <div className="relative flex h-full min-h-[500px] max-w-[90vw] flex-1 items-center justify-center gap-4">
              <AnimateIn className="relative -bottom-20 left-0 z-10 min-w-[250px]">
                <Image
                  src="/popup.png"
                  alt="popup"
                  width={500}
                  height={500}
                  className="shadow-card -translate-x-2.5 rounded-xl md:translate-x-0"
                />
              </AnimateIn>
              <AnimateIn className="max-w-3/4 absolute z-0 h-[400px] w-[300px] rounded-full bg-[#2310FF] bg-opacity-50 blur-3xl backdrop-blur-3xl md:h-[600px] md:w-[500px]" />
            </div>
          </div>
        </section>
        <SignatureDivider className="w-full py-12 md:w-3/4" />
        <section className="container px-4 text-center md:px-24 md:text-left">
          <div className="flex flex-col gap-8 py-4 md:py-24">
            <div className="flex flex-col">
              <span className="font-semibold text-primary md:text-xl">
                Get Started
              </span>
              <span className="text-4xl font-semibold md:text-6xl">
                Install and Start Building in 3 Steps
              </span>
            </div>
            <div className="flex flex-col gap-x-4 gap-y-8 md:flex-row">
              <div className="flex flex-1 flex-col gap-2 md:text-xl">
                <p className="bg-(image:--gradient-code) w-fit rounded-r-[30px] rounded-bl-[30px] px-5 py-2.5 font-semibold md:text-xl">
                  1. <code>npm i reachat</code>
                </p>
                <p className="bg-(image:--gradient-code) w-fit rounded-r-[30px] rounded-bl-[30px] px-5 py-2.5 font-semibold md:text-xl">
                  2. Include <code>reachat</code> in your project
                </p>
                <p className="bg-(image:--gradient-code) w-fit rounded-r-[30px] rounded-bl-[30px] px-5 py-2.5 font-semibold md:text-xl">
                  3. Connect your backend
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-2 md:text-xl">
                <span className="font-semibold md:text-xl">Learn more</span>
                <p className="text-pretty text-content-secondary">
                  Explore the{" "}
                  <a
                    className="text-primary"
                    href="https://reachat.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    documentation
                  </a>{" "}
                  to learn about the API. Dive into the{" "}
                  <a
                    className="text-primary"
                    href="https://storybook.reachat.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Storybook
                  </a>{" "}
                  demos to see the components in action. Join the{" "}
                  <a
                    className="text-primary"
                    href="https://discord.gg/tt8wGExq35"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    community
                  </a>{" "}
                  to get support and stay up to date on new releases.
                </p>
              </div>
            </div>
          </div>
        </section>
        <LandingFooter
          logo={<LogoIcon className="h-fit w-[122px] text-white" />}
          className="px-4 py-6 text-base md:px-24"
          libName="reachat"
        />
      </TracingBeams>
    </main>
  );
};

export default Home;
