import '../../public/styles.css';

import React from 'react';

import { Library } from '../Library';
import FlipCamera from '../icons/FlipCamera';
import Modal from '../Modal';

const config = {
  component: Modal,
};

export default config;

export const WithTitle = () => (
  <Modal
    open
    title="My Modal"
    videoWidth={window.innerWidth}
    videoHeight={window.innerHeight}
  >
    <Library />
  </Modal>
);

export const WithAction = () => (
  <Modal
    open
    title="My Modal"
    action={
      <div className="rounded-translucent">
        <button className="reset">
          <FlipCamera />
        </button>
      </div>
    }
    videoWidth={window.innerWidth}
    videoHeight={window.innerHeight}
  >
    <Library />
  </Modal>
);
