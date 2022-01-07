import React, { useEffect, useRef, useState } from 'react';

import db from './db';

export default function VideoInfo({ video }) {
  const [value, setValue] = useState(video.name);

  return (
    <div className="video-info">
      <input
        type="text"
        spellCheck="false"
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={e => e.target.select()}
        onKeyDown={e => {
          if (e.which === 13) {
            e.target.blur();
          }
        }}
        onBlur={async () => {
          await db.updateVideoName(video.id, value);
        }}
      />
    </div>
  );
}
