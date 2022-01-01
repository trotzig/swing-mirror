import Cookies from 'cookies';
import React, { useRef, useEffect, useState } from 'react';
import cryptoRandomString from 'crypto-random-string';

import Broadcaster from '../src/Broadcaster';

let mediaRecorder;

function takeStillPhoto({ canvasRef, videoRef }) {
  const canvas = canvasRef.current;
  const video = videoRef.current;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

function BroadcastPage({ broadcastId }) {
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef();
  const broadcasterRef = useRef();
  const buttonRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const broadcaster = new Broadcaster({ broadcastId });
    broadcasterRef.current = broadcaster;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        videoRef.current.srcObject = stream;
        broadcaster.init(stream);
      })
      .catch(error => console.error(error));

    broadcaster.on('instruction', instruction =>
      setIsRecording(instruction.isRecording),
    );
    return () => broadcaster.close();
  }, [broadcastId]);

  useEffect(() => {
    if (isRecording) {
      const recordedChunks = [];
      const availableMimeTypes = [
        'video/mp4;codecs:h264',
        'video/webm;codecs=vp9',
      ];
      const mimeType =
        availableMimeTypes.find(type => MediaRecorder.isTypeSupported(type)) ||
        availableMimeTypes[0];
      mediaRecorder = new MediaRecorder(videoRef.current.srcObject, {
        mimeType,
      });
      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };
      const photoUrl = takeStillPhoto({ canvasRef, videoRef });
      mediaRecorder.onstop = event => {
        const blob = new Blob(recordedChunks, {
          type: mimeType,
        });
        const url = URL.createObjectURL(blob);
        const name = `recording.${mimeType.slice(
          mimeType.indexOf('/') + 1,
          mimeType.indexOf(';'),
        )}`;
        const recording = { url, name, photoUrl };
        setRecordings(previousRecordings =>
          previousRecordings.concat([recording]),
        );
        broadcasterRef.current.sendInstruction({ addRecording: recording });
      };
      mediaRecorder.start();
    } else if (mediaRecorder) {
      mediaRecorder.stop();
    }
    broadcasterRef.current.sendInstruction({ isRecording });
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
    <div className="video-wrapper">
      <video playsInline autoPlay muted ref={videoRef}></video>
      <canvas style={{ display: 'none' }} ref={canvasRef} />
      <div className="video-header">
        <div className="video-header-inner">
          <div className="video-recordings">
            {recordings.map(({ name, url, photoUrl }) => {
              return (
                <a key={url} href={url} download={name}>
                  <img src={photoUrl} className="video-still-image" />
                </a>
              );
            })}
          </div>
          <div />
          <div id="broadcastId" className="broadcast-id">
            <a
              target="_blank"
              rel="noreferrer"
              href={`/watch?broadcastId=${broadcastId}`}
            >
              {broadcastId}
            </a>
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