import { io } from 'socket.io-client';

import createHash from './createHash';

export default function watch({
  broadcastId,
  onInstruction,
  onRecording,
  onStream,
}) {
  let ourInstructionId = 1;
  let lastInstructionIdReceived = -1;
  let broadcastSocketId;
  let peerConnection;
  let receiveBuffer = [];
  let receivedBytes = 0;
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
      .then(sdp => {
        return peerConnection.setLocalDescription(sdp);
      })
      .then(() => {
        socket.emit('answer', id, peerConnection.localDescription);
      });
    peerConnection.ontrack = event => {
      onStream(event.streams[0]);
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
    if (lastInstructionIdReceived < instruction.id) {
      onInstruction(instruction);
    } else {
      console.warn('Ignoring instruction that came out-of-order');
    }
    lastInstructionIdReceived = instruction.id;
  });

  socket.on('broadcaster', () => {
    socket.emit('watcher', { broadcastId });
  });

  function closeSocket() {
    if (socket) {
      socket.close();
    }
    if (peerConnection) {
      peerConnection.close();
    }
  }

  window.onunload = window.onbeforeunload = closeSocket;
  return {
    closeSocket,
    sendInstruction: instruction => {
      instruction.id = ourInstructionId;
      socket.emit('instruction', broadcastSocketId, instruction);
      ourInstructionId++;
    },
  };
}
