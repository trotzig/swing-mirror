import '../public/styles.css';
import Head from 'next/head';

import React from 'react';

function SwingMirrorApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="icon" href="/favicon.ico"/>
        <title>Swing Mirror</title>
      </Head>
      <Component {...pageProps} />;
    </>
  );
}

export default SwingMirrorApp;
