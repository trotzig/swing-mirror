import React, { useEffect, useRef, useState } from 'react';

import About from '../src/About';
import LibraryButton from '../src/LibraryButton';
import Modal from '../src/Modal';
import Monitor from '../src/icons/Monitor';
import StartBox from '../src/StartBox';
import SwingAppsIconSvg from '../src/icons/SwingAppsIconSvg';
import VideoCam from '../src/icons/VideoCam';
import Warning from '../src/icons/Warning';
import db from '../src/db';

function CodeInput({ length, ...props }) {
  const ruler = useRef();
  const [charWidth, setCharWidth] = useState(0);
  const [charHeight, setCharHeight] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [focus, setFocus] = useState(false);
  useEffect(() => {
    const rect = ruler.current.getBoundingClientRect();
    setCharWidth(rect.width / 4);
    setCharHeight(rect.height);
  }, []);
  return (
    <div className="code-input">
      <input
        autoComplete="off"
        pattern="[a-z0-9]+"
        minLength={length}
        maxLength={length}
        className="code-input-input"
        {...props}
        onChange={e => {
          const len = e.target.value.length;
          setCharIndex(len);
          if (len >= length) {
            e.target.blur();
            e.target.closest('form').submit();
          }
        }}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{ textIndent: charWidth * 0.33 }}
        autoCorrect="off"
        autoCapitalize="none"
      />
      <div className="code-input-boxes">
        {charWidth
          ? Array(length)
              .fill({})
              .map((o, i) => (
                <div
                  key={i}
                  className="code-input-box"
                  style={{
                    width: charWidth - 4,
                    height: charHeight + 10,
                    marginRight: 2,
                    marginLeft: 2,
                    borderColor:
                      focus && charIndex === i ? 'currentColor' : undefined,
                  }}
                />
              ))
          : null}
      </div>
      <span ref={ruler} className="code-input-ruler">
        {Array(length).fill('1').join('')}
      </span>
    </div>
  );
}

function IndexPage({ error, broadcastId }) {
  const [formVisible, setFormVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [libraryVideo, setLibraryVideo] = useState();
  useEffect(() => {
    async function run() {
      const dbVideo = await db.getMostRecentVideo();
      setLibraryVideo(dbVideo ? await dbVideo.toRecording() : undefined);
    }
    run();
    db.addEventListener('change', run);
    return () => db.removeEventListener('change', run);
  }, []);
  return (
    <div>
      <div className="blurry-background" />
      <nav>
        <div
          className="page-wrapper start-nav"
          style={{ position: 'relative' }}
        >
          <SwingAppsIconSvg size={50} />
          {libraryVideo && (
            <div className="home-library-button">
              <LibraryButton video={libraryVideo} />
            </div>
          )}
        </div>
      </nav>
      <main>
        <div className="page-wrapper">
          <h1>
            Swing <i>|</i> Mirror
          </h1>
          <p className="tagline">
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
            By <a href="https://github.com/trotzig">@trotzig</a>{' '}
            {new Date().getFullYear()} |{' '}
            <a
              href="#"
              className="reset-text"
              onClick={e => {
                setAboutVisible(true);
                e.preventDefault();
              }}
            >
              About
            </a>
          </p>
        </div>
      </footer>
      <Modal opaque open={formVisible} onClose={() => setFormVisible(false)}>
        <div className="watch-form">
          <form action="/watch" method="GET" autoComplete="off">
            <h2>Enter camera code</h2>
            <p>
              You can find the code in the upper right corner on your camera
              view.{' '}
            </p>
            <CodeInput length={4} name="broadcastId" />
          </form>
        </div>
      </Modal>
      <Modal
        opaque
        slideUp
        open={aboutVisible}
        onClose={() => setAboutVisible(false)}
        title="About Swing Mirror"
        scrolls
      >
        <About />
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
