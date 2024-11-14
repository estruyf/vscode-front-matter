import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { SETTING_GLOBAL_TIMEZONE } from '../constants';
import { DateHelper, Settings } from '../helpers';

export const formatInTimezone = (date: Date, dateFormat: string) => {
  const timezone = Settings.get<string>(SETTING_GLOBAL_TIMEZONE);
  return timezone
    ? formatInTimeZone(date, timezone, DateHelper.formatUpdate(dateFormat) as string)
    : format(date, DateHelper.formatUpdate(dateFormat) as string);
};
