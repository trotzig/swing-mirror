import React, { useState } from 'react';

import { Library } from './Library';
import Modal from './Modal';
import ShareButton from './ShareButton';
import VideoPlayer from './VideoPlayer';

export default function LibraryButton({ video }) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState();
  return (
    <div>
      <button
        className="reset"
        onClick={() => {
          setLibraryOpen(true);
        }}
      >
        <img src={video.photoUrl} className="video-still-image" />
      </button>
      <Modal
        slideUp
        open={libraryOpen}
        onClose={() => {
          setLibraryOpen(false);
        }}
      >
        <Library onSelectedVideo={setSelectedVideo} />
      </Modal>
      <Modal
        open={selectedVideo}
        onClose={() => setSelectedVideo(undefined)}
        actions={[<ShareButton key="share" video={selectedVideo} />]}
      >
        <VideoPlayer video={selectedVideo} onVideoChange={setSelectedVideo} />
      </Modal>
    </div>
  );
}
