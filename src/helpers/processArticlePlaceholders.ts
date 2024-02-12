import { ContentType } from '../models';
import { ArticleHelper } from './ArticleHelper';
import { SlugHelper } from './SlugHelper';

export const processArticlePlaceholdersFromData = (
  value: string,
  data: { [key: string]: any },
  contentType: ContentType
): string => {
  if (value.includes('{{title}}') && data.title) {
    const regex = new RegExp('{{title}}', 'g');
    value = value.replace(regex, data.title || '');
  }

  if (value.includes('{{slug}}')) {
    const regex = new RegExp('{{slug}}', 'g');
    value = value.replace(
      regex,
      SlugHelper.createSlug(data.title || '', data, contentType.slugTemplate) || ''
    );
  }

  return value;
};

export const processArticlePlaceholdersFromPath = async (
  value: string,
  filePath: string
): Promise<string> => {
  const article = await ArticleHelper.getFrontMatterByPath(filePath);
  if (!article) {
    return value;
  }

  if (value.includes('{{title}}')) {
    const regex = new RegExp('{{title}}', 'g');
    value = value.replace(regex, article.data.title || '');
  }

  if (value.includes('{{slug}}') && filePath) {
    const contentType = article ? ArticleHelper.getContentType(article) : undefined;
    if (contentType) {
      const regex = new RegExp('{{slug}}', 'g');
      value = value.replace(
        regex,
        SlugHelper.createSlug(article.data.title || '', article.data, contentType.slugTemplate) ||
          ''
      );
    }
  }

  return value;
};
