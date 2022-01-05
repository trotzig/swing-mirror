import React from 'react';

export default function ShareButton({ video }) {
  return (
    <button
      disabled={!video}
      onClick={async () => {
        const res = await fetch(video.url);
        const blob = await res.blob();
        if (navigator.canShare && navigator.canShare({ files: [blob] })) {
          await navigator.share({
            title: 'Swing Mirror video',
            text: '',
            url: 'https://swingmirror.io',
            files: [blob],
          });
        }
      }}
    >
      Save to device
    </button>
  );
}
