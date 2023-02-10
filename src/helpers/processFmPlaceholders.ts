export const processFmPlaceholders = (value: string, fmData: any) => {
  if (value && value.includes('{{fm.')) {
    const regex = new RegExp('{{fm.(\\w+)}}', 'g');
    const matches = value.match(regex);

    if (matches) {
      for (const match of matches) {
        const field = match.replace('{{fm.', '').replace('}}', '');
        const fieldValue = fmData[field];

        if (fieldValue) {
          value = value.replace(match, fieldValue);
        }
      }
    }
  }

  return value;
};
