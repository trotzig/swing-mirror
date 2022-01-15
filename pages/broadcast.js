import Cookies from 'cookies';
import Link from 'next/link';
import React, { useRef, useEffect, useState } from 'react';
import cryptoRandomString from 'crypto-random-string';

import AutoRecordButton from '../src/AutoRecordButton';
import AutoRecorder from '../src/AutoRecorder';
import Broadcaster from '../src/Broadcaster';
import DrawingBoard from '../src/DrawingBoard';
import FlipCamera from '../src/icons/FlipCamera';
import Home from '../src/icons/Home';
import LibraryButton from '../src/LibraryButton';
import Modal from '../src/Modal';
import PlayerGraphics from '../src/PlayerGraphics';
import RecordButton from '../src/RecordButton';
import VideoPlayer from '../src/VideoPlayer';
import VideoRecorder from '../src/VideoRecorder';
import db from '../src/db';

function videoDimensions(videoEl) {
  const isPortrait = window.innerHeight > window.innerWidth;
  if (isPortrait && /iPad|iPhone|iPod|android/.test(navigator.userAgent)) {
    // iOS and Android constraints are expressed in landscape mode, so we need
    // to flip width and height
    // https://stackoverflow.com/questions/62538271/getusermedia-selfie-full-screen-on-mobile
    return {
      width: videoEl.offsetHeight,
      height: videoEl.offsetWidth,
    };
  }
  return {
    width: videoEl.offsetWidth,
    height: videoEl.offsetHeight,
  };
}

function BroadcastPage({ broadcastId }) {
  const [recording, setRecording] = useState();
  const [replayVideo, setReplayVideo] = useState();
  const [libraryVideo, setLibraryVideo] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [stream, setStream] = useState();
  const [facingMode, setFacingMode] = useState('environment');
  const [hasBackCamera, setHasBackCamera] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [isAutoRecording, setIsAutoRecording] = useState(false);
  const [isAutoReplay, setIsAutoReplay] = useState(true);
  const [isPlayerGraphics, setIsPlayerGraphics] = useState(false);
  const videoRef = useRef();
  const videoRecorderRef = useRef();
  const broadcasterRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const handler = () => {
      setDocumentVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  useEffect(() => {
    if (!documentVisible) {
      return;
    }
    broadcasterRef.current = new Broadcaster({ broadcastId });
    const broadcaster = broadcasterRef.current;
    const videoElement = videoRef.current;
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: {
          facingMode,
          ...videoDimensions(videoRef.current),
        },
      })
      .then(cameraStream => {
        videoRef.current.addEventListener(
          'canplay',
          () => {
            broadcaster.init(cameraStream);
            setStream(cameraStream);
          },
          { once: true },
        );
        videoRef.current.srcObject = cameraStream;
        navigator.mediaDevices.enumerateDevices().then(devices => {
          let videoInputCount = 0;
          for (const device of devices) {
            if (device.kind === 'videoinput') {
              videoInputCount++;
            }
          }
          setHasBackCamera(videoInputCount > 1);
        });
      })
      .catch(error => console.error(error));

    const instructionHandler = instruction => {
      console.log(instruction);
      if (typeof instruction.isRecording === 'boolean') {
        setIsRecording(instruction.isRecording);
      }
      if (typeof instruction.isAutoRecording === 'boolean') {
        setIsAutoRecording(instruction.isAutoRecording);
      }
    };
    broadcaster.on('instruction', instructionHandler);
    return () => {
      broadcaster.off('instruction', instructionHandler);
      broadcaster.close();
      const cameraStream = videoElement.srcObject;
      cameraStream.getTracks().forEach(track => track.stop());
    };
  }, [broadcastId, facingMode, documentVisible]);

  useEffect(() => {
    if (!documentVisible) {
      return;
    }
    broadcasterRef.current.sendInstruction({ isRecording });
    if (isAutoRecording) {
      return;
    }
    if (isRecording) {
      videoRecorderRef.current = new VideoRecorder({
        stream: videoRef.current.srcObject,
        isAuto: isAutoRecording,
        video: videoRef.current,
        canvas: canvasRef.current,
      });
      videoRecorderRef.current.start();
    } else if (videoRecorderRef.current) {
      videoRecorderRef.current.stop();
    }
  }, [isRecording, documentVisible, isAutoRecording]);

  useEffect(() => {
    broadcasterRef.current.sendInstruction({ isAutoRecording });
  }, [isAutoRecording]);

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
    <div className="video-wrapper">
      <div className="blurry-background" />
      <video
        className="full-screen"
        key={[facingMode, broadcastId].join('-')}
        playsInline
        autoPlay
        muted
        ref={videoRef}
      ></video>
      {stream && (
        <DrawingBoard
          width={videoRef.current.videoWidth}
          height={videoRef.current.videoHeight}
        />
      )}
      {stream && isPlayerGraphics && (
        <PlayerGraphics
          videoWidth={videoRef.current.videoWidth}
          videoHeight={videoRef.current.videoHeight}
        />
      )}
      {!isLibraryOpen && !replayVideo && isAutoRecording && stream && (
        <AutoRecorder
          stream={stream}
          isAutoReplay={isAutoReplay}
          onToggleAutoReplay={setIsAutoReplay}
          videoRef={videoRef}
          onRecording={setIsRecording}
          onClose={() => setIsAutoRecording(false)}
          onReplayVideo={setReplayVideo}
        />
      )}
      <canvas style={{ display: 'none' }} ref={canvasRef} />
      <div className="video-header">
        <div className="video-header-inner">
          <div className="rounded-translucent">
            <Link href="/">
              <a>
                <Home />
              </a>
            </Link>
          </div>
          <AutoRecordButton
            isActive={isAutoRecording}
            onClick={() => setIsAutoRecording(!isAutoRecording)}
          />
          <div
            id="broadcastId"
            className="broadcast-id"
            onClick={() => setIsPlayerGraphics(!isPlayerGraphics)}
          >
            <span>code</span> <code>{broadcastId}</code>
          </div>
        </div>
      </div>
      <div className="video-footer">
        <div className="video-recording">
          <LibraryButton video={recording} onLibraryToggle={setIsLibraryOpen} />
        </div>
        {stream && (
          <RecordButton
            isRecording={isRecording}
            onClick={() => setIsRecording(!isRecording)}
          />
        )}
        <div className="video-footer-right">
          {stream && (
            <div className="rounded-translucent">
              <button
                className="reset"
                onClick={() =>
                  setFacingMode(
                    facingMode === 'environment' ? 'user' : 'environment',
                  )
                }
              >
                <FlipCamera size={30} />
              </button>
            </div>
          )}
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

function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);
  let broadcastId = cookies.get('broadcastId');
  if (!broadcastId) {
    broadcastId = cryptoRandomString({ length: 4 });
    cookies.set('broadcastId', broadcastId);
  }
  return { props: { broadcastId } };
}

export { getServerSideProps };

export default BroadcastPage;
