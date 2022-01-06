import Cookies from 'cookies';
import Link from 'next/link';
import React, { useRef, useEffect, useState } from 'react';
import cryptoRandomString from 'crypto-random-string';

import ArrowBack from '../src/icons/ArrowBack';
import Broadcaster from '../src/Broadcaster';
import FlipCamera from '../src/icons/FlipCamera';
import Modal from '../src/Modal';
import RecordButton from '../src/RecordButton';
import ShareButton from '../src/ShareButton';
import SlowMotion from '../src/icons/SlowMotion';
import VideoPlayer from '../src/VideoPlayer';
import VideoRecorder from '../src/VideoRecorder';
import db from '../src/db';

function BroadcastPage({ broadcastId }) {
  const [recording, setRecording] = useState();
  const [currentRecording, setCurrentRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [videoObjectFit, setVideoObjectFit] = useState('contain');
  const [facingMode, setFacingMode] = useState('environment');
  const [slowMotion, setSlowMotion] = useState(false);
  const [hasBackCamera, setHasBackCamera] = useState(true);
  const videoRef = useRef();
  const videoRecorderRef = useRef();
  const broadcasterRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const broadcaster = new Broadcaster({ broadcastId });
    broadcasterRef.current = broadcaster;

    const videoElement = videoRef.current;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode, frameRate: slowMotion ? 60 : 30 } })
      .then(stream => {
        videoRef.current.addEventListener(
          'canplay',
          () => {
            broadcaster.init(stream);
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
  }, [broadcastId, facingMode, slowMotion]);

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
    broadcasterRef.current.sendInstruction({ isRecording });
  }, [isRecording]);

  useEffect(() => {
    async function run() {
      await db.init();
      const dbVideo = await db.getMostRecentVideo();
      setRecording(await dbVideo.toRecording());
    }
    run();
  }, []);

  return (
    <div className="video-wrapper">
      <div className="blurry-background" />
      <video
        className="full-screen"
        playsInline
        autoPlay
        muted
        ref={videoRef}
        style={{ objectFit: videoObjectFit }}
        onDoubleClick={() => {
          setVideoObjectFit(videoObjectFit === 'contain' ? 'cover' : 'contain');
        }}
      ></video>
      <canvas style={{ display: 'none' }} ref={canvasRef} />
      <div className="video-header">
        <div className="video-header-inner">
          <div>
            <Link href="/">
              <a>
                <ArrowBack />
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
          {recording && (
            <button
              className="reset"
              key={recording.url}
              onClick={() => {
                setCurrentRecording(recording);
              }}
            >
              <img src={recording.photoUrl} className="video-still-image" />
            </button>
          )}
        </div>
        <RecordButton
          isRecording={isRecording}
          onClick={() => setIsRecording(!isRecording)}
        />
        <div className="video-footer-right">
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
          <div className="rounded-translucent">
            <button
              className="reset"
              onClick={() => setSlowMotion(!slowMotion)}
            >
              <SlowMotion size={30} />
            </button>
          </div>
        </div>
      </div>
      <Modal
        open={!!currentRecording}
        onClose={() => {
          setCurrentRecording(undefined);
        }}
        actions={[<ShareButton key="share" video={currentRecording} />]}
      >
        <VideoPlayer
          initialObjectFit={videoObjectFit}
          video={currentRecording}
          onVideoChange={setCurrentRecording}
        />
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
