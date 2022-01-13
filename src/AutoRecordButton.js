import React from 'react';

export default function AutoRecordButton({ isActive, onClick }) {
  const toggleClasses = ['toggle'];
  if (isActive) {
    toggleClasses.push('toggle-on');
  } else {
    toggleClasses.push('toggle-off');
  }
  return (
    <button className="reset auto-record-button" onClick={onClick}>
      <div className={toggleClasses.join(' ')} />
      <div>Auto</div>
    </button>
  );
}
