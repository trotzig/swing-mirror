import React, { useEffect, useState } from 'react';

import db from './db';

export function Library({ onSelectedVideo }) {
  const [videos, setVideos] = useState();
  useEffect(() => {
    async function run() {
      setVideos(await db.listVideos());
    }
    run();
  }, []);
  return (
    <div className="page-wrapper">
      <div className="library">
        <h2>Library</h2>
        {videos ? (
          <ul>
            {videos.map(video => (
              <li key={video.id}>
                <button
                  className="reset"
                  onClick={async () => {
                    onSelectedVideo(await video.toRecording());
                  }}
                >
                  <img src={video.photoUrl} />
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
