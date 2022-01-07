import React, { useEffect, useRef, useState } from 'react';

import db from './db';

export default function VideoInfo({ video }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(video.name);
  const inputRef = useRef();

  useEffect(() => {
    if (!isEditing) {
      return;
    }
    inputRef.current.focus();
    inputRef.current.select();
  }, [isEditing]);

  return (
    <div className="video-info">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => {
            if (e.which === 13) {
              e.target.blur();
            }
          }}
          onBlur={async () => {
            setIsEditing(false);
            await db.updateVideoName(video.id, value);
          }}
        />
      ) : (
        <button className="reset" onClick={() => setIsEditing(true)}>
          {value || 'Unnamed video'}
        </button>
      )}
    </div>
  );
}
