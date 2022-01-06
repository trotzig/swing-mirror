import React from 'react';

export default function ArrowBack({ size = 24, fill = 'currentColor' }) {
  return (
    <svg
      enableBackground="new 0 0 24 24"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      fill={fill}
    >
      <rect fill="none" height="24" width="24" />
      <g>
        <polygon points="17.77,3.77 16,2 6,12 16,22 17.77,20.23 9.54,12" />
      </g>
    </svg>
  );
}
