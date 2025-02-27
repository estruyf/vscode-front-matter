import { parseWinPath, Settings } from '.';
import { stopWords, charMap, SETTING_DATE_FORMAT, SETTING_SLUG_TEMPLATE } from '../constants';
import { processTimePlaceholders, processFmPlaceholders } from '.';
import { parse } from 'path';

export class SlugHelper {
  /**
   * Generate the slug
   *
   * @param articleTitle
   */
  public static createSlug(
    articleTitle: string,
    articleData: { [key: string]: any },
    filePath?: string,
    slugTemplate?: string
  ): string | null {
    if (!articleTitle) {
      return null;
    }

    if (slugTemplate === undefined || slugTemplate === null) {
      slugTemplate = Settings.get<string>(SETTING_SLUG_TEMPLATE);
    }

    if (typeof slugTemplate === 'string') {
      if (slugTemplate.includes('{{title}}')) {
        const regex = new RegExp('{{title}}', 'g');
        slugTemplate = slugTemplate.replace(regex, articleTitle.toLowerCase().replace(/\s/g, '-'));
      } else if (slugTemplate.includes('{{seoTitle}}')) {
        const regex = new RegExp('{{seoTitle}}', 'g');
        slugTemplate = slugTemplate.replace(regex, SlugHelper.slugify(articleTitle));
      } else if (slugTemplate.includes(`{{fileName}}`)) {
        const file = parse(filePath || '');
        const fileName = file.name;
        const regex = new RegExp('{{fileName}}', 'g');
        slugTemplate = slugTemplate.replace(regex, fileName);
      } else if (slugTemplate.includes(`{{sluggedFileName}}`)) {
        const file = parse(filePath || '');
        const fileName = SlugHelper.slugify(file.name);
        const regex = new RegExp('{{sluggedFileName}}', 'g');
        slugTemplate = slugTemplate.replace(regex, fileName);
      }

      const dateFormat = Settings.get(SETTING_DATE_FORMAT) as string;
      articleTitle = processTimePlaceholders(slugTemplate, dateFormat);
      articleTitle = processFmPlaceholders(articleTitle, articleData);
      return articleTitle;
    }

    return SlugHelper.slugify(articleTitle);
  }

  /**
   * Converts a title into a slug by removing punctuation, stop words, and replacing characters.
   * @param title - The title to be slugified.
   * @returns The slugified version of the title.
   */
  public static slugify(title: string): string {
    let cleanTitle = this.removePunctuation(title).trim();
    if (cleanTitle) {
      cleanTitle = cleanTitle.toLowerCase();
      // Split into words
      let words = cleanTitle.split(/\s/);
      // Removing stop words
      words = this.removeStopWords(words);
      cleanTitle = words.join('-');
      cleanTitle = this.replaceCharacters(cleanTitle);
      return cleanTitle;
    }
    return '';
  }

  /**
   * Remove  links, periods, commas, semi-colons, etc.
   *
   * @param value
   */
  private static removePunctuation(value: string): string {
    if (typeof value !== 'string') {
      return '';
    }

    const punctuationless = value?.replace(/[.,-/#!$@%^&*;:{}=\-_`'"~()+?<>]/g, ' ');
    // Remove double spaces
    return punctuationless?.replace(/\s{2,}/g, ' ');
  }

  /**
   * Remove stop words
   *
   * @param words
   */
  private static removeStopWords(words: string[]) {
    const validWords: string[] = [];
    for (const word of words) {
      if (stopWords.indexOf(word.toLowerCase()) === -1) {
        validWords.push(word);
      }
    }
    return validWords;
  }

  /**
   * Replace characters from title
   *
   * @param value
   */
  private static replaceCharacters(value: string) {
    const characters = [...value];
    return characters.map((c) => (typeof charMap[c] === 'string' ? charMap[c] : c)).join('');
  }
}
