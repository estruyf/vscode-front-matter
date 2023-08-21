import { SETTING_SEO_DESCRIPTION_LENGTH, SETTING_SEO_TITLE_LENGTH } from '../constants';
import { Logger, Notifications, Settings, TaxonomyHelper } from '../helpers';
import fetch from 'node-fetch';
import { TagType } from '../panelWebView/TagType';
import { TaxonomyType } from '../models';

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

  public static async getDescription(token: string, title: string, content: string) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        Notifications.warning(`The AI title generation took too long. Please try again later.`);
        controller.abort();
      }, 10000);
      const signal = controller.signal;

      let articleContent = content;
      if (articleContent.length > 2000) {
        articleContent = articleContent.substring(0, 2000);
      }

      const response = await fetch(`${AI_URL}/description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify({
          title: title,
          content: articleContent,
          token: token,
          nrOfCharacters: Settings.get<number>(SETTING_SEO_DESCRIPTION_LENGTH) || 160
        }),
        signal: signal as any
      });
      clearTimeout(timeout);

      const data: string = await response.text();

      return data || '';
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
          ? await TaxonomyHelper.get(TaxonomyType.Tag)
          : await TaxonomyHelper.get(TaxonomyType.Category);

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
