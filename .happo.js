require('dotenv').config();

const happoPluginStorybook = require('happo-plugin-storybook');
const { RemoteBrowserTarget } = require('happo.io');

module.exports = {
  apiKey: process.env.HAPPO_API_KEY,
  apiSecret: process.env.HAPPO_API_SECRET,
  targets: {
    chromeDesktop: new RemoteBrowserTarget('chrome', { viewport: '1024x768' }),
    iosSafari: new RemoteBrowserTarget('ios-safari', { viewport: '375x700' }),
    iosSafariLandscape: new RemoteBrowserTarget('ios-safari', {
      viewport: '700x350',
      interfaceOrientation: 'landscape',
    }),
  },
  plugins: [happoPluginStorybook({})],
};
