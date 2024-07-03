import { DefaultFields, SETTING_SEO_DESCRIPTION_FIELD } from '../constants';
import { Settings } from '../helpers';

export const getDescriptionField = () =>
  Settings.get<string>(SETTING_SEO_DESCRIPTION_FIELD) || DefaultFields.Description;
