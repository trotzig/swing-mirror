export default function getObjectFitSize(
  containerWidth,
  containerHeight,
  width,
  height,
) {
  const doRatio = width / height;
  const cRatio = containerWidth / containerHeight;
  let targetWidth = 0;
  let targetHeight = 0;

  if (doRatio > cRatio) {
    targetWidth = containerWidth;
    targetHeight = targetWidth / doRatio;
  } else {
    targetHeight = containerHeight;
    targetWidth = targetHeight * doRatio;
  }

  return {
    width: targetWidth,
    height: targetHeight,
    left: (containerWidth - targetWidth) / 2,
    top: (containerHeight - targetHeight) / 2,
  };
}
