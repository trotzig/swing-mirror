import Head from 'next/head';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

import DrawingBoard from '../src/DrawingBoard';
import FallbackVideo from '../src/FallbackVideo';
import Home from '../src/icons/Home';
import LibraryButton from '../src/LibraryButton';
import Modal from '../src/Modal';
import PlayerGraphics from '../src/PlayerGraphics';
import RecordButton from '../src/RecordButton';
import VideoPlayer from '../src/VideoPlayer';
import VideoRecorder from '../src/VideoRecorder';
import VolumeOff from '../src/icons/VolumeOff';
import VolumeUp from '../src/icons/VolumeUp';
import db from '../src/db';
import watch from '../src/watch';

function WatchPage({ broadcastId }) {
  const videoRef = useRef();
  const videoRecorderRef = useRef();
  const canvasRef = useRef();
  const instructionRef = useRef();
  const [isRecording, setIsRecording] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [stream, setStream] = useState();
  const [fallbackStream, setFallbackStream] = useState();
  const [recording, setRecording] = useState();
  const [replayVideo, setReplayVideo] = useState();
  const [isController, setIsController] = useState(true);
  const [isPlayerGraphics, setIsPlayerGraphics] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoDimensions, setVideoDimensions] = useState({});

  useEffect(() => {
    const { closeSocket, sendInstruction } = watch({
      broadcastId,
      videoRef,
      onInstruction: instruction => {
        if (typeof instruction.isRecording === 'boolean') {
          setIsRecording(instruction.isRecording);
        }
      },
      onStream: stream => {
        videoRef.current.addEventListener(
          'playing',
          () => {
            setStream(stream);
          },
          { once: true },
        );
        videoRef.current.srcObject = stream;
      },
    });

    const videoElem = videoRef.current;
    const resizeListener = () => {
      setVideoDimensions({
        width: videoElem.videoWidth,
        height: videoElem.videoHeight,
      });
    };
    videoElem.addEventListener('resize', resizeListener);
    instructionRef.current = sendInstruction;
    return () => {
      videoElem.removeEventListener('resize', resizeListener);
      closeSocket();
    };
  }, [broadcastId]);

  useEffect(() => {
    instructionRef.current({ isRecording });
    if (isRecording) {
      videoRecorderRef.current = new VideoRecorder({
        stream: fallbackStream || videoRef.current.srcObject,
        video: videoRef.current,
        canvas: canvasRef.current,
      });
      videoRecorderRef.current.start();
    } else if (videoRecorderRef.current) {
      videoRecorderRef.current.stop().then(setRecording);
    }
  }, [isRecording, fallbackStream]);

  useEffect(() => {
    async function run() {
      const dbVideo = await db.getMostRecentVideo();
      setRecording(dbVideo ? await dbVideo.toRecording() : undefined);
    }
    run();
    db.addEventListener('change', run);
    return () => db.removeEventListener('change', run);
  }, []);

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
        {stream && window.chrome && (
          <FallbackVideo
            width={videoDimensions.width}
            height={videoDimensions.height}
            videoRef={videoRef}
            onStream={setFallbackStream}
          />
        )}
        {stream && (
          <DrawingBoard
            width={videoDimensions.width}
            height={videoDimensions.height}
          />
        )}
        {stream && (
          <PlayerGraphics
            active={isPlayerGraphics}
            videoWidth={videoDimensions.width}
            videoHeight={videoDimensions.height}
            onClick={() => setIsPlayerGraphics(false)}
          />
        )}
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
              style={{ opacity: 0, padding: 10 }}
              onClick={() => setIsPlayerGraphics(!isPlayerGraphics)}
            >
              .
            </div>
          </div>
        </div>
        <div className="video-footer">
          <div className="video-recording">
            <LibraryButton
              video={recording}
              onLibraryToggle={setIsLibraryOpen}
            />
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
      <Modal
        open={replayVideo}
        onClose={() => setReplayVideo(undefined)}
        title="Replay"
        disableSlideToClose
      >
        {replayVideo && (
          <VideoPlayer
            video={replayVideo}
            onVideoChange={setReplayVideo}
            playbackRate={0.2}
          />
        )}
      </Modal>
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
