import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCView,
} from 'react-native-webrtc';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { io } from 'socket.io-client';
import React, { useEffect, useState } from 'react';

import getCameraStream from './getCameraStream';

export default function App() {
  const [hasWatcher, setHasWatcher] = useState(false);
  const [stream, setStream] = useState();
  const [error, setError] = useState();
  useEffect(() => {
    function run() {
      const peerConnections = {};
      const socket = io('http://192.168.68.117:4000', { jsonp: false });

      // TODO: don't broadcast this until ready
      socket.emit('broadcaster', { broadcastId: 'app' });

      socket.on('watcher', async id => {
        setHasWatcher(true);
        console.log('watcher', id);
        const peerConnection = new RTCPeerConnection({
          iceServers: [
            {
              urls: ['stun:stun.l.google.com:19302'],
            },
          ],
        });
        peerConnections[id] = peerConnection;

        try {
          const cameraStream = await getCameraStream();

          setStream(cameraStream);

          peerConnection.addStream(cameraStream);
          peerConnection.onicecandidate = event => {
            console.log('onicecandidate', event);
            if (event.candidate) {
              socket.emit('candidate', id, event.candidate);
            }
          };

          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          socket.emit('offer', id, peerConnection.localDescription);
        } catch (e) {
          setError(e);
        }
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
        }
      });
    }
    run();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Hello world</Text>
      {error && <Text>{error.message}</Text>}
      {stream && <RTCView style={styles.video} streamURL={stream.toURL()} />}
      {hasWatcher ? (
        <Text>Watcher connected</Text>
      ) : (
        <Text>Waiting for watcher...</Text>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    backgroundColor: '#000',
    height: 100,
    width: 200,
  },
});
