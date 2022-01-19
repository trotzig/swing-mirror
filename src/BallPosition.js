import React, { useCallback, useEffect, useState } from 'react';

const SQUARE_SIZE = 100;
const half = SQUARE_SIZE / 2;

export default function BallPosition({ videoWidth, videoHeight, onPosition }) {
  const [pos, setPos] = useState();
  const [isMoving, setIsMoving] = useState();

  const updatePos = useCallback(
    e => {
      const evt = e.changedTouches ? e.changedTouches[0] : e;

      setPos({ x: evt.clientX - half, y: evt.clientY - half });
    },
    [setPos],
  );

  useEffect(() => {
    setPos({
      x: window.innerWidth / 2 - half,
      y: window.innerHeight - (window.innerHeight / 5) - half,
    });
  }, []);
  return (
    <div>
      <div className="ball-position">
        <div className="ball-position-inner">
          <h2>
            Move the square below so that the ball is positioned inside it
          </h2>
        </div>
      </div>

      <canvas
        className="ball-position-canvas"
        width={videoWidth}
        height={videoHeight}
      />
      {pos && (
        <div
          className="ball-position-square"
          style={{
            left: pos.x,
            top: pos.y,
            width: SQUARE_SIZE,
            height: SQUARE_SIZE,
          }}
          onTouchMove={updatePos}
          onMouseDown={() => setIsMoving(true)}
          onMouseMove={e => {
            if (isMoving) {
              updatePos(e);
            }
          }}
          onMouseUp={() => setIsMoving(false)}
          onMouseOut={() => setIsMoving(false)}
        />
      )}
    </div>
  );
}
