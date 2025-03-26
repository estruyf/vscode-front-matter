import { SETTING_GLOBAL_TIMEZONE } from '../constants';
import { DateHelper, Settings } from '../helpers';

export const formatInTimezone = (date: Date, dateFormat: string) => {
  const timezone = Settings.get<string>(SETTING_GLOBAL_TIMEZONE);
  return DateHelper.formatInTimezone(date, dateFormat, timezone) || '';
};
