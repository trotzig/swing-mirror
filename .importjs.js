const fs = require('fs');

module.exports = {
  declarationKeyword({ pathToCurrentFile }) {
    try {
      if (/(export |import )/.test(fs.readFileSync(pathToCurrentFile))) {
        return 'import';
      }
    } catch (e) {}
    return 'const';
  },
  namedExports: {
    react: ['useEffect', 'useState', 'useRef'],
  },
  globals: ['console', 'document'],
  logLevel: 'debug',
  excludes: [
    './.next/**',
  ],
  ignorePackagePrefixes: ['react-'],
};
