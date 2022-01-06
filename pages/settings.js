import React from 'react';

import db from '../src/db';

export default function SettingsPage() {
  return (
    <div className="page-wrapper">
      <h1>Swing Mirror Settings</h1>
      <h2>Storage</h2>
      <button
        onClick={async () => {
          if (!window.confirm('This will delete all videos. Continue?')) {
            return;
          }
          await db.recreate();
          window.alert('Database has been recreated');
        }}
      >
        Recreate storage
      </button>
    </div>
  );
}
