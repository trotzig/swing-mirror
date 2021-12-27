import { RTCView } from 'react-native-webrtc';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';

import getCameraStream from './getCameraStream';
import socket from './socket';

export default function App() {
  const [hasWatcher, setHasWatcher] = useState(false);
  const [stream, setStream] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    async function run() {
      setStream(await getCameraStream());
    }
    run();
  }, []);

  useEffect(() => {
    socket({
      stream,
      onWatcherActive: () => setHasWatcher(true),
      onWatcherDisconnect: () => setHasWatcher(false),
    });
  }, [stream]);

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
