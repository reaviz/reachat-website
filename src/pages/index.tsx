import { Nav } from "@/components/layout/nav";
import { Card } from "@/components/ui/card";
import { HeroParallax } from "@/components/ui/hero-parallax";
import { IconCard } from "@/components/ui/icon-card";
import { SignatureDivider } from "@/components/ui/signature-divider";
import { TracingBeams } from "@/components/ui/tracing-beams";
import { AnimateIn } from "@/components/utils/AnimateIn";
import BatteryIcon from "@/icons/Battery";
import DribbbleIcon from "@/icons/Dribbble";
import GithubIcon from "@/icons/Github";
import KnowledgeIcon from "@/icons/Knowledge";
import LinkedinIcon from "@/icons/LinkedIn";
import SnapIcon from "@/icons/Snap";
import SwordsIcon from "@/icons/Swords";
import WaveIcon from "@/icons/Wave";
import WrenchIcon from "@/icons/Wrench";
import { cn } from "@/utils/cn";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "reablocks - Build Chat Experiences in Hours, Not Weeks.",
  description: "Open-source UI Building Blocks for LLM / Chat UIs",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolledCheck = window.scrollY > 80;
      setIsScrolled(isScrolledCheck);
    };

    document.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <Head>
        <title>reachat - Build Chat Experiences in Hours, Not Weeks.</title>
        <meta
          name="description"
          content={
            "Open-source UI Building Blocks for LLM and ChatUIs for ReactJS"
          }
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <main
        className={`flex min-h-screen w-full flex-col items-center overflow-y-hidden bg-gradient-to-b from-[#11111F] from-50% via-[#11111F] to-[#121212] ${inter.className} antiasliased overflow-x-hidden text-white`}
      >
        <div className="pointer-events-none absolute top-0 h-screen w-full bg-gradient-to-b from-[#00000020] to-transparent" />
        <header
          className={cn(
            `fixed top-0 z-50 flex w-full justify-center border-b border-[#9091A0] border-opacity-15 bg-[#11111F] transition-[backdrop-filter] md:bg-transparent`,
            isScrolled && "md:backdrop-blur-md",
          )}
        >
          <Nav />
        </header>
        <TracingBeams className="">
          <div className="">
            <section className="container relative mt-20 flex flex-col px-4 md:items-center md:px-24 md:mt-40">
              <div className="mb-4 flex flex-col gap-4 md:mb-20 md:items-center md:text-center">
                <a
                  href="https://github.com/reaviz/reachat"
                  target="_blank"
                  className="self-center md:self-start"
                >
                  <img
                    alt="GitHub stars"
                    src="https://img.shields.io/github/stars/reaviz/reachat?style=social"
                  />
                </a>
                <h3 className="text-content text-center text-4xl font-bold !leading-[150%] md:text-left md:text-[60px] md:!leading-[120%]">
                  Build Chat Experiences <br />
                  <span className="md:text-[90px]">
                    <span className="md:bg-opacity-50 md:bg-gradient-to-b md:from-white md:to-neutral-400 md:bg-clip-text md:text-transparent">
                      In Hours, Not Weeks
                    </span>
                  </span>
                </h3>
                <Image
                  src="/console.png"
                  alt="console"
                  width={1000}
                  height={500}
                  className="w-full"
                />
                <Image
                  src="/popup.png"
                  alt="console"
                  width={460}
                  height={500}
                  className="absolute bottom-[-75px] right-0 hidden w-[250px] md:block lg:bottom-[-75px] lg:w-[340px] xl:bottom-[-175px] xl:w-[460px]"
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
                      Demos →
                    </button>
                  </Link>
                </div>
              </div>
            </section>
          </div>

          <section className="container px-4 md:mt-10 md:px-24 lg:mt-28">
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <AnimateIn>
                <Card className="items-center text-center md:items-start md:text-left">
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
                <Card className="items-center text-center md:items-start md:text-left">
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
                <Card className="items-center text-center md:items-start md:text-left">
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
                <Card className="items-center text-center md:items-start md:text-left">
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
                <Card className="items-center text-center md:items-start md:text-left">
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
                <Card className="items-center md:items-start">
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
            <span className="mb-2 block text-6xl font-semibold text-center md:text-left lg:hidden">
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
                    objectFit="contain"
                    className="shadow-card rounded-xl -translate-x-2.5 md:translate-x-0"
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
                  <p className="w-fit rounded-r-[30px] rounded-bl-[30px] bg-gradient-code px-5 py-2.5 font-semibold md:text-xl">
                    1. <code>npm i reachat</code>
                  </p>
                  <p className="w-fit rounded-r-[30px] rounded-bl-[30px] bg-gradient-code px-5 py-2.5 font-semibold md:text-xl">
                    2. Include <code>reachat</code> in your project
                  </p>
                  <p className="w-fit rounded-r-[30px] rounded-bl-[30px] bg-gradient-code px-5 py-2.5 font-semibold md:text-xl">
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
          <footer className="container mt-12 px-4 py-6 text-base text-content-secondary md:mt-4 md:px-24 lg:mt-24">
            <div className="flex items-center justify-between gap-2">
              <Link href="#">
                <Image
                  draggable={false}
                  src="/logo.svg"
                  alt="logo"
                  width={122}
                  height={24}
                />
              </Link>
              <span className="hidden md:block">
                Made with ❤️ by{" "}
                <Link
                  className="text-secondary underline"
                  href="https://goodcode.us"
                >
                  GoodCode
                </Link>
              </span>
              <div className="flex gap-4">
                <Link
                  aria-label="GoodCode's GitHub profile"
                  href="https://github.com/reaviz"
                >
                  <GithubIcon className="h-5 w-5 transition-colors hover:text-content-primary" />
                </Link>
                <Link
                  aria-label="GoodCode's Linkedin profile"
                  href="https://linkedin.com/company/goodcodeus/"
                >
                  <LinkedinIcon className="h-5 w-5 transition-colors hover:text-content-primary" />
                </Link>
                <Link
                  aria-label="GoodCode's Dribbble profile"
                  href="https://dribbble.com/goodcode"
                >
                  <DribbbleIcon className="h-5 w-5 transition-colors hover:text-content-primary" />
                </Link>
              </div>
            </div>
            <div className="block self-center pb-4 pt-10 text-center md:hidden">
              <span>
                Made with ❤️ by{" "}
                <Link
                  className="text-secondary underline"
                  href="https://goodcode.us?utm=reachat"
                >
                  GoodCode
                </Link>
              </span>
            </div>
          </footer>
        </TracingBeams>
      </main>
    </>
  );
}
