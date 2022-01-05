const PATTERN = /[a-z]+\/([a-z0-9]+)/;
export default function fileSuffix(mimeType) {
  const match = mimeType.match(PATTERN);
  if (!match) {
    return 'unknown';
  }
  return match[1];
}
