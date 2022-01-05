export default function fileSuffix(mimeType) {
  return mimeType.slice(mimeType.indexOf('/') + 1, mimeType.indexOf(';'));
}
