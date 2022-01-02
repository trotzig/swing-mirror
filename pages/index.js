import Link from 'next/link';
import React from 'react';

import VideoCam from '../src/icons/VideoCam';
import Warning from '../src/icons/Warning';

function IndexPage({ error, broadcastId }) {
  return (
    <div>
      <main>
        <div className="page-wrapper">
          <h1 style={{ marginTop: 50 }}>Welcome to Swing Mirror</h1>
          <p style={{ marginBottom: 30 }}>
            Swing Mirror lets you film your golf swing and view it on multiple
            screens.
          </p>
          {error && error === 'not_found' && (
            <p className="error">
              <Warning />
              We couldn&apos;t find a broadcaster with code {broadcastId}. Check
              to make sure that you typed it correctly.
            </p>
          )}
          <div className="start-boxes">
            <div className="start-box">
              <h2>Camera mode</h2>
              <p>Use this device as a camera.</p>
              <Link href="/broadcast">
                <a>
                  <div>
                    <VideoCam size={80} />
                  </div>
                  <span>Start camera mode</span>
                </a>
              </Link>
            </div>
            <div className="start-box">
              <h2>Mirror device</h2>
              <p>
                Enter camera code to make this device act as a second screen.
                Find the code in the top right corner of the camera view.
              </p>
              <form action="/watch" method="GET">
                <input
                  type="text"
                  name="broadcastId"
                  defaultValue={broadcastId}
                />
                <button type="submit">Submit</button>
              </form>
            </div>
          </div>
        </div>
      </main>
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
