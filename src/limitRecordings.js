const MAX = 4;

export function limitRecordings(recordings) {
  if (recordings.length < MAX) {
    return recordings;
  }

  const toRemove = recordings.slice(0, recordings.length - MAX);
  const toKeep = recordings.slice(recordings.length - MAX);

  for (const item of toRemove) {
    URL.revokeObjectURL(item.url);
  }
  return toKeep;
}
