import React from 'react';

export default function Warning({ size = 24, fill = 'currentColor' }) {
  return (
    <svg
      height={size}
      viewBox="0 0 24 24"
      width={size}
      fill={fill}
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  );
}
