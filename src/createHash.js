import md5 from 'crypto-js/md5';

export default function createHash(buffer) {
  return md5(buffer).toString();
}
