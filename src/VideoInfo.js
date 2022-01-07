import React from 'react';

export default function VideoInfo({ video }) {
  return <div className="video-info">{video.name || 'Unnamed video'}</div>;
}
