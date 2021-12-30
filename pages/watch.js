import Head from 'next/head';
import React, { useEffect, useRef, useState } from 'react';

import watch from '../src/watch';

function WatchPage({ broadcastId }) {
  const videoRef = useRef();
  const buttonRef = useRef();
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

  useEffect(() => {
    const listener = e => {
      if (e.target === buttonRef.current) {
        // button is focused
        return;
      }
      if (e.which === 13 || e.which === 32) {
        // Enter or Spacebar
        setIsRecording(old => !old);
      }
    };
    document.addEventListener('keyup', listener);
    return () => document.removeEventListener('keyup', listener);
  });

  return (
    <div>
      <Head>
        <title>Watcher | Swing Mirror</title>
      </Head>
      <div className="video-wrapper">
        <video autoPlay muted playsInline ref={videoRef}></video>
        <div className="video-footer">
          <button
            ref={buttonRef}
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
