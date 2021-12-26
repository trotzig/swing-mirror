import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { io } from 'socket.io-client';
import {
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    RTCView,
    MediaStream,
    MediaStreamTrack,
    mediaDevices,
    registerGlobals
} from 'react-native-webrtc';

export default function App() {
  const [hasWatcher, setHasWatcher] = useState(false);
  useEffect(() => {
    const socket = io('http://localhost:4000',  { jsonp: false });

    // TODO: don't broadcast this until ready
    socket.emit("broadcaster");

    socket.on("watcher", id => {
      setHasWatcher(true);
      console.log('watcher', id);
      const peerConnection = new RTCPeerConnection(config);
      peerConnections[id] = peerConnection;

      let stream = video.srcObject;
      stream.getTracks().forEach(track => {
        console.log('track', track);
        peerConnection.addTrack(track, stream);
      });

      peerConnection.onicecandidate = event => {
        console.log('onicecandidate', event);
        if (event.candidate) {
          socket.emit("candidate", id, event.candidate);
        }
      };

      peerConnection
        .createOffer()
        .then(sdp => peerConnection.setLocalDescription(sdp))
        .then(() => {
          socket.emit("offer", id, peerConnection.localDescription);
        })
        .catch((e) => console.error(e));
    });

    socket.on("answer", (id, description) => {
      console.log('answer', id, description);
      peerConnections[id].setRemoteDescription(description);
    });

    socket.on("candidate", (id, candidate) => {
      console.log('candidate', id, candidate);
      peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("disconnectPeer", id => {
      peerConnections[id].close();
      delete peerConnections[id];
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text>Hello world</Text>
      {hasWatcher ? <Text>Watcher connected</Text> : <Text>Waiting for watcher...</Text>}
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
});
