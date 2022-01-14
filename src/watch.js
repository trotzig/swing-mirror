import { io } from 'socket.io-client';

import createHash from './createHash';

function isSameRapidInstruction(lastInstructionReceived, instruction) {
  if (!lastInstructionReceived) {
    return false;
  }
  if (
    !JSON.stringify(Object.keys(lastInstructionReceived.instruction)) ===
    JSON.stringify(Object.keys(instruction))
  ) {
    // not the same instruction
    return false;
  }

  if (Date.now() - lastInstructionReceived.timestamp > 200) {
    return false;
  }
  return true;
}

export default function watch({
  broadcastId,
  onInstruction,
  onRecording,
  onStream,
}) {
  let broadcastSocketId;
  let peerConnection;
  let receiveBuffer = [];
  let receivedBytes = 0;
  let lastInstructionReceived;
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
    lastInstructionReceived = { instruction, timestamp: Date.now() };
    onInstruction(instruction);
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
      if (isSameRapidInstruction(lastInstructionReceived, instruction)) {
        console.log(
          'Skipping instruction since it was just the one we received',
          instruction,
        );
        return;
      }
      socket.emit('instruction', broadcastSocketId, instruction);
    },
  };
}
