import React from 'react';

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
        </div>
      </main>

      <footer>
        <div className="page-wrapper">
          <p>
            Swing Mirror lets you film your golf swing and view it on multiple
            screens. Use the{' '}
            <a href="https://swingapps.io">Swing Mirror iOS app</a> as the
            broadcaster. Then come here and enter the code you get in the iOS
            app.
          </p>
          <p>All devices need a working Internet connection.</p>
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
