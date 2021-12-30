import { io } from 'socket.io-client';

export default function broadcast({ broadcastId, videoRef, onInstruction }) {
  const peerConnections = {};
  const config = {
    iceServers: [
      {
        urls: ['stun:stun.l.google.com:19302'],
      },
    ],
  };

  const socket = io.connect(window.location.origin);

  // Media contrains
  const constraints = {
    video: { facingMode: 'environment' },
    // Uncomment to enable audio
    // audio: true,
  };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
      videoRef.current.srcObject = stream;
      socket.emit('broadcaster', { broadcastId });
    })
    .catch(error => console.error(error));

  socket.on('watcher', id => {
    const peerConnection = new RTCPeerConnection(config);
    peerConnections[id] = peerConnection;

    const stream = videoRef.current.srcObject;
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

  socket.on('instruction', (id, instruction) => {
    onInstruction(instruction);
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
  return {
    closeSocket: () => socket.close(),
    sendInstruction: instruction =>
      Object.keys(peerConnections).forEach(socketId =>
        socket.emit('instruction', socketId, instruction),
      ),
  };
}
