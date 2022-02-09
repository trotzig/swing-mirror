import stefanStill from '../public/stefan_still.png';

class DB extends EventTarget {
  async listVideos() {
    return [
      {
        id: 'foo',
        date: new Date('2022-02-08 12:08:00'),
        photoUrl: stefanStill,
        duration: 5000,
        name: 'Test video',
        isAuto: false,
      },
      {
        id: 'bar',
        date: new Date('2022-02-08 12:08:00'),
        photoUrl: stefanStill,
        duration: 5000,
        name: 'Test video 2',
        isAuto: true,
      },
    ];
  }
}

const instance = new DB();
export default instance;
