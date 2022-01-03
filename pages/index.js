import React, { useState } from 'react';

import Modal from '../src/Modal';
import Monitor from '../src/icons/Monitor';
import StartBox from '../src/StartBox';
import SwingAppsIconSvg from '../src/icons/SwingAppsIconSvg';
import VideoCam from '../src/icons/VideoCam';
import Warning from '../src/icons/Warning';

function IndexPage({ error, broadcastId }) {
  const [formVisible, setFormVisible] = useState(false);
  return (
    <div>
      <div className="blurry-background">
        <div className="tk-blob">
          <svg width="60vh" height="60vh" viewBox="0 0 747.2 726.7">
            <path d="M539.8 137.6c98.3 69 183.5 124 203 198.4 19.3 74.4-27.1 168.2-93.8 245-66.8 76.8-153.8 136.6-254.2 144.9-100.6 8.2-214.7-35.1-292.7-122.5S-18.1 384.1 7.4 259.8C33 135.6 126.3 19 228.5 2.2c102.1-16.8 213.2 66.3 311.3 135.4z"></path>
          </svg>
        </div>
      </div>
      <nav>
        <div className="page-wrapper">
          <SwingAppsIconSvg size={50} />
        </div>
      </nav>
      <main>
        <div className="page-wrapper">
          <h1 style={{ marginTop: 50 }}>Swing Mirror</h1>
          <p style={{ marginBottom: 30 }}>
            Share and control your camera on multiple devices.
          </p>
          {error && error === 'not_found' && (
            <div className="error">
              <Warning />
              <div>
                We couldn&apos;t find a broadcaster with code{' '}
                <code>{broadcastId}</code>. Check to make sure that you typed it
                correctly.
              </div>
            </div>
          )}
          <div className="start-boxes">
            <StartBox
              title="Camera mode"
              description="Use this device as a camera"
              icon={<VideoCam size={50} />}
              href="/broadcast"
            />

            <StartBox
              title="Mirror device"
              description="Use this device as a second screen"
              icon={<Monitor size={50} />}
              onClick={() => setFormVisible(true)}
            />
          </div>
        </div>
      </main>
      <footer>
        <div className="page-wrapper" style={{ textAlign: 'center' }}>
          <p>
            by <a href="https://github.com/trotzig">@trotzig</a>{' '}
            {new Date().getFullYear()}
          </p>
        </div>
      </footer>
      <Modal open={formVisible} onClose={() => setFormVisible(false)}>
        <div className="watch-form">
          <form action="/watch" method="GET">
            <input
              type="text"
              name="broadcastId"
              defaultValue={broadcastId}
              placeholder="Enter camera code"
            />
            <button type="submit">Go!</button>
          </form>
        </div>
      </Modal>
    </div>
  );
}

function getServerSideProps(context) {
  return {
    props: context.query,
  };
}

export { getServerSideProps };

export default IndexPage;
