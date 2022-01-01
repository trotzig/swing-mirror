import Head from 'next/head';
import React, { useEffect, useRef, useState } from 'react';

import Modal from '../src/Modal';
import watch from '../src/watch';

function WatchPage({ broadcastId }) {
  const videoRef = useRef();
  const buttonRef = useRef();
  const instructionRef = useRef();
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecording, setCurrentRecording] = useState();
  const [recordings, setRecordings] = useState([]);
  const [recordingUrls, setRecordingUrls] = useState({});
  const [isController, setIsController] = useState(true);

  useEffect(() => {
    const { closeSocket, sendInstruction } = watch({
      broadcastId,
      videoRef,
      onInstruction: instruction => {
        if (typeof instruction.isRecording === 'boolean') {
          setIsRecording(instruction.isRecording);
        }
        if (typeof instruction.addRecording === 'object') {
          setRecordings(old => old.concat([instruction.addRecording]));
        }
      },
      onRecording: ({ url, hash }) => {
        setRecordingUrls(old => {
          old[hash] = url;
          return old;
        });
      },
    });
    instructionRef.current = sendInstruction;
    return closeSocket;
  }, [broadcastId]);

  useEffect(() => {
    instructionRef.current({ isRecording });
  }, [isRecording]);

  useEffect(() => {
    const listener = e => {
      if (e.target === buttonRef.current) {
        // button is focused
        return;
      }
      if (e.which === 13 || e.which === 32) {
        // Enter or Spacebar
        setIsRecording(old => !old);
      }
    };
    document.addEventListener('keyup', listener);
    return () => document.removeEventListener('keyup', listener);
  });

  return (
    <div>
      <Head>
        <title>Watcher | Swing Mirror</title>
      </Head>
      <div className="video-wrapper">
        <video autoPlay muted playsInline ref={videoRef}></video>
        <div className="video-header">
          <div className="video-header-inner">
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
                    <img
                      src={recording.photoUrl}
                      className="video-still-image"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="video-footer">
          <button
            ref={buttonRef}
            className={
              isRecording ? 'video-control recording' : 'video-control stopped'
            }
            onClick={() => setIsRecording(!isRecording)}
          />
        </div>
      </div>
      <Modal
        open={currentRecording}
        onClose={() => setCurrentRecording(undefined)}
      >
        <video
          playsInline
          autoPlay
          muted
          controls
          src={currentRecording && recordingUrls[currentRecording.hash]}
        ></video>
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
