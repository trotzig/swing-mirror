const MAX_YIQ_DIFFERENCE = 35215;

function rgb2y(r, g, b) {
  return r * 0.29889531 + g * 0.58662247 + b * 0.11448223;
}

function rgb2i(r, g, b) {
  return r * 0.59597799 - g * 0.2741761 - b * 0.32180189;
}

function rgb2q(r, g, b) {
  return r * 0.21147017 - g * 0.52261711 + b * 0.31114694;
}

// blend semi-transparent color with white
function blend(color, alpha) {
  return 255 + (color - 255) * alpha;
}

// calculate color difference according to the paper "Measuring perceived color
// difference using YIQ NTSC transmission color space in mobile applications" by
// Y. Kotsarenko and F. Ramos
//
// Modified from https://github.com/mapbox/pixelmatch
function colorDelta(previousPixel, currentPixel) {
  let [r1, g1, b1, a1] = previousPixel;
  let [r2, g2, b2, a2] = currentPixel;

  if (r1 === r2 && g1 === g2 && b1 === b2 && a1 === a2) {
    return 0;
  }

  if ((a2 === 0 && a1 > 0) || (a1 === 0 && a2 > 0)) {
    return 1;
  }

  if (a1 < 255) {
    a1 /= 255;
    r1 = blend(r1, a1);
    g1 = blend(g1, a1);
    b1 = blend(b1, a1);
  }

  if (a2 < 255) {
    a2 /= 255;
    r2 = blend(r2, a2);
    g2 = blend(g2, a2);
    b2 = blend(b2, a2);
  }

  const y = rgb2y(r1, g1, b1) - rgb2y(r2, g2, b2);
  const i = rgb2i(r1, g1, b1) - rgb2i(r2, g2, b2);
  const q = rgb2q(r1, g1, b1) - rgb2q(r2, g2, b2);

  return (0.5053 * y * y + 0.299 * i * i + 0.1957 * q * q) / MAX_YIQ_DIFFERENCE;
}

let gl;

self.addEventListener('message', function messageHandler(e) {
  if (e.data.canvas) {
    // we're getting our offscreen canvas
    const canvas = e.data.canvas;
    gl = canvas.getContext('2d');
  } else if (e.data.imageBitmap) {
    const { imageBitmap, ballPosition, videoWidth, videoHeight } = e.data;
    const sx = Math.round(ballPosition.x * videoWidth);
    const sy = Math.round(ballPosition.y * videoHeight);
    gl.drawImage(imageBitmap, sx, sy, 100, 100, 0, 0, 100, 100);
    const data = gl.getImageData(0, 0, 100, 100);
    processImageData(data.data);
  } else {
    const imageData = new Uint8ClampedArray(e.data);
    processImageData(imageData);
  }
});

const PIXEL_THRESHOLD = 0.1;
let initialBallPixels;
function processImageData(imageData) {
  if (!initialBallPixels) {
    initialBallPixels = new Uint8ClampedArray(imageData.length);
    for (let i = 0; i < imageData.length; i++) {
      initialBallPixels[i] = imageData[i];
    }
    return;
  }

  let totalDiff = 0.0;

  for (let i = 0; i < imageData.length; i = i + 4) {
    const before = initialBallPixels.slice(i, i + 4);
    const after = imageData.slice(i, i + 4);
    const diff = colorDelta(before, after);
    if (diff > 0.005) {
      totalDiff += diff;
    }
  }

  self.postMessage({ diff: totalDiff });
}
