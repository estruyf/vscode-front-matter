export const processPathPlaceholders = (value: string, path: string) => {
  if (value && value.includes('{{pathToken.')) {
    const regex = new RegExp('{{pathToken.(\\d+)}}', 'g');
    const matches = value.match(regex);

    if (matches) {
      for (const match of matches) {
        const index = parseInt(match.replace('{{pathToken.', '').replace('}}', ''), 10);
        const pathTokens = path.split('/');

        if (pathTokens.length >= index) {
          value = value.replace(match, pathTokens[index - 1]);
        }
      }
    }
  }

  return value;
};
