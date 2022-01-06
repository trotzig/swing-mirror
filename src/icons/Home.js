import React from 'react';

export default function Home({ size = 24, fill = 'currentColor' }) {
  return (
    <svg
      height={size}
      viewBox="0 0 24 24"
      width={size}
      fill={fill}
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}
