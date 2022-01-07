import React, { useEffect, useState } from 'react';

import db from './db';

export function Library({ onSelectedVideo }) {
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
                  className="reset"
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
