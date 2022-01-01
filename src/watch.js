import { io } from 'socket.io-client';

export default function watch({ broadcastId, videoRef, onInstruction }) {
  let broadcastSocketId;
  let peerConnection;
  const config = {
    iceServers: [
      {
        urls: ['stun:stun.l.google.com:19302'],
      },
    ],
  };

  const socket = io.connect(window.location.origin);

  socket.on('offer', (id, description) => {
    broadcastSocketId = id;
    peerConnection = new RTCPeerConnection(config);
    peerConnection
      .setRemoteDescription(description)
      .then(() => peerConnection.createAnswer())
      .then(sdp => peerConnection.setLocalDescription(sdp))
      .then(() => {
        socket.emit('answer', id, peerConnection.localDescription);
      });
    peerConnection.ontrack = event => {
      videoRef.current.srcObject = event.streams[0];
    };
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        socket.emit('candidate', id, event.candidate);
      }
    };
  });

  socket.on('candidate', (id, candidate) => {
    peerConnection
      .addIceCandidate(new RTCIceCandidate(candidate))
      .catch(e => console.error(e));
  });

  socket.on('connect', () => {
    socket.emit('watcher', { broadcastId });
  });

  socket.on('instruction', (id, instruction) => {
    onInstruction(instruction);
  });

  socket.on('broadcaster', () => {
    socket.emit('watcher', { broadcastId });
  });

  function closeSocket() {
    socket.close();
    peerConnection.close();
  }

  window.onunload = window.onbeforeunload = closeSocket;
  return {
    closeSocket,
    sendInstruction: instruction =>
      socket.emit('instruction', broadcastSocketId, instruction),
  };
}