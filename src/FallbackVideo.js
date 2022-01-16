import React, { useEffect, useRef, useState } from 'react';

export default function FallbackVideo({
  videoRef,
  width,
  height,
  onStream = () => {},
}) {
  const canvasRef = useRef();

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    let isActive = true;

    let animFrame;

    function processMirrorFrame() {
      if (!isActive || !canvasRef.current) {
        return;
      }
      ctx.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );
      animFrame = requestAnimationFrame(processMirrorFrame);
    }
    processMirrorFrame();
    return () => {
      cancelAnimationFrame(animFrame);
      isActive = false;
    };
  }, [videoRef]);

  useEffect(() => {
    const stream = canvasRef.current.captureStream();
    const audioTracks = videoRef.current.srcObject.getAudioTracks();
    console.log(audioTracks);
    audioTracks.forEach(audioTrack => stream.addTrack(audioTrack));
    onStream(stream);
    () => {
      onStream(undefined);
    };
  }, [onStream, videoRef]);

  return (
    <canvas
      width={width}
      height={height}
      ref={canvasRef}
      className="fallback-video"
    />
  );
}
