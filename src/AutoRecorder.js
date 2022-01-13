import React, { useCallback, useEffect, useRef, useState } from 'react';

import FrequencyBarGraph from './FrequencyBarGraph';
import VideoMotionDetector from './VideoMotionDetector';

const RECORDING_LENGTH_MS = 4000;

export default function AutoRecorder({
  stream,
  model,
  onRecording,
  onClose,
  videoRef,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const latestAudioSpikeRef = useRef();
  const latestVideoSpikeRef = useRef();

  const handleAudioSpike = useCallback(timestamp => {
    latestAudioSpikeRef.current = timestamp;
  }, []);

  const handleVideoMotion = useCallback(timestamp => {
    latestVideoSpikeRef.current = timestamp;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isRecordingRef.current) {
        return;
      }
      if (!latestAudioSpikeRef.current || !latestVideoSpikeRef.current) {
        // no spikes detected
        return;
      }

      if (
        Math.abs(latestAudioSpikeRef.current - latestVideoSpikeRef.current) >
        100
      ) {
        // not the same event
        return;
      }

      if (Date.now() - latestAudioSpikeRef.current > 100) {
        // too long ago
        return;
      }
      latestAudioSpikeRef.current === undefined;
      latestVideoSpikeRef.current === undefined;
      onRecording(true);
      setIsRecording(true);
      const timeout = setTimeout(() => {
        setIsRecording(false);
        onRecording(false);
        isRecordingRef.current = false;
      }, RECORDING_LENGTH_MS);
    }, 20);

    return () => clearInterval(interval);
  }, [onRecording]);

  return (
    <div className="auto-recorder">
      <div className="auto-recorder-header">
        <h2>Auto-recording active</h2>
        <button className="reset-text" onClick={onClose}>
          Turn off
        </button>
      </div>
      <p style={{ opacity: 0.7 }}>
        We&apos;re monitoring sound and video to detect golf shots. The video is
        delayed while auto-recording.
      </p>
      <FrequencyBarGraph
        width={200}
        height={50}
        stream={stream}
        onSpike={handleAudioSpike}
      />
      <VideoMotionDetector
        onMotion={handleVideoMotion}
        videoRef={videoRef}
        hidden
      />
    </div>
  );
}
