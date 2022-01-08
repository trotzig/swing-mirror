import React, { useState } from 'react';

import { Library } from './Library';
import Modal from './Modal';
import ShareButton from './ShareButton';
import VideoInfo from './VideoInfo';
import VideoPlayer from './VideoPlayer';

export default function LibraryButton({ video }) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryEdit, setLibraryEdit] = useState(false);
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
        title="Library"
        onClose={() => {
          setLibraryOpen(false);
        }}
        action={
          <button
            className="reset-text"
            style={{ paddingRight: 10 }}
            onClick={() => setLibraryEdit(!libraryEdit)}
          >
            {libraryEdit ? 'Done' : 'Edit'}
          </button>
        }
      >
        <Library onSelectedVideo={setSelectedVideo} edit={libraryEdit} />
      </Modal>
      <Modal
        open={selectedVideo}
        onClose={() => setSelectedVideo(undefined)}
        title={selectedVideo && <VideoInfo video={selectedVideo} />}
        action={<ShareButton video={selectedVideo} />}
      >
        <VideoPlayer video={selectedVideo} onVideoChange={setSelectedVideo} />
      </Modal>
    </div>
  );
}
