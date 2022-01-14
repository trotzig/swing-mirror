import React from 'react';

function Error({ err }) {
  return (
    <div className="error-page">
      <div className="blurry-background" />
      <div className="page-wrapper">
        <h1>Whoops – That&apos;s an error!</h1>
        <p>
          Reach out to henric@happo.io if you need help, and make sure to
          include the error log below in the email message.
        </p>
        <pre>{(err && err.stack) || 'Fake error\nat fake-error.js:12:1'}</pre>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ err }) => {
  return { err };
};

export default Error;
