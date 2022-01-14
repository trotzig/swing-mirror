import React, { useEffect, useRef, useState } from 'react';

import Undo from './icons/Undo';

function getMousePos(evt) {
  const canvas = evt.target;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY,
  };
}

export default function DrawingBoard({ width, height }) {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState();
  const canvasRef = useRef();
  const ctxRef = useRef();

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    if (!ctxRef.current) {
      ctxRef.current = canvasRef.current.getContext('2d');
    }
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, width, height);
    const all = items.concat(currentItem ? [currentItem] : []);

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 4;

    for (const item of all) {
      ctx.beginPath();
      ctx.moveTo(item.start.x, item.start.y);
      ctx.lineTo(item.end.x, item.end.y);
      ctx.stroke();
    }
  }, [items, currentItem, height, width]);

  return (
    <div>
      <canvas
        onMouseDown={e =>
          setCurrentItem({ start: getMousePos(e), end: getMousePos(e) })
        }
        onMouseMove={e => {
          if (currentItem) {
            setCurrentItem({ start: currentItem.start, end: getMousePos(e) });
          }
        }}
        onMouseUp={e => {
          const end = getMousePos(e);
          if (
            Math.abs(currentItem.start.x - currentItem.end.x) +
              Math.abs(currentItem.start.y - currentItem.end.y) >
            10
          ) {
            setItems(old => old.concat([currentItem]));
          }
          setCurrentItem();
        }}
        className="drawing-board"
        ref={canvasRef}
        width={width}
        height={height}
      />
      <div
        className="undo-drawing-board rounded-translucent"
        style={{
          opacity: items.length ? 1 : 0,
          pointerEvents: items.length ? undefined : 'none',
        }}
      >
        <button
          className="reset"
          onClick={() => {
            setItems(old => old.slice(0, old.length - 1));
          }}
        >
          <Undo />
        </button>
      </div>
    </div>
  );
}
