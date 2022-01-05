import React from 'react';

import Share from './icons/Share';
import fileSuffix from './fileSuffix';

export default function ShareButton({ video }) {
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
