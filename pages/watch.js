import Head from 'next/head';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

import { limitRecordings } from '../src/limitRecordings';
import ArrowBack from '../src/icons/ArrowBack';
import Modal from '../src/Modal';
import RecordButton from '../src/RecordButton';
import VideoPlayer from '../src/VideoPlayer';
import VideoRecorder from '../src/VideoRecorder';
import watch from '../src/watch';

function WatchPage({ broadcastId }) {
  const videoRef = useRef();
  const videoRecorderRef = useRef();
  const canvasRef = useRef();
  const instructionRef = useRef();
  const [isRecording, setIsRecording] = useState(false);
  const [videoObjectFit, setVideoObjectFit] = useState('cover');
  const [currentRecording, setCurrentRecording] = useState();
  const [recordings, setRecordings] = useState([]);
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
      videoRecorderRef.current
        .stop()
        .then(recording =>
          setRecordings(old => limitRecordings(old.concat([recording]))),
        );
    }
    instructionRef.current({ isRecording });
  }, [isRecording]);

  return (
    <div>
      <Head>
        <title>Watcher | Swing Mirror</title>
      </Head>
      <div className="video-wrapper">
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
          <div className="video-header-inner">
            <Link href="/">
              <a>
                <ArrowBack />
              </a>
            </Link>
          </div>
        </div>
        <div className="video-footer">
          <div className="video-recordings">
            {recordings.map((recording, i) => {
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
            onClick={() => setIsRecording(!isRecording)}
            isRecording={isRecording}
          />
        </div>
      </div>
      <Modal
        open={currentRecording}
        onClose={() => setCurrentRecording(undefined)}
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
        <VideoPlayer
          initialObjectFit={videoObjectFit}
          video={currentRecording}
        />
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
