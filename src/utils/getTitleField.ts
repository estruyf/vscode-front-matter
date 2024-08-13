import { DefaultFields, SETTING_SEO_TITLE_FIELD } from '../constants';
import { Settings } from '../helpers';

export const getTitleField = () =>
  Settings.get<string>(SETTING_SEO_TITLE_FIELD) || DefaultFields.Title;
