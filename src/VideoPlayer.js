import React, { useEffect, useRef, useState } from 'react';

import DrawingBoard from './DrawingBoard';
import SkipAhead from './icons/SkipAhead';
import VolumeOff from './icons/VolumeOff';
import VolumeUp from './icons/VolumeUp';

const pausePath = 'M13,10 L18,13 18,23 13,26 M18,13 L26,18 26,18 18,23';
const playPath = 'M10,10 L16,10 16,26 10,26 M20,10 L26,10 26,26 20,26';

const playbackRates = [
  { label: 'x1.0', value: 1 },
  { label: 'x0.7', value: 0.7 },
  { label: 'x0.5', value: 0.5 },
  { label: 'x0.2', value: 0.2 },
  { label: 'x0.1', value: 0.1 },
];

function rangeTouchEndListener(e) {
  if (!/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    // only run on iOS
  }
  const el = e.target;
  const rect = el.getBoundingClientRect();
  const touch = e.changedTouches[0];
  const left = touch.pageX - rect.left;
  const relativeLeft = left / rect.width;
  const max = parseFloat(el.getAttribute('max'), 10);
  const value = Math.max(Math.min(relativeLeft * max, max), 0);
  el.value = value;
  el.parentElement.parentElement.parentElement.querySelector(
    'video',
  ).currentTime = value;
}

function step(dir, video, playbackRate) {
  if (!video.paused) {
    video.pause();
    return;
  }
  // const move = playbackRate.value / 2;
  const move = 0.1;
  video.currentTime = video.currentTime + dir * move;
}

export default function VideoPlayer({
  video,
  onVideoChange = () => {},
  playbackRate: propPlaybackRate = 1,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackRateIncr, setPlaybackRateIncr] = useState(0);
  const [videoDimensions, setVideoDimensions] = useState();
  const videoRef = useRef();
  const seekRef = useRef();
  const animateRef = useRef();
  const playbackRate = playbackRates[playbackRateIncr % playbackRates.length];

  useEffect(() => {
    const videoEl = videoRef.current;
    const playListener = () => setIsPlaying(true);
    videoEl.addEventListener('play', playListener);
    const pauseListener = () => setIsPlaying(false);
    videoEl.addEventListener('pause', pauseListener);
    const timeListener = () => {
      seekRef.current.value = videoEl.currentTime;
    };
    videoEl.addEventListener('timeupdate', timeListener);
    const metaListener = () =>
      setVideoDimensions({
        width: videoEl.videoWidth,
        height: videoEl.videoHeight,
      });
    videoEl.addEventListener('loadedmetadata', metaListener);
    if (video) {
      videoEl.src = video.url;
    }
    return () => {
      videoEl.removeEventListener('play', playListener);
      videoEl.removeEventListener('pause', pauseListener);
      videoEl.removeEventListener('timeupdate', timeListener);
      videoEl.removeEventListener('loadedmetadata', metaListener);
      videoEl.pause();
    };
  }, [video]);

  useEffect(() => {
    animateRef.current.beginElement();
  }, [isPlaying]);

  useEffect(() => {
    const rate = playbackRates[playbackRateIncr % playbackRates.length];
    console.log('Setting video playback rate', rate.value, playbackRateIncr);
    videoRef.current.playbackRate = rate.value;
  }, [playbackRateIncr]);

  useEffect(() => {
    console.log(propPlaybackRate);
    const i = playbackRates.findIndex(r => r.value === propPlaybackRate);
    console.log('Setting playback rate incr', i);
    setPlaybackRateIncr(i);
  }, [propPlaybackRate]);


  return (
    <div className="video-player">
      <video
        ref={videoRef}
        onClick={e => e.target.pause()}
        playsInline
        muted={isMuted}
        loop
        autoPlay
      ></video>
      {videoDimensions && <DrawingBoard {...videoDimensions} />}
      <div className="video-player-controls">
        <div className="video-player-seek">
          <button
            className="video-player-step-back reset"
            style={{ transform: 'rotate(180deg)' }}
            onClick={() => step(-1, videoRef.current, playbackRate)}
          >
            <SkipAhead size={40} fill="rgba(255,255,255,0.15" />
          </button>

          <input
            ref={seekRef}
            type="range"
            min="0"
            step="any"
            max={video && video.duration}
            onChange={e => (videoRef.current.currentTime = e.target.value)}
            onMouseDown={() => videoRef.current.pause()}
            onTouchEnd={rangeTouchEndListener}
          />
          <button
            className="video-player-step-forward reset"
            onClick={() => step(1, videoRef.current, playbackRate)}
          >
            <SkipAhead size={40} fill="rgba(255,255,255,0.15" />
          </button>
        </div>
        <div className="video-player-controls-bottom">
          <div className="rounded-translucent">
            <button
              className="reset-text"
              onClick={() => setPlaybackRateIncr(old => old + 1)}
            >
              {playbackRate.label}
            </button>
          </div>
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
          <div className="rounded-translucent volume-button">
            <button className="reset" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeOff /> : <VolumeUp />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
