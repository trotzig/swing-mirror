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
    canvasCtx.fillStyle = 'red';
    canvasCtx.fillRect(x, height - barHeight, barWidth, barHeight);
    x += barWidth;
  }
}

function getTotalLoudness({ dataArray, bufferLength }) {
  let total = 0;
  for (let i = 0; i < bufferLength; i++) {
    total += dataArray[i];
  }
  return total;
}

const SPIKE_INCREASE = 5;
const SPIKE_MIN_LOUDNESS = MAX_VALUE * 5;

export default function FrequencyBarGraph({
  stream,
  onSpike,
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
    analyzer.minDecibel = -10;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    sourceNode.connect(analyzer);

    let isActive = true;
    let previousLoudness;
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
      const loudness = getTotalLoudness({ dataArray, bufferLength });
      if (
        typeof previousLoudness === 'number' &&
        loudness > SPIKE_INCREASE * previousLoudness &&
        loudness > SPIKE_MIN_LOUDNESS
      ) {
        onSpike(Date.now());
      }
      previousLoudness = loudness;
      requestAnimationFrame(renderFrame);
    }
    renderFrame();

    () => {
      isActive = false;
    };
  }, [stream, onSpike]);

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
