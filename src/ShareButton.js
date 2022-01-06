import React, { useEffect, useState } from 'react';

import Download from './icons/Download';
import Share from './icons/Share';
import fileSuffix from './fileSuffix';

export default function ShareButton({ video }) {
  const [type, setType] = useState('download');
  useEffect(() => {
    const isShare = navigator && typeof navigator.canShare === 'function';
    setType(isShare ? 'share' : 'downlad');
  }, [video]);

  if (!video) {
    return null;
  }

  if (type === 'share') {
    return (
      <button
        className="reset"
        disabled={!video}
        onClick={async () => {
          const res = await fetch(video.url);
          const blob = await res.blob();
          const file = new File([blob], `video.${fileSuffix(blob.type)}`, {
            type: blob.type,
          });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'Swing Mirror video',
              files: [file],
            });
          }
        }}
      >
        <Share />
      </button>
    );
  }

  return (
    <div className="rounded-translucent">
      <a
        className="reset"
        style={{ lineHeight: 0 }}
        key="download"
        href={video.url}
        download={video.name || 'swing.webm'}
      >
        <Download />
      </a>
    </div>
  );
}
