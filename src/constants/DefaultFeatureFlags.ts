import { FEATURE_FLAG } from './Features';

export const DEFAULT_PANEL_FEATURE_FLAGS = Object.values(FEATURE_FLAG.panel).filter(
  (v) => v !== FEATURE_FLAG.panel.globalSettings
);

export const DEFAULT_DASHBOARD_FEATURE_FLAGS = [
  FEATURE_FLAG.dashboard.data.view,
  FEATURE_FLAG.dashboard.taxonomy.view,
  FEATURE_FLAG.dashboard.snippets.view,
  FEATURE_FLAG.dashboard.snippets.manage
];
