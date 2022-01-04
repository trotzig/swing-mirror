import React, { useEffect, useRef, useState } from 'react';

const pausePath =
  'M13,10 L18,13 18,23 13,26 M18,13 L26,18 26,18 18,23';
const playPath = 'M10,10 L16,10 16,26 10,26 M20,10 L26,10 26,26 20,26';

export default function VideoPlayer({ video, initialObjectFit = 'cover' }) {
  const [objectFit, setObjectFit] = useState(initialObjectFit);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef();
  const animateRef = useRef();
  useEffect(() => {
    videoRef.current.addEventListener('play', () => setIsPlaying(true));
    videoRef.current.addEventListener('pause', () => setIsPlaying(false));
  });

  useEffect(() => {
    animateRef.current.beginElement();
  }, [isPlaying]);
  return (
    <div className="video-player">
      <video
        ref={videoRef}
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
      <div className="video-player-controls">
        <button
          className="reset"
          onClick={() => (videoRef.current.playbackRate = 0.3)}
        >
          1.0x
        </button>
        <button className="video-player-play-button">
          <svg
            width="17"
            height="17"
            viewBox="11 10 15 16"
            fill="red"
          >
            <path d={playPath}>
              <animate
                ref={animateRef}
                begin="indefinite"
                attributeType="XML"
                attributeName="d"
                fill="freeze"
                from={isPlaying ? pausePath : playPath}
                to={isPlaying ? playPath : pausePath}
                dur="0.1s"
                keySplines=".4 0 1 1"
                repeatCount="1"
              ></animate>
            </path>
          </svg>
        </button>
      </div>
    </div>
  );
}
