import React, { useEffect, useRef, useState } from 'react';

const DIFF_THRESHOLD = 4;

export default function VideoMotionDetector({
  videoRef,
  onMotion,
  hidden,
  ballPosition,
}) {
  const [diff, setDiff] = useState(0);
  const [ballVisible, setBallVisible] = useState(false);
  const canvasRef = useRef();
  const outputRef = useRef();
  const workerRef = useRef();
  const lastBallVisible = useRef();
  useEffect(() => {
    let isActive = true;
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    const ctx = canvasRef.current.getContext('2d');

    function renderFrame() {
      if (!isActive) {
        return;
      }
      if (!canvasRef.current) {
        return;
      }
      const sx = Math.round(ballPosition.x * videoWidth);
      const sy = Math.round(ballPosition.y * videoHeight);
      console.log(sx, sy);
      ctx.drawImage(videoRef.current, sx, sy, 100, 100, 0, 0, 100, 100);
      const imageData = ctx.getImageData(0, 0, 100, 100);
      workerRef.current.postMessage(imageData.data.buffer, [
        imageData.data.buffer,
      ]);
      setTimeout(renderFrame, 50);
    }

    const worker = new Worker('/video-diff-worker.js');
    workerRef.current = worker;
    worker.addEventListener('message', e => {
      setDiff(e.data.diff);
    });
    renderFrame();

    () => {
      isActive = false;
      worker.terminate();
    };
  }, [videoRef, ballPosition, setDiff]);

  useEffect(() => {
    const isVisible = diff > DIFF_THRESHOLD;
    setBallVisible(isVisible);
    if (isVisible) {
      lastBallVisible.current = Date.now();
    } else if (lastBallVisible.current) {
      onMotion(Date.now());
      lastBallVisible.current = undefined;
    }
  }, [diff, onMotion, setBallVisible]);

  return (
    <div>
      <canvas
        width="100"
        height="100"
        ref={canvasRef}
        style={{ display: 'block', width: 'auto' }}
      />
      {ballVisible ? 'BALL VISIBLE' : 'NO BALL'}
      {' '}-- {diff}
    </div>
  );
}
