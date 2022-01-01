export default function getVideoStream({ video, canvas }) {
  if (video.captureStream) {
    return video.captureStream();
  }
  if (video.mozCaptureStream) {
    return video.mozCaptureStream();
  }

  const ctx = canvas.getContext('2d');
  const width = video.videoWidth / 4;
  const height = video.videoHeight / 4;
  canvas.width = width;
  canvas.height = height;

  const processFrame = () => {
    if (!video.__active) {
      // stop stream
      return;
    }
    ctx.drawImage(video, 0, 0, width, height);
    setTimeout(processFrame, 100);
  };
  processFrame();
  return canvas.captureStream();
}
