import React, { useCallback, useEffect, useRef, useState } from 'react';

import FrequencyBarGraph from './FrequencyBarGraph';

function processCandidates(candidates) {}

function copyValues(src, dest, length) {
  for (let i = 0; i < length; i++) {
    dest[i] = src[i];
  }
}

export default function AutoRecordCalibrate({ stream, onCalibrationDone }) {
  const [candidates, setCandidates] = useState([]);
  const [started, setStarted] = useState(false);
  const [information, setInformation] = useState('Press the button to start');
  const canvasRef = useRef();
  const currentCandidate = useRef();
  const loudestRef = useRef(-1);

  useEffect(() => {
    if (!started) {
      return;
    }
    const STEP_DURATION = 5000;
    setInformation('Hit a golf shot!');
    let timeout;
    timeout = setTimeout(() => {
      setCandidates(old => old.concat([currentCandidate.current]));
      setInformation('Hit another golf shot!');
      timeout = setTimeout(() => {
        setCandidates(old => old.concat([currentCandidate.current]));
        setInformation('...and one last shot!');
        timeout = setTimeout(() => {
          setCandidates(old => old.concat([currentCandidate.current]));
          setInformation("That's it! Thank you!");
        }, STEP_DURATION);
      }, STEP_DURATION);
    }, STEP_DURATION);
    () => clearTimeout(timeout);
  }, [started]);

  const onFrequencyBarGraphData = useCallback((dataArray, bufferLength) => {
    let loudness = 0;
    for (let i = 0; i < bufferLength; i++) {
      loudness += dataArray[i];
    }
    if (loudness > loudestRef.current) {
      loudestRef.current = loudness;
      copyValues(dataArray, currentCandidate.current, bufferLength);
    }
  }, []);

  return (
    <div className="auto-record-calibrate">
      <div className="page-wrapper">
        {started && (
          <FrequencyBarGraph
            stream={stream}
            onData={onFrequencyBarGraphData}
          />
        )}
        <p>{information}</p>
        {started ? (
          <div />
        ) : (
          <button className="reset-text" onClick={() => setStarted(true)}>
            Start calibration
          </button>
        )}

        {candidates.length === 3 && (
          <button
            className="reset-text"
            onClick={() => {
              onCalibrationDone(processCandidates(candidates));
              setCandidates([]);
              setStarted();
            }}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
