import Head from 'next/head';
import React, { useEffect, useRef, useState } from 'react';

import watch from '../src/watch';

function WatchPage({ broadcastId }) {
  const videoRef = useRef();
  const instructionRef = useRef();
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const { closeSocket, sendInstruction } = watch({ broadcastId, videoRef });
    instructionRef.current = sendInstruction;
    return closeSocket;
  }, [broadcastId]);

  useEffect(() => {
    instructionRef.current({ isRecording });
  }, [isRecording]);

  return (
    <div>
      <Head>
        <title>Watcher | Swing Mirror</title>
      </Head>
      <div className="video-wrapper">
        <video autoPlay muted playsInline ref={videoRef}></video>
        <div className="video-footer">
          <button
            className={
              isRecording ? 'video-control recording' : 'video-control stopped'
            }
            onClick={() => setIsRecording(!isRecording)}
          />
        </div>
      </div>
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
