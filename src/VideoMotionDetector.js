import React, { useEffect, useRef } from 'react';

export default function VideoMotionDetector({ videoRef, onMotion, hidden }) {
  const canvasRef = useRef();
  const workerRef = useRef();
  useEffect(() => {
    let isActive = true;
    canvasRef.current.width = videoRef.current.videoWidth / 8;
    canvasRef.current.height = videoRef.current.videoHeight / 8;
    const { width, height } = canvasRef.current;

    const ctx = canvasRef.current.getContext('2d');

    function renderFrame() {
      if (!isActive) {
        return;
      }
      if (!canvasRef.current) {
        return;
      }
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      workerRef.current.postMessage(imageData.data.buffer, [
        imageData.data.buffer,
      ]);
      setTimeout(renderFrame, 50);
    }

    workerRef.current = new Worker('/video-diff-worker.js');
    workerRef.current.addEventListener('message', e => {
      onMotion(Date.now(), e.data);
    });
    renderFrame();

    () => {
      isActive = false;
    };
  }, [videoRef, onMotion]);
  return (
    <canvas ref={canvasRef} style={{ display: hidden ? 'none' : undefined }} />
  );
}
