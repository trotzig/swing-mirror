import React from 'react';

function IPhoneScreenshot({ src }) {
  return (
    <div className="iphone-screenshot">
      <img src={src} />
      <div className="iphone-bottom" />
    </div>
  );
}

function LaptopScreenshot({ src }) {
  return (
    <div className="laptop-screenshot">
      <div className="laptop-top">
        <i />
        <i />
        <i />
      </div>
      <img src={src} />
      <div className="laptop-bottom" />
    </div>
  );
}

export default function About() {
  return (
    <div className="about">
      <div className="blurry-background" />
      <div className="page-wrapper">
        <div className="about-section">
          <div className="about-section-content">
            <div>
              <h2>Intro</h2>
              <p>
                Swing Mirror lets you film your swing on one device and use
                another device to watch the recorded video and control the
                recording.
              </p>
            </div>
            <div className="about-section-right">
              <IPhoneScreenshot src="/screenshots/broadcaster.png" />
            </div>
          </div>
        </div>
        <div className="about-section reversed">
          <div className="about-section-content">
            <div className="about-section-right">
              <LaptopScreenshot src="/screenshots/watch.png" />
            </div>
            <div>
              <h2>Mirror view</h2>
              <p>
                Record video on one device, see and control the video on another
                device. No apps required, just go to swingmirror.io on both
                devices and pair them easily with the four-letter code seen in
                the top right corner on the device used as a camera.
              </p>
            </div>
          </div>
        </div>
        <div className="about-section">
          <div className="about-section-content">
            <div>
              <h2>Draw lines</h2>
              <p>
                You can draw lines on top of the video feed. Great for when
                you&apos;re working to get back on that swing plane! Drawings
                can be done both on the live stream and when your watching
                videos in the library. Click/touch and drag to start.
              </p>
            </div>
            <div className="about-section-right">
              <LaptopScreenshot src="/screenshots/watch_lines.png" />
            </div>
          </div>
        </div>
        <div className="about-section reversed">
          <div className="about-section-content">
            <div className="about-section-right">
              <IPhoneScreenshot src="/screenshots/watch_auto.png" />
            </div>
            <div>
              <h2>Auto-recording</h2>
              <p>
                If you enable Auto-recording, you won&apos;t have to manually
                click the record button. Swing Mirror listens to sound spikes
                and detects motion in the video and has an algorithm to decide
                when to start recording. Recordings are automatically replayed
                so that you get instant feedback.
              </p>
            </div>
          </div>
        </div>
        <div className="about-section">
          <div className="about-section-content">
            <div>
              <h2>Video library</h2>
              <p>
                Videos are recorded and stored on all the devices you are using
                at the moment. Access your video library by clicking the poster
                image at the bottom left corner. Organize your swings by editing
                their titles.
              </p>
            </div>
            <div className="about-section-right">
              <IPhoneScreenshot src="/screenshots/library.jpeg" />
            </div>
          </div>
        </div>
        <div className="about-section reversed">
          <div className="about-section-content">
            <div className="about-section-right">
              <IPhoneScreenshot src="/screenshots/player.png" />
            </div>
            <div>
              <h2>Control playback</h2>
              <p>
                Drill into your swing by slowing down the playback rate, or skip
                frame by frame to zoom in on specifics.
              </p>
            </div>
          </div>
        </div>
        <div className="about-section">
          <div className="about-section-content">
            <div>
              <h2>Share videos</h2>
              <p>
                Use the share button to send videos to friends & family (or
                perhaps your swing coach).
              </p>
            </div>
            <div className="about-section-right">
              <IPhoneScreenshot src="/screenshots/share.png" />
            </div>
          </div>
        </div>
        <div className="about-section">
          <h2>Browser support</h2>
          <p>
            Swing Mirror works in most modern web browsers. We recommend iOS
            Safari on iPhone/iPad and Google Chrome on a desktop/laptop
            computer.
          </p>
          <p>
            If you use the &quot;Add to Home Screen&quot; option from a mobile
            device, you&apos;ll get an app-like experience even though it&apos;s
            a web application.
          </p>
        </div>
        <div className="about-section">
          <h2>Need help?</h2>
          <p>
            If you need help using Swing Mirror or if you want to report a bug.
            Reach out to henric@happo.io or{' '}
            <a href="https://github.com/trotzig/swing-mirror/issues">
              file an issue in the GitHub repo
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
