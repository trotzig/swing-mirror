const queue = [];
let keepItemCount = 0;

self.addEventListener('message', e => {
  if (e.data.delaySeconds) {
    keepItemCount = 30 * e.data.delaySeconds;
    return;
  }
  const data = new Uint8ClampedArray(e.data);

  queue.push(data);
  if (queue.length > keepItemCount) {
    const toSend = queue.shift();
    self.postMessage(toSend.buffer, [toSend.buffer]);
  } else {
    self.postMessage('empty');
  }
});
