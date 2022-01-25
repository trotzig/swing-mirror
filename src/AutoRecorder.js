import React, { useCallback, useEffect, useRef, useState } from 'react';

import BallPosition from './BallPosition';
import FrequencyBarGraph from './FrequencyBarGraph';
import VideoMotionDetector from './VideoMotionDetector';
import VideoRecorder from './VideoRecorder';

const RECORDING_LENGTH_MS = 4000;

export default function AutoRecorder({
  isPaused,
  passive,
  signal = false,
  stream,
  onRecording,
  onClose,
  videoRef,
  onReplayVideo = () => {},
  isAutoReplay,
  onToggleAutoReplay,
  ballPosition,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const canvasRef = useRef();
  const activeRecordingsRef = useRef([]);
  const latestAudioSpikeRef = useRef();
  const latestVideoSpikeRef = useRef();
  const replayRecordingsRef = useRef(isAutoReplay);

  const handleAudioSpike = useCallback(timestamp => {
    console.log('audio spike', timestamp);
    latestAudioSpikeRef.current = timestamp;
  }, []);

  const handleVideoMotion = useCallback(timestamp => {
    console.log('video spike', timestamp);
    latestVideoSpikeRef.current = timestamp;
  }, []);

  useEffect(() => {
    replayRecordingsRef.current = isAutoReplay;
  }, [isAutoReplay]);

  useEffect(() => {
    if (passive || isPaused) {
      return;
    }
    let recordingTimeout;
    const interval = setInterval(() => {
      if (isRecordingRef.current) {
        return;
      }
      if (passive || isPaused) {
        return;
      }
      if (!latestAudioSpikeRef.current || !latestVideoSpikeRef.current) {
        // no spikes detected
        return;
      }

      const diff = Math.abs(
        latestAudioSpikeRef.current - latestVideoSpikeRef.current,
      );

      if (diff > 300) {
        // not the same event
        return;
      }

      if (Date.now() - latestAudioSpikeRef.current > 400) {
        // too long ago
        return;
      }
      latestAudioSpikeRef.current === undefined;
      latestVideoSpikeRef.current === undefined;
      if (activeRecordingsRef.current.length) {
        activeRecordingsRef.current[0].keep = true;
        activeRecordingsRef.current[0].takeStillPhoto();
        onRecording(true);

        recordingTimeout = setTimeout(() => {
          onRecording(false);
          isRecordingRef.current = false;
        }, RECORDING_LENGTH_MS);
      }
    }, 50);

    return () => {
      clearInterval(interval);
      clearTimeout(recordingTimeout);
    };
  }, [onRecording, passive, isPaused]);

  useEffect(() => {
    if (!passive) {
      // no need to listen to signal when not passive
      return;
    }
    isRecordingRef.current = signal;
    if (signal) {
      activeRecordingsRef.current[0].keep = true;
    }
  }, [passive, signal]);

  useEffect(() => {
    if (isPaused) {
      return;
    }
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
        recording.stop().then(video => {
          if (!video) {
            return;
          }
          if (replayRecordingsRef.current) {
            onReplayVideo(video);
          }
        });
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

      recording.start({ takeStillPhoto: false });
      activeRecordingsRef.current.push(recording);
    }, 1000);

    const activeRecordings = activeRecordingsRef.current;

    return () => {
      clearInterval(interval);
      for (const rec of activeRecordings) {
        rec.stop();
      }
    };
  }, [videoRef, stream, onReplayVideo, isPaused]);

  const toggleClasses = ['toggle'];
  if (isAutoReplay) {
    toggleClasses.push('toggle-on');
  } else {
    toggleClasses.push('toggle-off');
  }

  return (
    <>
      <div className="auto-recorder">
        <div className="auto-recorder-header">
          <h2>Auto-recording active</h2>
          <button className="reset-text" onClick={onClose}>
            Turn off
          </button>
        </div>
        <p style={{ opacity: 0.7 }}>
          We&apos;re monitoring sound spikes and video movement to detect golf
          shots.
        </p>
        <button
          className="reset-text auto-replay-button"
          onClick={() => onToggleAutoReplay(!isAutoReplay)}
        >
          <div className={toggleClasses.join(' ')} />
          <div>Replay recorded videos</div>
        </button>
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
              ballPosition={ballPosition}
            />
          </>
        )}
        <canvas style={{ display: 'none' }} ref={canvasRef} />
      </div>
    </>
  );
}
