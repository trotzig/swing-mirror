import { openDB, deleteDB } from 'idb';
import cryptoRandomString from 'crypto-random-string';

function initDB() {
  return openDB('Videos', 1, {
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
}
let dbPromise = typeof indexedDB !== 'undefined' ? initDB() : Promise.resolve();

function prepareVideo(video) {
  video.toRecording = async () => {
    const videoBlob = await (await dbPromise).get('videoBlobs', video.blobId);
    const url = URL.createObjectURL(videoBlob.blob);
    return { ...video, url };
  };
  return video;
}

class DB extends EventTarget {
  async recreate() {
    (await dbPromise).close();
    console.log('Destroying database');
    deleteDB('Videos', {
      blocked() {
        console.error(`Can't destroy database since it is locked`);
      },
    });
    console.log('Database destroyed');
    dbPromise = initDB();
  }

  async addVideo({ url, blob, duration, photoUrl, name, isAuto }) {
    const videoId = cryptoRandomString({ length: 10 });
    const blobId = cryptoRandomString({ length: 10 });
    const dbVideo = await (
      await dbPromise
    ).add('videos', {
      id: videoId,
      date: new Date(),
      photoUrl,
      duration,
      blobId,
      name,
      isAuto,
    });
    await (
      await dbPromise
    ).add('videoBlobs', {
      id: blobId,
      blob,
    });
    this.emitChange();
    return videoId;
  }

  async updateVideoName(videoId, name) {
    const tx = (await dbPromise).transaction('videos', 'readwrite');
    const video = await tx.store.get(videoId);
    video.name = name;
    await tx.store.put(video);
    await tx.done;
    this.emitChange();
  }

  async deleteVideo(videoId) {
    const tx = (await dbPromise).transaction(['videos', 'videoBlobs'], 'readwrite');
    const vStore = tx.objectStore('videos');
    const vbStore = tx.objectStore('videoBlobs');
    const video = await vStore.get(videoId);
    await vStore.delete(videoId);
    await vbStore.delete(video.blobId);
    await tx.done;
    this.emitChange();
  }

  async listVideos() {
    const videos = await (await dbPromise).getAllFromIndex('videos', 'date');
    videos.forEach(prepareVideo);
    return videos.filter(v => v.blobId).reverse();
  }

  async getMostRecentVideo() {
    const videos = await (await dbPromise).getAllFromIndex('videos', 'date');
    if (!videos.length) {
      return;
    }
    const video = videos[videos.length - 1];
    return prepareVideo(video);
  }

  emitChange() {
    this.dispatchEvent(new Event('change'));
  }
}

const instance = new DB();
export default instance;
