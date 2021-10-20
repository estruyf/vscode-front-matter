import { stopWords, charMap } from '../constants';

export class SlugHelper {
  
  /**
   * Generate the slug
   * 
   * @param articleTitle 
   */
  public static createSlug(articleTitle: string): string | null {
    if (!articleTitle) {
      return null;
    }

    // Remove punctuation from input string, and split it into words.
    let cleanTitle = this.removePunctuation(articleTitle);
    if (cleanTitle) {
      cleanTitle = cleanTitle.toLowerCase();
      // Split into words
      let words = cleanTitle.split(/\s/);
      // Removing stop words
      words = this.removeStopWords(words);
      cleanTitle = words.join("-");
      cleanTitle = this.replaceCharacters(cleanTitle);
      return cleanTitle;
    }

    return null;
  }

  /**
   * Remove  links, periods, commas, semi-colons, etc.
   * 
   * @param value 
   */
  private static removePunctuation(value: string): string {
    if (typeof value !== "string") {
      return "";
    }

    const punctuationless = value?.replace(/[\.,-\/#!$@%\^&\*;:{}=\-_`'"~()+\?<>]/g, " ");
    // Remove double spaces
    return punctuationless?.replace(/\s{2,}/g," ");
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
    return characters.map(c => charMap[c] || c).join("");
  }
}