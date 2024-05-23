import { ContentFolder } from '../models';

export const processI18nPlaceholders = (
  value: string,
  contentFolder: ContentFolder | null | undefined
) => {
  // Example: {{locale}}
  if (value && contentFolder?.locale) {
    if (value.includes('{{locale}}')) {
      const regex = new RegExp('{{locale}}', 'g');
      value = value.replace(regex, contentFolder.locale);
    }
    // Example: {{locale | ignore:en}}
    else if (value.includes('{{locale')) {
      const regex = /{{locale[^}]*}}/g;
      const matches = value.match(regex);
      if (matches) {
        for (const match of matches) {
          const placeholderParts = match.split('|');
          if (placeholderParts.length > 1) {
            let ignore = placeholderParts[1].trim().replace('}}', '');

            if (ignore.startsWith('ignore:')) {
              ignore = ignore.replace('ignore:', '');

              if (ignore.includes(contentFolder.locale)) {
                value = value.replace(match, '');
              } else {
                value = value.replace(match, contentFolder.locale);
              }
            }
          }
        }
      }
    }
  }

  return value;
};
