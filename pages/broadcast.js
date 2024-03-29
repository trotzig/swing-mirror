import Cookies from 'cookies';
import Link from 'next/link';
import React, { useRef, useEffect, useState } from 'react';
import cryptoRandomString from 'crypto-random-string';

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

function getVideoDimensionsForConstraint(videoEl) {
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
  const [isPlayerGraphics, setIsPlayerGraphics] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({});
  const videoRef = useRef();
  const videoRecorderRef = useRef();
  const broadcasterRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    if (!/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      // only turn off camera on iOS
      return;
    }
    const handler = () => {
      setDocumentVisible(!document.hidden);
      setStream();
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
    let streamToShutdown;
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: {
          facingMode,
          ...getVideoDimensionsForConstraint(videoRef.current),
        },
      })
      .then(cameraStream => {
        streamToShutdown = cameraStream;
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
      if (typeof instruction.isRecording === 'boolean') {
        setIsRecording(instruction.isRecording);
      }
    };
    broadcaster.on('instruction', instructionHandler);
    const resizeListener = () => {
      setVideoDimensions({
        width: videoElement.videoWidth,
        height: videoElement.videoHeight,
      });
    };
    videoElement.addEventListener('resize', resizeListener);

    return () => {
      videoElement.removeEventListener('resize', resizeListener);
      broadcaster.off('instruction', instructionHandler);
      broadcaster.close();
      if (streamToShutdown) {
        streamToShutdown.getTracks().forEach(track => track.stop());
      }
    };
  }, [broadcastId, facingMode, documentVisible]);

  useEffect(() => {
    if (!documentVisible) {
      return;
    }
    broadcasterRef.current.sendInstruction({ isRecording });
    if (isRecording) {
      videoRecorderRef.current = new VideoRecorder({
        stream: videoRef.current.srcObject,
        video: videoRef.current,
        canvas: canvasRef.current,
      });
      videoRecorderRef.current.start();
    } else if (videoRecorderRef.current) {
      videoRecorderRef.current.stop();
    }
  }, [isRecording, documentVisible]);

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
        <div className="video-header-inner">
          <div className="rounded-translucent">
            <Link href="/">
              <a>
                <Home />
              </a>
            </Link>
          </div>
          <div />
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
          {stream && hasBackCamera && (
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
