import Cookies from 'cookies';
import React, { useRef, useEffect, useState } from 'react';
import cryptoRandomString from 'crypto-random-string';

import broadcast from '../src/broadcast';

let mediaRecorder;

function BroadcastPage({ broadcastId }) {
  const [recordings, setRecordings] = useState([]);
  const videoRef = useRef();
  useEffect(() => {
    const unbroadcast = broadcast({ broadcastId, videoRef });
    return unbroadcast;
  }, [broadcastId]);
  return (
    <div>
      <video playsInline autoPlay muted ref={videoRef}></video>
      <div id="broadcastId" className="broadcast-id">
        <a
          target="_blank"
          rel="noreferrer"
          href={`/watch?broadcastId=${broadcastId}>`}
        >
          {broadcastId}
        </a>
      </div>
      <div className="broadcast-controls">
        <button
          id="record"
          onClick={() => {
            const recordedChunks = [];
            const availableMimeTypes = [
              'video/mp4;codecs:h264',
              'video/webm;codecs=vp9',
            ];
            const mimeType =
              availableMimeTypes.find(type =>
                MediaRecorder.isTypeSupported(type),
              ) || availableMimeTypes[0];
            mediaRecorder = new MediaRecorder(videoRef.current.srcObject, {
              mimeType,
            });
            mediaRecorder.ondataavailable = event => {
              if (event.data.size > 0) {
                recordedChunks.push(event.data);
              }
            };
            mediaRecorder.onstop = event => {
              const blob = new Blob(recordedChunks, {
                type: mimeType,
              });
              const url = URL.createObjectURL(blob);
              const name = `recording.${mimeType.slice(
                mimeType.indexOf('/') + 1,
                mimeType.indexOf(';'),
              )}`;
              setRecordings(previousRecordings =>
                previousRecordings.concat([{ url, name }]),
              );
            };
            mediaRecorder.start();
          }}
        >
          Record
        </button>
        <button
          id="stop"
          onClick={() => {
            mediaRecorder.stop();
          }}
        >
          Stop
        </button>
      </div>
      <div className="broadcast-recordings">
        {recordings.map(({ name, url }) => {
          return (
            <a key={url} href={url} download={name}>
              {name}
            </a>
          );
        })}
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
