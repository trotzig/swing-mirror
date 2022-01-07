import React, { useEffect } from 'react';

import ArrowBack from './icons/ArrowBack';

export default function Modal({
  open,
  actions,
  opaque = false,
  onClose = () => {},
  children,
  slideUp = false,
}) {
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
      style={{ backgroundColor: opaque ? '#000' : undefined }}
    >
      {children}
      <div className="modal-actions">
        <div className="rounded-translucent">
          <button className="reset modal-close" onClick={() => onClose()}>
            <ArrowBack />
          </button>
        </div>
        {actions}
      </div>
    </div>
  );
}
