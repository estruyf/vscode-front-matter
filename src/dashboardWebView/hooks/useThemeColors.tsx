

import { useCallback } from 'react';
import { useSettingsContext } from '../providers/SettingsProvider';

export default function useThemeColors() {
  const { experimental } = useSettingsContext();

  const getColors = useCallback((defaultColors: string, themeColors: string) => {
    if (experimental) {
      return themeColors;
    }

    return defaultColors;
  }, [experimental]);

  return {
    getColors
  };
}