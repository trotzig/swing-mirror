import Cookies from 'cookies';
import Link from 'next/link';
import React, { useRef, useEffect, useState } from 'react';
import cryptoRandomString from 'crypto-random-string';

import Broadcaster from '../src/Broadcaster';
import FlipCamera from '../src/icons/FlipCamera';
import Home from '../src/icons/Home';
import LibraryButton from '../src/LibraryButton';
import RecordButton from '../src/RecordButton';
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
  const [libraryVideo, setLibraryVideo] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [hasStream, setHasStream] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [hasBackCamera, setHasBackCamera] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(true);
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
      .then(stream => {
        videoRef.current.addEventListener(
          'canplay',
          () => {
            broadcaster.init(stream);
            setHasStream(true);
          },
          { once: true },
        );
        videoRef.current.srcObject = stream;
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

    broadcaster.on('instruction', instruction =>
      setIsRecording(instruction.isRecording),
    );
    return () => {
      broadcaster.close();
      const stream = videoElement.srcObject;
      stream.getTracks().forEach(track => track.stop());
    };
  }, [broadcastId, facingMode, documentVisible]);

  useEffect(() => {
    if (!documentVisible) {
      return;
    }
    if (isRecording) {
      videoRecorderRef.current = new VideoRecorder({
        video: videoRef.current,
        canvas: canvasRef.current,
      });
      videoRecorderRef.current.start();
    } else if (videoRecorderRef.current) {
      videoRecorderRef.current.stop().then(setRecording);
    }
    broadcasterRef.current.sendInstruction({ isRecording });
  }, [isRecording, documentVisible]);

  useEffect(() => {
    async function run() {
      const dbVideo = await db.getMostRecentVideo();
      setRecording(dbVideo ? await dbVideo.toRecording() : undefined);
    }
    run();
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
          <div id="broadcastId" className="broadcast-id">
            <span>code</span> <code>{broadcastId}</code>
          </div>
        </div>
      </div>
      <div className="video-footer">
        <div className="video-recording">
          {recording && <LibraryButton key={recording.url} video={recording} />}
        </div>
        {hasStream && (
          <RecordButton
            isRecording={isRecording}
            onClick={() => setIsRecording(!isRecording)}
          />
        )}
        <div className="video-footer-right">
          {hasStream && (
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
