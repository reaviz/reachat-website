import { Pre, Code } from "nextra/components";
import { useRouter } from "next/router";
import { DocsThemeConfig } from "reablocks-docs-theme";
import Link from "next/link";

// eslint-disable-next-line import/no-anonymous-default-export
const config: DocsThemeConfig = {
  head: (
    <>
      <meta property="og:image" content="https://reablocks.dev/preview.png" />
      <meta
        property="og:title"
        content="Reablocks - Open Source ReactJS Component Library"
      />
      <meta
        property="og:description"
        content="Beautifully designed, highly customizable, Open Source React components based on Tailwind and Framer Motion."
      />
      <meta
        name="twitter:title"
        content="Reablocks - Open Source ReactJS Component Library"
      />
      <meta
        name="twitter:description"
        content="Beautifully designed, highly customizable, Open Source React components based on Tailwind and Framer Motion."
      />
    </>
  ),
  logo: (
    <svg height="25" viewBox="0 0 795 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.3191 17.5C10.2662 17.5 3.73579 24.0304 3.73579 32.0833V102.083L30.2775 84.5833H82.4858C90.5387 84.5833 97.0691 78.0529 97.0691 70V17.5H18.3191Z" fill="url(#paint0_linear_182_647)"/>
    <path d="M137.902 61.2501V134.167L111.361 116.667H59.1525C51.0995 116.667 44.5691 110.136 44.5691 102.083V84.5834H82.4858C90.5387 84.5834 97.0691 78.053 97.0691 70.0001V46.6667H123.319C131.372 46.6667 137.902 53.1972 137.902 61.2501Z" fill="url(#paint1_linear_182_647)"/>
    <path d="M251.987 103.6H237.683L224.147 80.2719H214.067V103.6H200.819V36.3999H227.699C233.939 36.3999 239.219 38.6079 243.539 42.9279C247.859 47.2479 250.067 52.5279 250.067 58.6719C250.067 67.0239 244.883 74.7039 237.107 78.2559L251.987 103.6ZM227.699 48.7839H200.819V68.6559H227.699C232.691 68.6559 236.819 64.1439 236.819 58.6719C236.819 53.1999 232.691 48.7839 227.699 48.7839Z" fill="white"/>
    <path d="M290.508 75.8559V90.9279H332.076V103.6H290.508V36.3999H331.596V49.0719H290.508V63.3759H329.196V75.8559H290.508Z" fill="white"/>
    <path d="M430.765 103.6H416.365L412.333 91.5039H385.549L381.517 103.6H367.213L390.733 36.3999H407.149L430.765 103.6ZM398.989 51.6639L385.549 91.5039H412.333L398.989 51.6639Z" fill="white"/>
    <path d="M497.445 104.944C487.365 104.944 479.013 101.584 472.389 94.8639C465.765 88.1439 462.501 79.8879 462.501 69.9999C462.501 60.1119 465.765 51.7599 472.389 45.1359C479.013 38.4159 487.365 35.0559 497.445 35.0559C509.637 35.0559 520.581 41.1999 526.341 50.8959L514.917 57.5199C511.557 51.4719 505.125 47.9199 497.445 47.9199C490.917 47.9199 485.637 49.9359 481.605 54.0639C477.669 58.1919 475.653 63.4719 475.653 69.9999C475.653 76.4319 477.669 81.7119 481.605 85.8399C485.637 89.9679 490.917 91.9839 497.445 91.9839C505.125 91.9839 511.749 88.3359 514.917 82.4799L526.341 89.1039C520.581 98.7999 509.733 104.944 497.445 104.944Z" fill="white"/>
    <path d="M603.407 63.0879V36.3999H616.559V103.6H603.407V75.7599H578.447V103.6H565.199V36.3999H578.447V63.0879H603.407Z" fill="white"/>
    <path d="M717.363 103.6H702.963L698.931 91.5039H672.147L668.115 103.6H653.811L677.331 36.3999H693.747L717.363 103.6ZM685.587 51.6639L672.147 91.5039H698.931L685.587 51.6639Z" fill="white"/>
    <path d="M744.741 36.3999H794.181V49.0719H776.037V103.6H762.789V49.0719H744.741V36.3999Z" fill="white"/>
    <defs>
    <linearGradient id="paint0_linear_182_647" x1="50.4025" y1="17.5" x2="50.4025" y2="102.083" gradientUnits="userSpaceOnUse">
    <stop stop-color="#105EFF"/>
    <stop offset="1" stop-color="#2E2E77"/>
    </linearGradient>
    <linearGradient id="paint1_linear_182_647" x1="141.706" y1="169.085" x2="61.445" y2="30.0709" gradientUnits="userSpaceOnUse">
    <stop stop-color="#105EFF"/>
    <stop offset="1" stop-color="#105EFF" stop-opacity="0.71"/>
    </linearGradient>
    </defs>
    </svg>
  ),
  components: {
    // Handle storybook overrides
    code: (props: any) => (
      <Code {...props} className={`${props.className} rb-code`} />
    ),
    // Handle storybook overrides
    pre: (props: any) => (
      <Pre {...props} className={`${props.className} prismjs`} />
    ),
  },
  sidebar: {
    defaultMenuCollapseLevel: 3,
  },
  footer: {
    component: (
      <footer
        className="block self-center pb-5 pt-5 text-center"
        style={{ borderTop: "solid 1px hsla(203, 50%, 30%, 0.15)" }}
      >
        <span>
          Made with ❤️ by{" "}
          <Link
            className="text-secondary underline"
            href="https://goodcode.us?utm_source=reachat"
          >
            Good Code
          </Link>
        </span>
      </footer>
    ),
  },
  feedback: {
    content: null,
  },
  project: {
    link: "https://github.com/reaviz/reachat",
  },
  docsRepositoryBase: "https://github.com/reaviz/reachat-website/tree/master",
  useNextSeoProps: () => {
    const { asPath } = useRouter();

    if (asPath !== "/") {
      // The index page is getting wrong titles
      if (asPath === "/docs" || asPath === "/blocks") {
        return {
          titleTemplate:
            "reachat \u2013 Build Chat Experiences in Hours, Not Weeks.",
          description:
            "Open-source UI Building Blocks for LLM and ChatUIs for ReactJS",
        };
      }

      return {
        titleTemplate: "%s \u2013 reachat",
        description:
          "Beautifully designed, highly customizable, Open Source React components based on Tailwind and Framer Motion.",
      };
    } else {
      return {
        titleTemplate: "reachat \u2013 Build Chat Experiences in Hours, Not Weeks.",
        description:
          "Open-source UI Building Blocks for LLM and ChatUIs for ReactJS",
      };
    }
  },
};

export default config;
