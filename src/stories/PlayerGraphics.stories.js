import '../../public/styles.css';

import React from 'react';

import PlayerGraphics from '../PlayerGraphics';

const config = {
  component: PlayerGraphics,
};

export default config;

export const Default = () => (
  <PlayerGraphics
    active
    videoWidth={window.innerWidth}
    videoHeight={window.innerHeight}
  />
);
