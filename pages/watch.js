import Head from 'next/head';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

import DelayedVideo from '../src/DelayedVideo';
import Home from '../src/icons/Home';
import LibraryButton from '../src/LibraryButton';
import RecordButton from '../src/RecordButton';
import VideoRecorder from '../src/VideoRecorder';
import watch from '../src/watch';

const delayRates = [
  { label: '+0s', value: 0 },
  { label: '+1s', value: 1 },
  { label: '+2s', value: 2 },
  { label: '+3s', value: 3 },
];

function WatchPage({ broadcastId }) {
  const videoRef = useRef();
  const videoRecorderRef = useRef();
  const canvasRef = useRef();
  const instructionRef = useRef();
  const [isRecording, setIsRecording] = useState(false);
  const [hasStream, setHasStream] = useState(false);
  const [delayIndex, setDelayIndex] = useState(0);
  const [recording, setRecording] = useState();
  const [isController, setIsController] = useState(true);

  useEffect(() => {
    const { closeSocket, sendInstruction } = watch({
      broadcastId,
      videoRef,
      onInstruction: instruction => {
        if (typeof instruction.isRecording === 'boolean') {
          setIsRecording(instruction.isRecording);
        }
      },
      onStreamActive: () => setHasStream(true),
    });
    instructionRef.current = sendInstruction;
    return closeSocket;
  }, [broadcastId]);

  useEffect(() => {
    if (isRecording) {
      videoRecorderRef.current = new VideoRecorder({
        video: videoRef.current,
        canvas: canvasRef.current,
      });
      videoRecorderRef.current.start();
    } else if (videoRecorderRef.current) {
      videoRecorderRef.current.stop().then(setRecording);
    }
    instructionRef.current({ isRecording });
  }, [isRecording]);

  const delay = delayRates[delayIndex % delayRates.length];

  return (
    <div>
      <Head>
        <title>Watcher | Swing Mirror</title>
      </Head>
      <div className="video-wrapper">
        <div className="blurry-background" />
        <video
          className="full-screen"
          autoPlay
          muted
          playsInline
          ref={videoRef}
        ></video>
        {delay.value > 0 ? (
          <DelayedVideo delaySeconds={delay.value} videoRef={videoRef} />
        ) : null}
        <canvas style={{ display: 'none' }} ref={canvasRef} />
        <div className="video-header">
          <div className="video-header-inner ">
            <div className="rounded-translucent">
              <Link href="/">
                <a>
                  <Home />
                </a>
              </Link>
            </div>
          </div>
        </div>
        <div className="video-footer">
          <div className="video-recording">
            {recording && (
              <LibraryButton key={recording.url} video={recording} />
            )}
          </div>
          <RecordButton
            onClick={() => setIsRecording(!isRecording)}
            isRecording={isRecording}
          />
          {hasStream && (
            <button
              className="reset-text"
              onClick={() => setDelayIndex(delayIndex + 1)}
            >
              {delay.label}
            </button>
          )}
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
