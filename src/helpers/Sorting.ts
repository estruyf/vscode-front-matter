import { DateHelper } from './DateHelper';

export class Sorting {
  /**
   * Sort field value alphabetically
   * @param property
   * @returns
   */
  public static alphabetically = (property: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (a: any, b: any) => {
      if (a[property] < b[property]) {
        return -1;
      }
      if (a[property] > b[property]) {
        return 1;
      }
      return 0;
    };
  };

  /**
   * Sort field value numerically
   * @param property
   * @returns
   */
  public static numerically = (property: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (a: any, b: any) => {
      return a[property] - b[property];
    };
  };

  /**
   * Sort by date
   * @param property
   * @returns
   */
  public static date = (property: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (a: any, b: any) => {
      const dateA = DateHelper.tryParse(a[property]);
      const dateB = DateHelper.tryParse(b[property]);

      return (dateA || new Date(0)).getTime() - (dateB || new Date(0)).getTime();
    };
  };

  /**
   * Sort by date with a fallback
   * @param property
   * @returns
   */
  public static dateWithFallback = (property: string, fallback: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (a: any, b: any): number => {
      const dateA = DateHelper.tryParse(a[property]);
      const dateB = DateHelper.tryParse(b[property]);

      // Sort by date
      const dCount = (dateA || new Date(0)).getTime() - (dateB || new Date(0)).getTime();
      if (dCount) {
        return dCount;
      }

      // If there is a tie, sort by fallback property
      if (a[fallback] < b[fallback]) {
        return -1;
      }
      if (a[fallback] > b[fallback]) {
        return 1;
      }
      return 0;
    };
  };
}
