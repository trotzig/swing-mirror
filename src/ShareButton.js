import React from 'react';

export default function ShareButton({ video }) {
  return (
    <button
      disabled={!video}
      onClick={async () => {
        const res = await fetch(video.url);
        const blob = await res.blob();
        const file = new File([blob], 'video', { type: blob.type });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Swing Mirror video',
            text: '',
            url: 'https://swingmirror.io',
            files: [file],
          });
        }
      }}
    >
      Save to device
    </button>
  );
}
