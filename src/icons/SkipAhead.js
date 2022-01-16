import React from 'react';

export default function SkipAhead({ size = 24, fill = 'currentColor' }) {
  return (
    <svg
      enableBackground="new 0 0 24 24"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      fill={fill}
    >
      <g>
        <rect fill="none" height="24" width="24" />
        <path d="M12,4c4.41,0,8,3.59,8,8s-3.59,8-8,8s-8-3.59-8-8S7.59,4,12,4 M12,2C6.48,2,2,6.48,2,12c0,5.52,4.48,10,10,10 s10-4.48,10-10C22,6.48,17.52,2,12,2L12,2z M11,8H9v8h2V8z M17,12l-5-4v8L17,12z" />
      </g>
    </svg>
  );
}