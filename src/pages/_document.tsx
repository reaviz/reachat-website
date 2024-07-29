import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta property="og:image" content="https://reachat.dev/preview.png" />
        <meta
          property="og:title"
          content="reachat - Build Chat Experiences in Hours, Not Weeks."
        />
        <meta
          property="og:description"
          content="Open-source UI Building Blocks for LLM and ChatUIs for ReactJS"
        />
        <meta
          name="twitter:title"
          content="reachat - Build Chat Experiences in Hours, Not Weeks."
        />
        <meta
          name="twitter:description"
          content="Open-source UI Building Blocks for LLM and ChatUIs for ReactJS"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
