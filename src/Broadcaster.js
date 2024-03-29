import { io } from 'socket.io-client';
import EventEmitter from 'events';

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


      for (const track of stream.getTracks()) {
        peerConnection.addTrack(track, stream);
      }

      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          this.socket.emit('candidate', id, event.candidate);
        }
      };

      peerConnection
        .createOffer()
        .then(sdp => {
          console.log('SDP', sdp);
          return peerConnection.setLocalDescription(sdp);
        })
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

  sendInstruction(instruction) {
    console.log('Sending instruction', instruction);
    Object.keys(this.peerConnections).forEach(socketId =>
      this.socket.emit('instruction', socketId, instruction),
    );
  }

  close() {
    this.socket.close();
  }
}
