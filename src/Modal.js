import React from 'react';

export default function Modal({ open, actions, onClose = () => {}, children }) {
  return (
    <div className={open ? 'modal open' : 'modal closed'}>
      {children}
      <div className="modal-actions">
        <button className="modal-close" onClick={() => onClose()}>
          &lt; Back
        </button>
        {actions}
      </div>
    </div>
  );
}
