import { NavigationType } from '../dashboardWebView/models';

export interface DashboardData {
  type: NavigationType;
  data?: any;
}