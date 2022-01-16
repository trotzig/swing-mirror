import React, { useEffect, useRef, useState } from 'react';

import Restart from './icons/Restart';
import Undo from './icons/Undo';
import getObjectFitSize from './getObjectFitSize';

function getMousePos(evt) {
  const canvas = evt.target;
  const cRect = canvas.getBoundingClientRect();
  const rect = getObjectFitSize(
    cRect.width,
    cRect.height,
    canvas.width,
    canvas.height,
  );
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
        onTouchStart={e =>
          setCurrentItem({
            start: getMousePos(e.changedTouches[0]),
            end: getMousePos(e.changedTouches[0]),
          })
        }
        onMouseDown={e =>
          setCurrentItem({ start: getMousePos(e), end: getMousePos(e) })
        }
        onTouchMove={e => {
          if (currentItem) {
            setCurrentItem({
              start: currentItem.start,
              end: getMousePos(e.changedTouches[0]),
            });
          }
        }}
        onMouseMove={e => {
          if (currentItem) {
            setCurrentItem({ start: currentItem.start, end: getMousePos(e) });
          }
        }}
        onTouchEnd={e => {
          if (!currentItem) {
            return;
          }
          const end = getMousePos(e.changedTouches[0]);
          if (
            Math.abs(currentItem.start.x - currentItem.end.x) +
              Math.abs(currentItem.start.y - currentItem.end.y) >
            10
          ) {
            setItems(old => old.concat([currentItem]));
          }
          setCurrentItem();
        }}
        onMouseUp={e => {
          if (!currentItem) {
            return;
          }
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
        className="drawing-board-buttons"
        style={{
          opacity: items.length ? 1 : 0,
          pointerEvents: items.length ? undefined : 'none',
        }}
      >
        <div className="undo-drawing-board rounded-translucent">
          <button
            className="reset"
            onClick={() => {
              setItems(old => old.slice(0, old.length - 1));
            }}
          >
            <Undo />
          </button>
        </div>

        <div className="clear-drawing-board rounded-translucent">
          <button
            className="reset"
            onClick={() => {
              setItems([]);
            }}
          >
            <Restart />
          </button>
        </div>
      </div>
    </div>
  );
}
