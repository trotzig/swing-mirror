import React, { useRef, useEffect } from 'react';
import Head from 'next/head';

import watch from '../src/watch';

function WatchPage({ broadcastId }) {
  const videoRef = useRef();
  useEffect(() => {
    const unwatch = watch({ broadcastId, videoRef });
    return unwatch;
  }, [broadcastId]);

  return (
    <div>
      <Head>
        <title>Watcher | Swing Mirror</title>
      </Head>
      <video autoPlay muted playsInline ref={videoRef}></video>
    </div>
  );
}

function getServerSideProps(context) {
  return {
    props: context.query,
  };
}

export { getServerSideProps };

export default WatchPage;
