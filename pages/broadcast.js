import Cookies from 'cookies';
import Link from 'next/link';
import React, { useRef, useEffect, useState } from 'react';
import cryptoRandomString from 'crypto-random-string';

import { limitRecordings } from '../src/limitRecordings';
import ArrowBack from '../src/icons/ArrowBack';
import Broadcaster from '../src/Broadcaster';
import FlipCamera from '../src/icons/FlipCamera';
import Modal from '../src/Modal';
import RecordButton from '../src/RecordButton';
import VideoRecorder from '../src/VideoRecorder';

function BroadcastPage({ broadcastId }) {
  const [recordings, setRecordings] = useState([]);
  const [currentRecording, setCurrentRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [videoObjectFit, setVideoObjectFit] = useState('cover');
  const [facingMode, setFacingMode] = useState('environment');
  const [hasBackCamera, setHasBackCamera] = useState(false);
  const videoRef = useRef();
  const videoRecorderRef = useRef();
  const broadcasterRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const broadcaster = new Broadcaster({ broadcastId });
    broadcasterRef.current = broadcaster;

    const videoElement = videoRef.current;
    navigator.mediaDevices.enumerateDevices().then(devices => {
      let videoInputCount = 0;
      for (const device of devices) {
        if (device.kind === 'videoinput') {
          videoInputCount++;
        }
      }
      setHasBackCamera(videoInputCount > 1);
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode } })
        .then(stream => {
          videoRef.current.srcObject = stream;
          broadcaster.init(stream);
        })
        .catch(error => console.error(error));
    });

    broadcaster.on('instruction', instruction =>
      setIsRecording(instruction.isRecording),
    );
    return () => {
      broadcaster.close();
      const stream = videoElement.srcObject;
      stream.getTracks().forEach(track => track.stop());
    };
  }, [broadcastId, facingMode]);

  useEffect(() => {
    if (isRecording) {
      videoRecorderRef.current = new VideoRecorder({
        video: videoRef.current,
        canvas: canvasRef.current,
      });
      videoRecorderRef.current.start();
    } else if (videoRecorderRef.current) {
      videoRecorderRef.current
        .stop()
        .then(recording =>
          setRecordings(old => limitRecordings(old.concat([recording]))),
        );
    }
    broadcasterRef.current.sendInstruction({ isRecording });
  }, [isRecording]);

  return (
    <div className="video-wrapper">
      <video
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
        <div className="video-recordings">
          {recordings.map(recording => {
            return (
              <button
                className="reset"
                key={recording.url}
                onClick={() => {
                  setCurrentRecording(recording);
                }}
              >
                <img src={recording.photoUrl} className="video-still-image" />
              </button>
            );
          })}
        </div>
        <RecordButton
          isRecording={isRecording}
          onClick={() => setIsRecording(!isRecording)}
        />
        {hasBackCamera && (
          <div className="flip-camera">
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
      <Modal
        open={!!currentRecording}
        onClose={() => {
          setCurrentRecording(undefined);
        }}
        actions={[
          <a
            key="download"
            href={currentRecording && currentRecording.url}
            download={currentRecording && currentRecording.name}
          >
            Save to device
          </a>,
        ]}
      >
        <video
          playsInline
          autoPlay
          muted
          controls
          loop
          style={{ objectFit: videoObjectFit }}
          src={currentRecording && currentRecording.url}
          onDoubleClick={() => {
            setVideoObjectFit(
              videoObjectFit === 'contain' ? 'cover' : 'contain',
            );
          }}
        ></video>
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
