import React from 'react';

export default function VideoCam({ size = 24, fill = 'currentColor' }) {
  return (
    <svg height={size} viewBox="0 0 24 24" width={size} fill={fill}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
    </svg>
  );
}
