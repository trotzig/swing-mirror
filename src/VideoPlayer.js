import React, { useEffect, useRef, useState } from 'react';

const pausePath = 'M13,10 L18,13 18,23 13,26 M18,13 L26,18 26,18 18,23';
const playPath = 'M10,10 L16,10 16,26 10,26 M20,10 L26,10 26,26 20,26';

const playbackRates = [
  { label: 'x1.0', value: 1 },
  { label: 'x0.7', value: 0.7 },
  { label: 'x0.5', value: 0.5 },
  { label: 'x0.2', value: 0.2 },
  { label: 'x0.1', value: 0.1 },
];

export default function VideoPlayer({ video, initialObjectFit = 'cover' }) {
  const [objectFit, setObjectFit] = useState(initialObjectFit);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playbackRateIncr, setPlaybackRateIncr] = useState(0);
  const videoRef = useRef();
  const seekRef = useRef();
  const animateRef = useRef();
  const playbackRate = playbackRates[playbackRateIncr % playbackRates.length];

  useEffect(() => {
    const videoEl = videoRef.current;
    const playListener = () => setIsPlaying(true);
    setDuration(videoEl.duration || 10);
    videoEl.addEventListener('play', playListener);
    const metaListener = () => {
      setDuration(videoEl.duration);
    };
    videoEl.addEventListener('playing', metaListener);
    const pauseListener = () => setIsPlaying(false);
    videoEl.addEventListener('pause', pauseListener);
    const timeListener = () => {
      seekRef.current.value = videoEl.currentTime;
    };
    videoEl.addEventListener('timeupdate', timeListener);
    if (video) {
      videoEl.src = video.url;
    }
    setPlaybackRateIncr(0);
    return () => {
      videoEl.removeEventListener('play', playListener);
      videoEl.removeEventListener('pause', pauseListener);
      videoEl.removeEventListener('loadedmetadata', metaListener);
      videoEl.removeEventListener('timeupdate', timeListener);
      videoEl.pause();
    };
  }, [video]);

  useEffect(() => {
    animateRef.current.beginElement();
  }, [isPlaying]);

  useEffect(() => {
    const rate = playbackRates[playbackRateIncr % playbackRates.length];
    videoRef.current.playbackRate = rate.value;
  }, [playbackRateIncr]);

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        loop
        style={{ objectFit }}
        onDoubleClick={() => {
          setObjectFit(objectFit === 'contain' ? 'cover' : 'contain');
        }}
      ></video>
      <div className="video-player-controls">
        <input
          ref={seekRef}
          type="range"
          min="0"
          step="any"
          max={duration}
          onChange={e => (videoRef.current.currentTime = e.target.value)}
          onMouseDown={() => videoRef.current.pause()}
        />
        <div className="video-player-controls-bottom">
          <button
            className="video-player-playback-rate"
            onClick={() => setPlaybackRateIncr(old => old + 1)}
          >
            {playbackRate.label}
          </button>
          <button
            className="video-player-play-button"
            onClick={() =>
              isPlaying ? videoRef.current.pause() : videoRef.current.play()
            }
          >
            <svg width="17" height="17" viewBox="11 10 15 16" fill="red">
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
    </div>
  );
}
