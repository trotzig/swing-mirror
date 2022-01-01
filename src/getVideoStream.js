export default function getVideoStream({ video, canvas }) {
  if (video.captureStream) {
    return video.captureStream();
  }
  if (video.mozCaptureStream) {
    return video.mozCaptureStream();
  }

  const ctx = canvas.getContext('2d');
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;
  const processFrame = () => {
    if (!video.src) {
      // stop stream
      return;
    }
    ctx.drawImage(video, 0, 0, width, height);
    requestAnimationFrame(() => {
      processFrame();
    });
  };
  processFrame();
  return canvas.captureStream();
}
