import React from 'react';
import Link from 'next/link';

function IndexPage({ error, broadcastId }) {
  return (
    <div>
      <main>
        <div className="page-wrapper">
          <h1 style={{ marginTop: 50 }}>Welcome to Swing Mirror</h1>
          {error && error === 'not_found' && (
            <p className="error">
              We couldn&apos;t find a broadcaster with code {broadcastId}. Check
              to make sure that you typed it correctly.
            </p>
          )}
          <p>Enter broadcaster code:</p>
          <form action="/watch" method="GET">
            <input
              autoFocus
              type="text"
              name="broadcastId"
              defaultValue={broadcastId}
            />
            <button type="submit">Submit</button>
          </form>
          <p>
            ...or press{' '}
            <Link href="/broadcast">
              <a>here if you want to be a broadcaster</a>
            </Link>
            .
          </p>
        </div>
      </main>

      <footer>
        <div className="page-wrapper">
          <p>
            Swing Mirror lets you film your golf swing and view it on multiple
            screens. Choose one device that you{' '}
            <Link href="/broadcast">
              <a>turn into a broadcaster</a>
            </Link>
            . Then come here and enter the code you get in the upper right
            corner of the broadcaster window.
          </p>
        </div>
      </footer>
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
