import { io } from 'socket.io-client';

import createHash from './createHash';

export default function watch({
  broadcastId,
  videoRef,
  onInstruction,
  onRecording,
  onStreamActive,
}) {
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
        let newSdp = sdp.sdp.split('\r\n');
        console.log(newSdp);
        newSdp = newSdp.filter(
          line => !/urn:3gpp:video-orientation/.test(line),
        );
        sdp.sdp = newSdp.join('\r\n');
        return peerConnection.setLocalDescription(sdp);
      })
      .then(() => {
        socket.emit('answer', id, peerConnection.localDescription);
      });
    peerConnection.ontrack = event => {
      videoRef.current.srcObject = event.streams[0];
      onStreamActive();
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
