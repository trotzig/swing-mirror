import React, { useCallback, useState } from 'react';

import FrequencyBarGraph from './FrequencyBarGraph';

export default function AutoRecordCalibrate({ stream, onCalibrationDone }) {
  const [soundSpikes, setSoundSpikes] = useState([]);

  const handleSoundSpike = useCallback(
    timestamp => {
      setSoundSpikes(old => old.concat(timestamp));
    },
    [setSoundSpikes],
  );

  return (
    <div className="auto-record-calibrate">
      <div className="page-wrapper">
        <FrequencyBarGraph stream={stream} onSpike={handleSoundSpike} />
        <br/>
        <br/>
        <br/>
        <h2>Sound spikes</h2>
        <ul>
          {soundSpikes.map(ts => (
            <li key={ts}>{ts}</li>
          ))}
        </ul>


      </div>
    </div>
  );
}
