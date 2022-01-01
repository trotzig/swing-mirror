export default class VideoRecorder {
  constructor({ video, canvas }) {
    this.video = video;
    this.canvas = canvas;
    console.log(this);
  }

  start() {
    this.recordedChunks = [];
    const availableMimeTypes = [
      'video/mp4;codecs:h264',
      'video/webm;codecs=vp9',
    ];
    this.mimeType =
      availableMimeTypes.find(type => MediaRecorder.isTypeSupported(type)) ||
      availableMimeTypes[0];

    this.mediaRecorder = new MediaRecorder(this.video.srcObject, {
      mimeType: this.mimeType,
    });
    this.mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
    this.photoUrl = this.takeStillPhoto();
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
        const blob = new Blob(this.recordedChunks, {
          type: this.mimeType,
        });
        const url = URL.createObjectURL(blob);
        const name = `recording.${this.mimeType.slice(
          this.mimeType.indexOf('/') + 1,
          this.mimeType.indexOf(';'),
        )}`;
        const recording = { url, name, photoUrl: this.photoUrl };
        resolve(recording);
      };
      this.mediaRecorder.stop();
    });
  }
}
