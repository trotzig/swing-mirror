import '../public/styles.css';
import Head from 'next/head';

import React from 'react';

function SwingMirrorApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width, user-scalable=no, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-icon-60@2x.png" />
        <link rel="icon" href="/favicon.ico" />
        <title>Swing Mirror</title>
      </Head>
      <Component {...pageProps} />;
    </>
  );
}

export default SwingMirrorApp;
