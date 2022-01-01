import EventEmitter from 'events';

import { io } from 'socket.io-client';

export default class Broadcaster extends EventEmitter {
  constructor({ broadcastId }) {
    super();
    this.broadcastId = broadcastId;
    this.peerConnections = {};
    this.socket = io.connect(window.location.origin);
  }

  init(stream) {
    this.stream = stream;
    this.socket.emit('broadcaster', { broadcastId: this.broadcastId });
    this.socket.on('watcher', id => {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          {
            urls: ['stun:stun.l.google.com:19302'],
          },
        ],
      });
      this.peerConnections[id] = peerConnection;

      peerConnection.addTrack(stream.getVideoTracks()[0], stream);

      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          this.socket.emit('candidate', id, event.candidate);
        }
      };

      const channel = peerConnection.createDataChannel('file-transfer');
      channel.binaryType = 'arraybuffer';

      channel.onopen = () => {
        console.log('file channel open');
      };
      channel.addEventListener('error', event => console.error(event));
      peerConnection.__dataChannel = channel;

      peerConnection
        .createOffer()
        .then(sdp => peerConnection.setLocalDescription(sdp))
        .then(() => {
          this.socket.emit('offer', id, peerConnection.localDescription);
        })
        .catch(e => console.error(e));
    });

    this.socket.on('answer', (id, description) => {
      this.peerConnections[id].setRemoteDescription(description);
    });

    this.socket.on('instruction', (id, instruction) => {
      this.emit('instruction', instruction);
    });

    this.socket.on('candidate', (id, candidate) => {
      this.peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
    });

    this.socket.on('disconnectPeer', id => {
      const peerConnection = this.peerConnections[id];
      if (peerConnection) {
        peerConnection.close();
        delete this.peerConnections[id];
      }
    });

    window.onunload = window.onbeforeunload = () => {
      this.socket.close();
    };
  }

  overrideStream(stream) {
    Object.keys(this.peerConnections).forEach(socketId => {
      const peerConnection = this.peerConnections[socketId];
      peerConnection.getSenders()[0].replaceTrack(stream.getVideoTracks()[0]);
    });
  }

  resetStream() {
    this.overrideStream(this.stream);
  }

  sendVideoFile(buffer) {
    const bytesPerChunk = 1000;
    Object.keys(this.peerConnections).forEach(socketId => {
      const peerConnection = this.peerConnections[socketId];
      const channel = peerConnection.__dataChannel;
      console.log('sending buffer');

      let offset = 0;
      const sendSlice = () => {
        if (offset >= buffer.byteLength) {
          return;
        }
        channel.addEventListener(
          'message',
          event => {
            if (event.data === 'chunk received') {
              sendSlice();
            }
          },
          { once: true },
        );
        const slice = buffer.slice(offset, offset + bytesPerChunk);
        channel.send(slice);
        offset += bytesPerChunk;
      };
      sendSlice();
    });
  }

  sendInstruction(instruction) {
    Object.keys(this.peerConnections).forEach(socketId =>
      this.socket.emit('instruction', socketId, instruction),
    );
  }

  close() {
    this.socket.close();
  }
}
