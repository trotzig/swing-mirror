import React, { useEffect, useRef } from 'react';

const MAX_VALUE = 255;

function renderGraph({
  canvasCtx,
  dataArray,
  width,
  height,
  bufferLength,
  barWidth,
}) {
  canvasCtx.clearRect(0, 0, width, height);
  let x = 0;
  for (let i = 0; i < bufferLength; i++) {
    const barWidth = width / bufferLength;
    const barHeight = dataArray[i] * (height / MAX_VALUE);
    canvasCtx.fillStyle = 'rgba(66, 122, 172, 1)';
    canvasCtx.fillRect(x, height - barHeight, barWidth, barHeight);
    x += barWidth;
  }
}

export default function FrequencyBarGraph({
  stream,
  onData,
  data,
  width,
  height,
}) {
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

    sourceNode.connect(analyzer);

    let isActive = true;
    function renderFrame() {
      if (!isActive) {
        return;
      }
      analyzer.getByteFrequencyData(dataArray);
      renderGraph({
        canvasCtx,
        dataArray,
        bufferLength,
        width,
        height,
      });
      onData(dataArray, bufferLength);
      requestAnimationFrame(renderFrame);
    }
    renderFrame();

    () => {
      isActive = false;
    };
  }, [stream, onData]);

  useEffect(() => {
    if (!data) {
      return;
    }
    const canvasCtx = canvasRef.current.getContext('2d');
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    renderGraph({
      canvasCtx,
      dataArray: data,
      bufferLength: data.length,
      width,
      height,
    });
  }, [data]);
  return <canvas width={width} height={height} ref={canvasRef} />;
}
