import React from "react";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" data-theme="light">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#F6F4EF" />
        <link rel="manifest" href="/manifest.json" />
        <script src="https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js" defer />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" defer />
        <script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js" defer />
        <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js" defer />
        <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js" defer />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" defer />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
