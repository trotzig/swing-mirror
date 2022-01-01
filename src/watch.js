import { io } from 'socket.io-client';

import createHash from './createHash';

export default function watch({
  broadcastId,
  videoRef,
  onInstruction,
  onRecording,
}) {
  let broadcastSocketId;
  let peerConnection;
  let receiveBuffer = [];
  let receivedBytes = 0;
  let pendingRecording = undefined;
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
    peerConnection.ondatachannel = dataEvent => {
      dataEvent.channel.onmessage = event => {
        receiveBuffer.push(event.data);
        receivedBytes = receivedBytes + event.data.byteLength;

        console.log(
          'received',
          receivedBytes,
          'of',
          pendingRecording.bufferLength,
          'for',
          pendingRecording.hash,
        );
        if (receivedBytes === pendingRecording.bufferLength) {
          // we're done
          console.log('all chunks received');
          const hash = createHash(receiveBuffer);
          const blob = new Blob(receiveBuffer);
          const url = URL.createObjectURL(blob);
          onRecording({ url, hash });
          receivedBytes = 0;
          receiveBuffer = [];
          pendingRecording = null;
        } else {
          dataEvent.channel.send('chunk received');
        }
      };
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
    if (instruction.addRecording) {
      pendingRecording = instruction.addRecording;
      console.log('Setting pendingrecording', pendingRecording);
    }
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
