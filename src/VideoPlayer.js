import React, { useState } from 'react';

export default function VideoPlayer({ video, initialObjectFit = 'cover' }) {
  const [objectFit, setObjectFit] = useState(initialObjectFit);
  return (
    <video
      playsInline
      autoPlay
      muted
      controls
      loop
      style={{ objectFit }}
      src={video && video.url}
      onDoubleClick={() => {
        setObjectFit(objectFit === 'contain' ? 'cover' : 'contain');
      }}
    ></video>
  );
}
