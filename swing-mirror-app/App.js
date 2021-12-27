import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Fontisto } from '@expo/vector-icons';

import getCameraStream from './getCameraStream';
import socket from './socket';

function generateRandomString(length = 5) {
  const result = [];
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const len = characters.length;
  for (let i = 0; i < length; i++) {
    result.push(characters.charAt(Math.floor(Math.random() * len)));
  }
  return result.join('');
}

async function getOrCreateBroadcastId() {
  let id = await AsyncStorage.getItem('broadcast-id');
  if (id === null) {
    id = generateRandomString();
    await AsyncStorage.setItem('broadcast-id', generateRandomString());
  }
  return id;
}

export default function App() {
  const [hasWatcher, setHasWatcher] = useState(false);
  const [stream, setStream] = useState();
  const [error, setError] = useState();
  const [broadcastId, setBroadcastId] = useState();
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    async function run() {
      setBroadcastId(await getOrCreateBroadcastId());
      setStream(await getCameraStream());
    }
    run();
  }, []);

  useEffect(() => {
    socket({
      broadcastId,
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
          <Text style={{ color: '#fff' }}>Watcher {broadcastId} connected</Text>
        ) : (
          <Text style={{ color: '#fff' }}>code: {broadcastId}</Text>
        )}
      </SafeAreaView>
      {stream && (
        <View style={styles.controls}>
          {isRecording ? (
            <Pressable
              onPress={() => {
                setIsRecording(false);
              }}
            >
              <Fontisto name="stop" size={48} color="red" />
            </Pressable>
          ) : (
            <Pressable onPress={() => setIsRecording(true)}>
              <Fontisto name="record" size={48} color="red" />
            </Pressable>
          )}
        </View>
      )}
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
  controls: {
    position: 'absolute',
    left: 0,
    bottom: 100,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
});
