import getObjectFitSize from './getObjectFitSize';

export default function getMousePos(evt) {
  const canvas = evt.target;
  const cRect = canvas.getBoundingClientRect();
  const rect = getObjectFitSize(
    cRect.width,
    cRect.height,
    canvas.width,
    canvas.height,
  );
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY,
  };
}
