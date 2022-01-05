import { openDB } from 'idb';
import cryptoRandomString from 'crypto-random-string';

class DB {
  async init() {
    console.log('Initializing database');
    this.db = await openDB('Videos', 1, {
      upgrade(db) {
        const store = db.createObjectStore('videos', {
          keyPath: 'id',
        });
        store.createIndex('date', 'date');

        db.createObjectStore('videoBlobs', {
          keyPath: 'id',
        });
      },
    });
    console.log('Database Initialized');
  }

  async addVideo({ url, blob, duration, photoUrl }) {
    const videoId = cryptoRandomString({ length: 10 });
    const blobId = cryptoRandomString({ length: 10 });
    const dbVideo = await this.db.add('videos', {
      id: videoId,
      date: new Date(),
      photoUrl,
      duration,
      blobId,
    });
    await this.db.add('videoBlobs', {
      id: blobId,
      blob,
    });
    return videoId;
  }

  async listVideos() {
    const videos = await this.db.getAllFromIndex('videos', 'date');
    videos.forEach(v => this.__prepareVideo(v));
    return videos.filter(v => v.blobId);
  }

  async getMostRecentVideo() {
    const videos = await this.db.getAllFromIndex('videos', 'date');
    const video = videos[videos.length - 1];
    return this.__prepareVideo(video);
  }

  __prepareVideo(video) {
    video.toRecording = async () => {
      const videoBlob = await this.db.get('videoBlobs', video.blobId);
      const url = URL.createObjectURL(videoBlob.blob);
      return { ...video, url };
    };
    return video;
  }
}

const instance = new DB();
window.__db = instance;
export default instance;
