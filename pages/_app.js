import '../public/styles.css';
import '../public/range-input.css';

import Head from 'next/head';

import React from 'react';

function SwingMirrorApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <script
          async
          src="https://hosted.okayanalytics.com/tracker.js?tid=OA-F9CKM3RG"
        ></script>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width, user-scalable=no, viewport-fit=cover"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/app-icon-60@2x.png" />
        <link rel="icon" href="/favicon.ico" />
        <title>Swing Mirror</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default SwingMirrorApp;
