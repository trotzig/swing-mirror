import React, { useEffect, useRef } from 'react';

export default function FrequencyBarGraph({ stream, onData }) {
  const canvasRef = useRef();
  useEffect(() => {
    if (!stream) {
      return;
    }
    const canvasCtx = canvasRef.current.getContext('2d');
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const sourceNode = ctx.createMediaStreamSource(stream);
    const analyzer = ctx.createAnalyser();
    analyzer.fftSize = 64;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    console.log({ bufferLength });

    const barWidth = width / bufferLength;
    sourceNode.connect(analyzer);

    let isActive = true;
    function renderFrame() {
      if (!isActive) {
        return;
      }
      canvasCtx.clearRect(0, 0, width, height);
      analyzer.getByteFrequencyData(dataArray);

      if (!dataArray) {
        return requestAnimationFrame(renderFrame);
      }
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;
        canvasCtx.fillStyle = 'rgba(66, 122, 172, 1)';
        canvasCtx.fillRect(x, height - barHeight / 2, barWidth, barHeight);
        x += barWidth;
      }
      onData(dataArray);
      requestAnimationFrame(renderFrame);
    }
    renderFrame();

    () => {
      isActive = false;
    };
  }, [stream, onData]);
  return <canvas ref={canvasRef} />;
}
