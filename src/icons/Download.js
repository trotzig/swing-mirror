import React from 'react';

export default function Download({ size = 24, fill = 'currentColor' }) {
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
      </g>
      <g>
        <path d="M5,20h14v-2H5V20z M19,9h-4V3H9v6H5l7,7L19,9z" />
      </g>
    </svg>
  );
}
