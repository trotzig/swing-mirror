import React, { useEffect, useRef, useState } from 'react';

import ArrowBack from './icons/ArrowBack';

export default function Modal({
  open,
  action,
  opaque = false,
  onClose = () => {},
  children,
  slideUp = false,
  title,
}) {
  const [touchStart, setTouchStart] = useState();
  const [touchDistance, setTouchDistance] = useState();
  const [scrollTimestamp, setScrollTimestamp] = useState(0);
  const childrenRef = useRef();
  useEffect(() => {
    const listener = e => {
      if (e.which === 27) {
        // Escape
        onClose();
      }
    };
    document.addEventListener('keyup', listener);
    return () => document.removeEventListener('keyup', listener);
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    childrenRef.current.querySelector('input').focus();
  }, [open]);
  const classes = ['modal'];
  if (open) {
    classes.push('open');
  } else {
    classes.push('closed');
  }
  if (slideUp) {
    classes.push('slide-up');
  }
  return (
    <div
      className={classes.join(' ')}
      style={{
        backgroundColor: opaque ? '#000' : undefined,
        transform:
          touchDistance && touchDistance > 100
            ? `translateY(${touchDistance}px)`
            : undefined,
      }}
      onTouchStart={e => {
        if (Date.now() - scrollTimestamp < 200) {
          return;
        }
        setTouchStart(e.touches[0].pageY);
      }}
      onTouchMove={e => {
        if (Date.now() - scrollTimestamp < 200) {
          return;
        }
        setTouchDistance(Math.max(0, e.touches[0].pageY - touchStart));
      }}
      onTouchEnd={e => {
        setTouchStart(undefined);
        setTouchDistance(undefined);
        if (touchDistance > 150) {
          onClose();
        }
      }}
    >
      <div
        className="modal-children"
        ref={childrenRef}
        onScroll={e => setScrollTimestamp(Date.now())}
      >
        {children}
      </div>
      <div className="modal-actions">
        <div className="rounded-translucent">
          <button className="reset modal-close" onClick={() => onClose()}>
            <ArrowBack />
          </button>
        </div>
        <div className="modal-title">{title}</div>
        {action}
      </div>
    </div>
  );
}
