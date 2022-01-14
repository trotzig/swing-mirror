import db from './db';
import fileSuffix from './fileSuffix';

export default class VideoRecorder {
  constructor({ stream, video, canvas, isAuto, keep = true }) {
    this.stream = stream;
    this.video = video;
    this.canvas = canvas;
    this.isAuto = isAuto;
    this.keep = keep;
  }

  start() {
    this.recordedChunks = [];
    const availableMimeTypes = [
      'video/mp4;codecs:h264',
      'video/webm;codecs=vp9',
      'video/webm;codecs="vp8,opus"',
    ];
    this.mimeType =
      availableMimeTypes.find(type => MediaRecorder.isTypeSupported(type)) ||
      availableMimeTypes[0];

    this.mediaRecorder = new MediaRecorder(
      this.stream || this.video.srcObject,
      {
        mimeType: this.mimeType,
      },
    );
    this.mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
    this.photoUrl = this.takeStillPhoto();
    this.startTime = Date.now();
    this.mediaRecorder.start();
  }

  takeStillPhoto() {
    this.canvas.width = this.video.videoWidth / 5;
    this.canvas.height = this.video.videoHeight / 5;
    const context = this.canvas.getContext('2d');
    context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    return this.canvas.toDataURL('image/jpg');
  }

  stop() {
    return new Promise(resolve => {
      this.mediaRecorder.onstop = () => {
        if (!this.keep) {
          return;
        }

        const endTime = Date.now();
        const duration = (endTime - this.startTime) / 1000;
        if (duration < 1) {
          console.log('Discarding video since it was shorter than 1s');
          return;
        }

        if (this.isAuto) {
          console.log('Saving auto recording since keep=true');
        }
        const blob = new Blob(this.recordedChunks, {
          type: this.mimeType,
        });
        const url = URL.createObjectURL(blob);
        const fileName = `swing.${fileSuffix(this.mimeType)}`;
        const recording = {
          url,
          name: 'Untitled video',
          fileName,
          photoUrl: this.photoUrl,
          duration,
          isAuto: this.isAuto,
        };
        db.addVideo({ ...recording, blob }).catch(console.error);
        resolve(recording);
      };
      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
      }
    });
  }
}
