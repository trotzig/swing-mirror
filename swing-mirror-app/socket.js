import { RTCPeerConnection, RTCIceCandidate } from 'react-native-webrtc';
import { io } from 'socket.io-client';

export default async function({
  stream,
  onWatcherActive = () => {},
  onWatcherDisconnect = () => {},
}) {
  const peerConnections = {};
  const socket = io('http://192.168.68.117:4000', { jsonp: false });

  socket.emit('broadcaster', { broadcastId: 'app' });

  socket.on('watcher', async id => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: ['stun:stun.l.google.com:19302'],
        },
      ],
    });
    peerConnections[id] = peerConnection;
    peerConnection.addStream(stream);
    peerConnection.onicecandidate = event => {
      console.log('onicecandidate', event);
      if (event.candidate) {
        socket.emit('candidate', id, event.candidate);
      }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', id, peerConnection.localDescription);
    onWatcherActive();
  });

  socket.on('answer', (id, description) => {
    console.log('answer', id, description);
    peerConnections[id].setRemoteDescription(description);
  });

  socket.on('candidate', (id, candidate) => {
    console.log('candidate', id, candidate);
    peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
  });

  socket.on('disconnectPeer', id => {
    const peerConnection = peerConnections[id];
    if (peerConnection) {
      peerConnections[id].close();
      delete peerConnections[id];
      onWatcherDisconnect();
    }
  });
}
