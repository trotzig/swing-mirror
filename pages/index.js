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
      <div className="blurry-background" />
      <nav>
        <div className="page-wrapper">
          <SwingAppsIconSvg size={50} />
        </div>
      </nav>
      <main>
        <div className="page-wrapper">
          <h1 style={{ marginTop: 50 }}>
            Swing <i>|</i> Mirror
          </h1>
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
      <Modal opaque open={formVisible} onClose={() => setFormVisible(false)}>
        <div className="watch-form">
          <form action="/watch" method="GET">
            <h2>Enter camera code</h2>
            <p>
              You can find the code in the upper right corner on your camera
              view.{' '}
            </p>
            <input type="text" name="broadcastId" defaultValue={broadcastId} />
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
