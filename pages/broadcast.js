import Cookies from 'cookies';
import React, { useRef, useEffect, useState } from 'react';
import cryptoRandomString from 'crypto-random-string';

import broadcast from '../src/broadcast';

let mediaRecorder;

function BroadcastPage({ broadcastId }) {
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef();
  useEffect(() => {
    const unbroadcast = broadcast({ broadcastId, videoRef });
    return unbroadcast;
  }, [broadcastId]);
  return (
    <div className="video-wrapper">
      <video playsInline autoPlay muted ref={videoRef}></video>
      <div className="video-header">
        <div className="broadcast-recordings">
          {recordings.map(({ name, url }) => {
            return (
              <a key={url} href={url} download={name}>
                {name}
              </a>
            );
          })}
        </div>
        <div id="broadcastId" className="broadcast-id">
          <a
            target="_blank"
            rel="noreferrer"
            href={`/watch?broadcastId=${broadcastId}>`}
          >
            {broadcastId}
          </a>
        </div>
      </div>
      <div className="video-footer">
        <button
          className={
            isRecording ? 'video-control recording' : 'video-control stopped'
          }
          onClick={() => {
            if (isRecording) {
              setIsRecording(false);
              mediaRecorder.stop();
              return;
            }

            setIsRecording(true);
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
        />
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
