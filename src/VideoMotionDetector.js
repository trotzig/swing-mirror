import React, { useEffect, useRef, useState } from 'react';

export default function VideoMotionDetector({
  videoRef,
  onMotion,
  hidden,
  ballPosition,
}) {
  const [ballVisible, setBallVisible] = useState(false);
  const canvasRef = useRef();
  const workerRef = useRef();
  const lastBallVisible = useRef();
  useEffect(() => {
    let isActive = true;
    canvasRef.current.width = videoRef.current.videoWidth / 4;
    canvasRef.current.height = videoRef.current.videoHeight / 4;
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
      workerRef.current.postMessage(
        { width, height, ballPosition, pixels: imageData.data.buffer },
        [imageData.data.buffer],
      );
      setTimeout(renderFrame, 50);
    }

    const worker = new Worker('/video-diff-worker.js');
    workerRef.current = worker;
    worker.addEventListener('message', e => {
      setBallVisible(e.data.ballVisible);
    });
    renderFrame();

    () => {
      isActive = false;
      worker.terminate();
    };
  }, [videoRef, ballPosition, setBallVisible]);

  useEffect(() => {
    if (ballVisible) {
      lastBallVisible.current = Date.now();
    } else if (lastBallVisible.current) {
      onMotion();
    }
  }, [ballVisible, onMotion]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{ display: hidden ? 'none' : undefined }}
      />
      {ballVisible ? 'BALL VISIBLE' : 'NO BALL'}
    </div>
  );
}
