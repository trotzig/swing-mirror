import React, { useEffect, useRef, useState } from 'react';

function initCanvas(canvas, video) {
  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  return ctx;
}

export default function DelayedVideo({ videoRef, delaySeconds }) {
  const captureRef = useRef();
  const outputRef = useRef();
  const workerRef = useRef();
  const frameRateRef = useRef(30);

  useEffect(() => {
    const captureCtx = initCanvas(captureRef.current, videoRef.current);
    const outputCtx = initCanvas(outputRef.current, videoRef.current);

    let isActive = true;
    let framesProcessed = 0;

    const frameRateInterval = setInterval(() => {
      frameRateRef.current = framesProcessed;
      framesProcessed = 0;
      // console.log('Current frame rate', frameRateRef.current);
    }, 1000);

    function processFrame() {
      if (!isActive || !captureRef.current) {
        return;
      }
      captureCtx.drawImage(
        videoRef.current,
        0,
        0,
        captureRef.current.width,
        captureRef.current.height,
      );
      const imageData = captureCtx.getImageData(
        0,
        0,
        captureRef.current.width,
        captureRef.current.height,
      );
      workerRef.current.postMessage(imageData.data.buffer, [
        imageData.data.buffer,
      ]);
    }

    workerRef.current = new Worker('/video-delay-worker.js');
    workerRef.current.addEventListener('message', e => {
      framesProcessed++;
      if (e.data == 'empty') {
        // still buffering, keep capturing
        requestAnimationFrame(processFrame);
        return;
      }
      if (!captureRef.current) {
        return;
      }
      const imageData = new ImageData(
        new Uint8ClampedArray(e.data),
        captureRef.current.width,
        captureRef.current.height,
      );

      outputCtx.putImageData(imageData, 0, 0);
      requestAnimationFrame(processFrame);
    });

    processFrame();
    return () => {
      isActive = false;
      workerRef.current.terminate();
      clearInterval(frameRateInterval);
    };
  }, [videoRef]);

  useEffect(() => {
    workerRef.current.postMessage({
      delaySeconds,
      framesPerSecond: frameRateRef.current,
    });
  }, [delaySeconds]);

  return (
    <div>
      <canvas ref={captureRef} style={{ display: 'none' }} />
      <canvas ref={outputRef} className="delayed-video" />
    </div>
  );
}
