import { format } from 'date-fns';
import { DateHelper } from './DateHelper';

/**
 * Replace the datetime placeholders
 * @param value
 * @param dateFormat
 * @param articleDate
 * @returns
 */
export const processDateTimePlaceholders = (value: string, articleDate?: Date) => {
  if (value && typeof value === 'string') {
    if (value.includes(`{{date|`)) {
      const regex = /{{date\|[^}]*}}/g;
      const matches = value.match(regex);
      if (matches) {
        for (const match of matches) {
          const placeholderParts = match.split('|');
          if (placeholderParts.length > 1) {
            let dateFormat = placeholderParts[1].trim().replace('}}', '');

            if (dateFormat) {
              if (dateFormat && typeof dateFormat === 'string') {
                value = value.replace(
                  match,
                  format(articleDate || new Date(), DateHelper.formatUpdate(dateFormat) as string)
                );
              } else {
                value = value.replace(match, (articleDate || new Date()).toISOString());
              }
            }
          }
        }
      }
    }
  }

  return value;
};
