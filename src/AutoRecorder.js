import React, { useCallback, useRef, useState } from 'react';

import FrequencyBarGraph from './FrequencyBarGraph';

const RECORDING_LENGTH_MS = 3000;

function matchFrequencyDataArrays(dataArray, model) {
  const len = dataArray.length;

  for (let i = 0; i < len; i++) {
    const a = dataArray[i];
    const b = model.data[i];
    const allowedSpread = model.spreads[i];

    if (Math.abs(a - b) > allowedSpread + 20) {
      return false;
    }
  }
  return true;
}

export default function AutoRecorder({ stream, model, onRecording }) {
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);

  const onFrequencyBarGraphData = useCallback(
    (dataArray, bufferLength) => {
      let timeout;
      if (isRecordingRef.current) {
        return;
      }
      if (matchFrequencyDataArrays(dataArray, model)) {
        console.log('Matching!');
        setIsRecording(true);
        onRecording(true);
        isRecordingRef.current = true;
        timeout = setTimeout(() => {
          setIsRecording(false);
          onRecording(false);
          isRecordingRef.current = false;
        }, RECORDING_LENGTH_MS);
      }
    },
    [model, onRecording],
  );
  return (
    <div className="auto-recorder">
      {isRecording ? 'RECORDING!' : 'not recording'}
      <FrequencyBarGraph
        width={200}
        height={50}
        stream={stream}
        onData={onFrequencyBarGraphData}
      />
      <FrequencyBarGraph width={200} height={50} data={model.data} />
      <FrequencyBarGraph width={200} height={50} data={model.spreads} />
    </div>
  );
}
