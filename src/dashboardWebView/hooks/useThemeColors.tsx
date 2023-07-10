

import { useCallback } from 'react';
import { useSettingsContext } from '../providers/SettingsProvider';

export default function useThemeColors() {
  const { experimental } = useSettingsContext();

  const getColors = useCallback((defaultColors: string, themeColors: string) => {
    // The feature is now enabled by default
    return themeColors;
  }, [experimental]);

  return {
    getColors
  };
}