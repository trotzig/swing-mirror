import React from 'react';

import Cup from './icons/Cup';
import getObjectFitSize from './getObjectFitSize';

export default function PlayerGraphics({ videoWidth, videoHeight }) {
  const rect = getObjectFitSize(
    window.innerWidth,
    window.innerHeight,
    videoWidth,
    videoHeight,
  );
  return (
    <div className="player-graphics" style={{ maxWidth: rect.width }}>
      <div className="player-graphics-outer">
        <div className="player-graphics-inner">
          <div className="player-graphics-hole">17</div>
          <div className="player-graphics-par">
            Par 4 <b>491</b>
          </div>
          <div className="player-graphics-cup">
            1 <Cup size={18} />
          </div>
          <div className="player-graphics-name">Shooter McGavin</div>
          <div className="player-graphics-pos">1st</div>
          <div className="player-graphics-score">-12</div>
          <div className="player-graphics-extra">
            <span>Driving accuracy</span>
            <b>Week: 87% (1st)</b>
          </div>
        </div>
      </div>
    </div>
  );
}
