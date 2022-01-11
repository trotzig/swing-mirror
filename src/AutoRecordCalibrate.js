import React, { useCallback, useEffect, useRef, useState } from 'react';

import FrequencyBarGraph from './FrequencyBarGraph';

function processCandidates(candidates) {
  const len = candidates[0].length;
  const normalized = new Uint8Array(len);
  const spreads = new Uint8Array(len);

  console.log(candidates);

  for (let i = 0; i < len; i++) {
    let total = 0;
    let max = 0;
    let min = 1000;
    for (let j = 0; j < candidates.length; j++) {
      const val = candidates[j][i];
      total += val;
      max = Math.max(max, val);
      min = Math.min(min, val);
    }
    normalized[i] = Math.round(total / candidates.length);
    spreads[i] = max - min;
  }

  console.log(spreads);
  return { spreads, data: normalized };
}

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
    const STEP_DURATION = 4000;
    setInformation('Hit a golf shot!');
    let timeout;
    timeout = setTimeout(() => {
      setCandidates(old => old.concat([currentCandidate.current]));
      currentCandidate.current = undefined;
      loudestRef.current = -1;
      setInformation('Hit another golf shot!');
      timeout = setTimeout(() => {
        setCandidates(old => old.concat([currentCandidate.current]));
        currentCandidate.current = undefined;
        loudestRef.current = -1;
        setInformation('...and one last shot!');
        timeout = setTimeout(() => {
          setCandidates(old => old.concat([currentCandidate.current]));
          currentCandidate.current = undefined;
          loudestRef.current = -1;
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
      console.log('loudest!');
      if (!currentCandidate.current) {
        currentCandidate.current = new Uint8Array(bufferLength);
      }
      copyValues(dataArray, currentCandidate.current, bufferLength);
    }
  }, []);

  return (
    <div className="auto-record-calibrate">
      <div className="page-wrapper">
        {started && (
          <FrequencyBarGraph stream={stream} onData={onFrequencyBarGraphData} />
        )}
        <p>{information}</p>
        {started ? (
          <div />
        ) : (
          <button className="reset-text" onClick={() => setStarted(true)}>
            Start calibration
          </button>
        )}
        {candidates.map((candidate, i) => (
          <FrequencyBarGraph key={i} data={candidate} />
        ))}
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
