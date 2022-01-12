import React, { useCallback, useEffect, useRef, useState } from 'react';

import FrequencyBarGraph from './FrequencyBarGraph';
import VideoMotionDetector from './VideoMotionDetector';

const RECORDING_LENGTH_MS = 3000;

export default function AutoRecorder({ stream, model, onRecording, videoRef }) {
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const latestAudioSpikeRef = useRef();
  const latestVideoSpikeRef = useRef();

  const handleAudioSpike = useCallback(timestamp => {
    console.log('audio spike!', timestamp);
    latestAudioSpikeRef.current = timestamp;
  }, []);

  const handleVideoMotion = useCallback(timestamp => {
    console.log('video spike!', timestamp);
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

      if (Math.abs(latestAudioSpikeRef.current - latestVideoSpikeRef.current) > 100) {
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
      {isRecording ? 'RECORDING!' : 'not recording'}
      <FrequencyBarGraph
        width={200}
        height={50}
        stream={stream}
        onSpike={handleAudioSpike}
      />
      <VideoMotionDetector onMotion={handleVideoMotion} videoRef={videoRef} />
    </div>
  );
}
