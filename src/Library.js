import React, { useEffect, useState } from 'react';

import db from './db';

export function Library({ onSelectedVideo, edit }) {
  const [videos, setVideos] = useState();
  useEffect(() => {
    async function run() {
      setVideos(await db.listVideos());
    }
    run();
    db.addEventListener('change', run);

    return () => db.removeEventListener('change', run);
  }, []);

  return (
    <div className="page-wrapper">
      <div className="library">
        {videos ? (
          <ul>
            {videos.map(video => (
              <li key={video.id} className="library-item">
                <button
                  className="library-item-main reset"
                  onClick={async () => {
                    onSelectedVideo(await video.toRecording());
                  }}
                >
                  <img src={video.photoUrl} />
                  <div>
                    <h4>{video.name}</h4>
                    <p>{new Date(video.date).toLocaleString()}</p>
                  </div>
                </button>
                <button
                  className="library-delete-button reset"
                  style={{ opacity: edit ? 1 : 0 }}
                  onClick={() => {
                    db.deleteVideo(video.id);
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No videos in library</p>
        )}
      </div>
    </div>
  );
}
