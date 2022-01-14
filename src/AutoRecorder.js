import React, { useCallback, useEffect, useRef, useState } from 'react';

import FrequencyBarGraph from './FrequencyBarGraph';
import VideoMotionDetector from './VideoMotionDetector';
import VideoRecorder from './VideoRecorder';

const RECORDING_LENGTH_MS = 4000;

export default function AutoRecorder({
  passive,
  stream,
  model,
  onRecording,
  onClose,
  videoRef,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const canvasRef = useRef();
  const activeRecordingsRef = useRef([]);
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
      activeRecordingsRef.current[0].keep = true;

      const timeout = setTimeout(() => {
        onRecording(false);
        isRecordingRef.current = false;
      }, RECORDING_LENGTH_MS);
    }, 20);

    return () => clearInterval(interval);
  }, [onRecording]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isRecordingRef.current) {
        // There's an ongoing recording, we want to prevent overusing gpu/cpu
        // etc.
        return;
      }
      const recording = new VideoRecorder({
        stream,
        video: videoRef.current,
        canvas: canvasRef.current,
        isAuto: true,
        keep: false,
      });
      function discardRecording() {
        if (recording.keep) {
          console.log('Stopping keep video');
        }
        recording.stop();
        const index = activeRecordingsRef.current.indexOf(recording);
        activeRecordingsRef.current.splice(index, 1);
      }
      setTimeout(() => {
        if (recording.keep) {
          // we're keeping this video around
          console.log('Found recording to keep');
          setTimeout(discardRecording, RECORDING_LENGTH_MS / 2);
        } else {
          discardRecording();
        }
      }, RECORDING_LENGTH_MS / 2);

      recording.start();
      activeRecordingsRef.current.push(recording);
    }, 1000);

    const activeRecordings = activeRecordingsRef.current;

    return () => {
      clearInterval(interval);
      for (const rec of activeRecordings) {
        rec.stop();
      }
    };
  }, [videoRef, stream]);

  return (
    <div className="auto-recorder">
      <div className="auto-recorder-header">
        <h2>Auto-recording active</h2>
        <button className="reset-text" onClick={onClose}>
          Turn off
        </button>
      </div>
      <p style={{ opacity: 0.7 }}>
        We&apos;re monitoring sound spikes and video movement to detect golf shots.
      </p>
      {!passive && (
        <>
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
        </>
      )}
      <canvas style={{ display: 'none' }} ref={canvasRef} />
    </div>
  );
}
