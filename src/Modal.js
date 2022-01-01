import React from 'react';

export default function Modal({ open, onClose = () => {}, children }) {
  return (
    <div className={open ? 'modal open' : 'modal closed'}>
      <div className="modal-top">
        <button onClick={()=> onClose() }>
          Close
        </button>
      </div>
      {children}
    </div>
  );
}
