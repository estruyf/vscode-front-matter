import { formatInTimezone } from '../utils';

export const processFmPlaceholders = (value: string, fmData: { [key: string]: any }) => {
  // Example: {{fm.date}} or {{fm.date | dateFormat 'DD.MM.YYYY'}}
  if (value && value.includes('{{fm.')) {
    const regex = /{{fm.[^}]*}}/g;
    const matches = value.match(regex);

    if (matches) {
      for (const match of matches) {
        const placeholderParts = match.split('|');

        if (placeholderParts.length > 1) {
          const field = placeholderParts[0].replace('{{fm.', '').trim();
          const formatting = placeholderParts[1].trim().replace('}}', '');

          // Get the field value
          const fieldValue = fmData[field];

          if (formatting.startsWith('format')) {
            let dateFormat = formatting.replace('format:', '').trim();

            // Strip the single quotes
            if (dateFormat.startsWith("'") && dateFormat.endsWith("'")) {
              dateFormat = dateFormat.substring(1, dateFormat.length - 1);
            }

            // Parse the date value and format it
            if (fieldValue) {
              const formattedDate = formatInTimezone(new Date(fieldValue), dateFormat);
              value = value.replace(match, formattedDate);
            }
          } else if (fieldValue) {
            value = value.replace(match, fieldValue);
          }
        } else {
          // Get the field name
          const field = match.replace('{{fm.', '').replace('}}', '');

          // Get the field value
          const fieldValue = fmData[field];

          // Replace the placeholder with the field value
          if (fieldValue) {
            value = value.replace(match, fieldValue);
          }
        }
      }
    }
  }

  return value;
};
