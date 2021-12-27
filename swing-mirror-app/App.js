import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCView,
} from 'react-native-webrtc';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
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
      {stream && (
        <RTCView
          style={styles.video}
          streamURL={stream.toURL()}
          objectFit="contain"
        />
      )}
      <SafeAreaView style={styles.inner}>
        {error && <Text style={{ color: '#fff' }}>{error.message}</Text>}
        {hasWatcher ? (
          <Text style={{ color: '#fff' }}>Watcher connected</Text>
        ) : (
          <Text style={{ color: '#fff' }}>Waiting for watcher...</Text>
        )}
      </SafeAreaView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    color: '#fff',
  },
  video: {
    backgroundColor: '#000',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
