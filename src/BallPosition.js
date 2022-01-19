import React, { useCallback, useEffect, useRef, useState } from 'react';

import getMousePos from './getMousePos';

const SQUARE_SIZE = 100;
const half = SQUARE_SIZE / 2;

function relativeBallPosition(posOnPage, canvas, videoWidth, videoHeight) {
  const fakeEvt = {
    target: canvas,
    clientX: posOnPage.x,
    clientY: posOnPage.y,
  };
  const pos = getMousePos(fakeEvt);
  pos.x = pos.x / videoWidth;
  pos.y = pos.y / videoHeight;
  pos.size = SQUARE_SIZE;
  return pos;
}

export default function BallPosition({ videoWidth, videoHeight, onPosition }) {
  const [pos, setPos] = useState();
  const [isMoving, setIsMoving] = useState();
  const [locked, setLocked] = useState(false);
  const canvasRef = useRef();

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
      y: window.innerHeight / 2 - half,
    });
  }, []);
  return (
    <div>
      <canvas
        ref={canvasRef}
        className="ball-position-canvas"
        width={videoWidth}
        height={videoHeight}
      />
      <div className="ball-position">
        <div className="ball-position-inner">
          {locked ? (
            <div>
              <h2>
                Step 2: Remove the ball (and other objects) from the square.
              </h2>
              <button
                onClick={() =>
                  onPosition(
                    relativeBallPosition(
                      pos,
                      canvasRef.current,
                      videoWidth,
                      videoHeight,
                    ),
                  )
                }
              >
                Done
              </button>
            </div>
          ) : (
            <div>
              <h2>
                Step 1: Move the square below so that the ball is positioned
                inside it.
              </h2>
              <button onClick={() => setLocked(true)}>Next</button>
            </div>
          )}
        </div>
      </div>
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
