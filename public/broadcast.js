const peerConnections = {};
const config = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302'],
    },
  ],
};

const socket = io.connect(window.location.origin);
const video = document.querySelector('video');

// Media contrains
const constraints = {
  video: { facingMode: 'environment' },
  // Uncomment to enable audio
  // audio: true,
};

navigator.mediaDevices
  .getUserMedia(constraints)
  .then(stream => {
    video.srcObject = stream;
    socket.emit('broadcaster', { broadcastId: window.broadcastId });
  })
  .catch(error => console.error(error));

socket.on('watcher', id => {
  const peerConnection = new RTCPeerConnection(config);
  peerConnections[id] = peerConnection;

  const stream = video.srcObject;
  stream.getTracks().forEach(track => {
    peerConnection.addTrack(track, stream);
  });

  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit('candidate', id, event.candidate);
    }
  };

  peerConnection
    .createOffer()
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit('offer', id, peerConnection.localDescription);
    })
    .catch(e => console.error(e));
});

socket.on('answer', (id, description) => {
  peerConnections[id].setRemoteDescription(description);
});

socket.on('candidate', (id, candidate) => {
  peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on('disconnectPeer', id => {
  const peerConnection = peerConnections[id];
  if (peerConnection) {
    peerConnection.close();
    delete peerConnections[id];
  }
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
};

let mediaRecorder;
let recordedChunks;

document.body.querySelector('#record').addEventListener('click', () => {
  recordedChunks = [];
  const availableMimeTypes = ['video/mp4;codecs=h264', 'video/webm;codecs=vp9'];
  const mimeType =
    availableMimeTypes.find(type => MediaRecorder.isTypeSupported(type)) ||
    availableMimeTypes[0];
  mediaRecorder = new MediaRecorder(video.srcObject, {
    mimeType,
  });
  mediaRecorder.ondataavailable = event => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };
  mediaRecorder.onstop = event => {
    const blob = new Blob(recordedChunks, {
      type: mimeType,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style = 'display: block';
    a.href = url;
    a.download = `recording.${mimeType.slice(
      mimeType.indexOf('/') + 1,
      mimeType.indexOf(';'),
    )}`;
    a.innerHTML = a.download;
    //a.onclick = () => video.src = url;
    document.querySelector('.broadcast-recordings').appendChild(a);
  };
  mediaRecorder.start();
});

document.body.querySelector('#stop').addEventListener('click', () => {
  mediaRecorder.stop();
});
