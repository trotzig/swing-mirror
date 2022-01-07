import Head from 'next/head';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

import Home from '../src/icons/Home';
import LibraryButton from '../src/LibraryButton';
import RecordButton from '../src/RecordButton';
import VideoRecorder from '../src/VideoRecorder';
import watch from '../src/watch';

function WatchPage({ broadcastId }) {
  const videoRef = useRef();
  const videoRecorderRef = useRef();
  const canvasRef = useRef();
  const instructionRef = useRef();
  const [isRecording, setIsRecording] = useState(false);
  const [videoObjectFit, setVideoObjectFit] = useState('contain');
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
          style={{ objectFit: videoObjectFit }}
          onDoubleClick={() => {
            setVideoObjectFit(
              videoObjectFit === 'contain' ? 'cover' : 'contain',
            );
          }}
        ></video>
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
