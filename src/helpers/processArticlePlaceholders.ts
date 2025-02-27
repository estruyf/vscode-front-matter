import { ContentType } from '../models';
import { getTitleField } from '../utils';
import { ArticleHelper } from './ArticleHelper';
import { SlugHelper } from './SlugHelper';

export const processArticlePlaceholdersFromData = (
  value: string,
  data: { [key: string]: any },
  contentType: ContentType,
  filePath?: string
): string => {
  const titleField = getTitleField();
  if (value.includes('{{title}}') && data[titleField]) {
    const regex = new RegExp('{{title}}', 'g');
    value = value.replace(regex, data[titleField] || '');
  }

  if (value.includes('{{slug}}')) {
    const regex = new RegExp('{{slug}}', 'g');
    value = value.replace(
      regex,
      SlugHelper.createSlug(data[titleField] || '', data, filePath, contentType.slugTemplate) || ''
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

  const titleField = getTitleField();

  if (value.includes('{{title}}')) {
    const regex = new RegExp('{{title}}', 'g');
    value = value.replace(regex, article.data[titleField] || '');
  }

  if (value.includes('{{slug}}') && filePath) {
    const contentType = article ? await ArticleHelper.getContentType(article) : undefined;
    if (contentType) {
      const regex = new RegExp('{{slug}}', 'g');
      value = value.replace(
        regex,
        SlugHelper.createSlug(
          article.data[titleField] || '',
          article.data,
          filePath,
          contentType.slugTemplate
        ) || ''
      );
    }
  }

  return value;
};
