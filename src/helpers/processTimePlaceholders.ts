import { format } from 'date-fns';
import { DateHelper } from './DateHelper';

/**
 * Replace the time placeholders
 * @param value
 * @param title
 * @returns
 */
export const processTimePlaceholders = (value: string, dateFormat?: string) => {
  if (value && typeof value === 'string') {
    if (value.includes('{{now}}')) {
      const regex = new RegExp('{{now}}', 'g');

      if (dateFormat && typeof dateFormat === 'string') {
        value = value.replace(
          regex,
          format(new Date(), DateHelper.formatUpdate(dateFormat) as string)
        );
      } else {
        value = value.replace(regex, new Date().toISOString());
      }
    }

    if (value.includes('{{year}}')) {
      const regex = new RegExp('{{year}}', 'g');
      value = value.replace(regex, format(new Date(), 'yyyy'));
    }

    if (value.includes('{{month}}')) {
      const regex = new RegExp('{{month}}', 'g');
      value = value.replace(regex, format(new Date(), 'MM'));
    }

    if (value.includes('{{day}}')) {
      const regex = new RegExp('{{day}}', 'g');
      value = value.replace(regex, format(new Date(), 'dd'));
    }

    if (value.includes('{{hour12}}')) {
      const regex = new RegExp('{{hour12}}', 'g');
      value = value.replace(regex, format(new Date(), 'hh'));
    }

    if (value.includes('{{hour24}}')) {
      const regex = new RegExp('{{hour24}}', 'g');
      value = value.replace(regex, format(new Date(), 'HH'));
    }

    if (value.includes('{{ampm}}')) {
      const regex = new RegExp('{{ampm}}', 'g');
      value = value.replace(regex, format(new Date(), 'aaa'));
    }

    if (value.includes('{{minute}}')) {
      const regex = new RegExp('{{minute}}', 'g');
      value = value.replace(regex, format(new Date(), 'mm'));
    }
  }

  return value;
};
