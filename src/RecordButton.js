import React, { useEffect, useRef } from 'react';

export default function RecordButton({ isRecording, onClick }) {
  const buttonRef = useRef();
  useEffect(() => {
    const listener = e => {
      if (e.target === buttonRef.current) {
        // button is focused
        return;
      }
      if (e.which === 13 || e.which === 32) {
        // Enter or Spacebar
        onClick();
      }
    };
    document.addEventListener('keyup', listener);
    return () => document.removeEventListener('keyup', listener);
  });

  return (
    <button
      ref={buttonRef}
      className={
        isRecording ? 'record-button recording' : 'record-button stopped'
      }
      onClick={onClick}
    />
  );
}
