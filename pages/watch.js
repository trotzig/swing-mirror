import Head from 'next/head';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

import DelayedVideo from '../src/DelayedVideo';
import Home from '../src/icons/Home';
import LibraryButton from '../src/LibraryButton';
import RecordButton from '../src/RecordButton';
import VideoRecorder from '../src/VideoRecorder';
import VolumeOff from '../src/icons/VolumeOff';
import VolumeUp from '../src/icons/VolumeUp';
import db from '../src/db';
import watch from '../src/watch';

const delayRates = [
  { label: '+0s', value: 0, title: 'No delay' },
  { label: '+1s', value: 1, title: 'Video delayed 1 second' },
  { label: '+2s', value: 2, title: 'Video delayed 2 seconds' },
  { label: '+3s', value: 3, title: 'Video delayed 3 seconds' },
  { label: '+4s', value: 4, title: 'Video delayed 4 seconds' },
  { label: '+5s', value: 5, title: 'Video delayed 5 seconds' },
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
  const [isMuted, setIsMuted] = useState(true);

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

  useEffect(() => {
    async function run() {
      const dbVideo = await db.getMostRecentVideo();
      setRecording(dbVideo ? await dbVideo.toRecording() : undefined);
    }
    run();
  }, []);

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
          muted={isMuted}
          playsInline
          ref={videoRef}
        />
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

            <div
              className="delay-title"
              style={{ opacity: delay.value > 0 ? 1 : 0 }}
            >
              {delay.title}
            </div>
            {hasStream && (
              <div className="rounded-translucent">
                <button
                  className="reset-text"
                  onClick={() => setDelayIndex(delayIndex + 1)}
                >
                  {delay.label}
                </button>
              </div>
            )}
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
          <div className="video-footer-right">
            <div className="rounded-translucent">
              <button className="reset" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeOff /> : <VolumeUp />}
              </button>
            </div>
          </div>
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
