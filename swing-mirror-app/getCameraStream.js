import { mediaDevices } from 'react-native-webrtc';

export default async function getCameraStream({
  useFrontFacingCamera = false,
} = {}) {
  const sourceInfos = await mediaDevices.enumerateDevices();
  const videoSource = sourceInfos.find(
    sourceInfo =>
      sourceInfo.kind == 'videoinput' &&
      sourceInfo.facing == (useFrontFacingCamera ? 'front' : 'environment'),
  );
  if (!videoSource) {
    throw new Error('Could not find video source');
  }
  const stream = await mediaDevices.getUserMedia({
    audio: true,
    video: {
      width: 640,
      height: 480,
      frameRate: 30,
      facingMode: useFrontFacingCamera ? 'user' : 'environment',
      deviceId: videoSource.deviceId,
    },
  });
  return stream;
}
