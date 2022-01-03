import React, { useEffect } from 'react';

import ArrowBack from './icons/ArrowBack';

export default function Modal({ open, actions, onClose = () => {}, children }) {
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
  return (
    <div className={open ? 'modal open' : 'modal closed'}>
      {children}
      <div className="modal-actions">
        <button
          className="reset"
          style={{ padding: 20 }}
          onClick={() => onClose()}
        >
          <ArrowBack />
        </button>
        {actions}
      </div>
    </div>
  );
}
