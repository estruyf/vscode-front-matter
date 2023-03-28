import {
  SETTING_SEO_TITLE_LENGTH,
  SETTING_TAXONOMY_CATEGORIES,
  SETTING_TAXONOMY_TAGS
} from '../constants';
import { Logger, Notifications, Settings } from '../helpers';
import fetch from 'node-fetch';
import { TagType } from '../panelWebView/TagType';

const AI_URL = 'https://frontmatter.codes/api/ai';
// const AI_URL = 'http://localhost:3000/api/ai';

export class SponsorAi {
  /**
   * Get title suggestions from the AI
   * @param token
   * @param title
   * @returns
   */
  public static async getTitles(token: string, title: string) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        Notifications.warning(`The AI title generation took too long. Please try again later.`);
        controller.abort();
      }, 10000);
      const signal = controller.signal;

      const response = await fetch(`${AI_URL}/title`, {
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

  /**
   * Get taxonomy suggestions from the AI
   * @param token
   * @param title
   * @param description
   * @param type
   * @returns
   */
  public static async getTaxonomySuggestions(
    token: string,
    title: string,
    description: string,
    type: TagType
  ) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        Notifications.warning(`The AI taxonomy generation took too long. Please try again later.`);
        controller.abort();
      }, 10000);
      const signal = controller.signal;

      let options =
        type === TagType.tags
          ? Settings.get<string[]>(SETTING_TAXONOMY_TAGS, true)
          : Settings.get<string[]>(SETTING_TAXONOMY_CATEGORIES, true);

      const optionsString = options?.join(',') || '';
      const body = JSON.stringify({
        title: title,
        description: description,
        token: token,
        type: type,
        taxonomy: optionsString
      });

      const response = await fetch(`${AI_URL}/taxonomy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json'
        },
        body,
        signal: signal as any
      });
      clearTimeout(timeout);

      if (!response.ok) {
        return undefined;
      }

      const data: string[] = await response.json();

      return data || [];
    } catch (e) {
      Logger.error(`Sponsor AI: ${(e as Error).message}`);
      return undefined;
    }
  }
}
