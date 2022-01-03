import React from 'react';

export default function ArrowBack({ size = 24, fill = 'currentColor' }) {
  return (
    <svg height={size} viewBox="0 0 24 24" width={size} fill={fill}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z" />
    </svg>
  );
}
