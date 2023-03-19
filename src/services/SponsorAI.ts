import { SETTING_SEO_TITLE_LENGTH } from '../constants';
import { Logger, Notifications, Settings } from '../helpers';
import fetch from 'node-fetch';

export class SponsorAi {
  public static async getTitles(token: string, title: string) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        Notifications.warning(`The AI title generation took too long. Please try again later.`);
        controller.abort();
      }, 10000);
      const signal = controller.signal;

      const response = await fetch(`https://frontmatter.codes/api/ai-title`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify({
          title: title,
          token: token,
          nrOfCharacters: Settings.get<number>(SETTING_SEO_TITLE_LENGTH) || 60
        }),
        signal: signal as any
      });
      clearTimeout(timeout);

      const data: string[] = await response.json();

      return data || [];
    } catch (e) {
      Logger.error(`Sponsor AI: ${(e as Error).message}`);
      return undefined;
    }
  }
}
