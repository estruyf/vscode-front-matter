import {
  CancellationTokenSource,
  LanguageModelChatMessage,
  LanguageModelChatResponse,
  extensions,
  lm,
  version as VscodeVersion,
  LanguageModelChat
} from 'vscode';
import { Logger, Settings, TaxonomyHelper } from '../helpers';
import {
  SETTING_COPILOT_FAMILY,
  SETTING_SEO_DESCRIPTION_LENGTH,
  SETTING_SEO_TITLE_LENGTH
} from '../constants';
import { TagType } from '../panelWebView/TagType';
import { TaxonomyType } from '../models';
import { sleep } from '../utils';

export class Copilot {
  private static personality =
    'You are a CMS expert specializing in Front Matter CMS. Your task is to assist the user in generating optimized content for their article.';

  /**
   * Checks if the GitHub Copilot extension is installed.
   * @returns A promise that resolves to a boolean indicating whether the extension is installed.
   */
  public static async isInstalled(): Promise<boolean> {
    const version = VscodeVersion.split('.').map((v) => parseInt(v));
    // GitHub Copilot requires VS Code version 1.92 or higher
    if (version[0] < 1 || (version[0] === 1 && version[1] < 92)) {
      return false;
    }

    const copilotExt = extensions.getExtension(`GitHub.copilot`);
    return !!copilotExt;
  }

  public static async suggestTitles(title: string): Promise<string[] | undefined> {
    if (!title) {
      return;
    }

    try {
      const chars = Settings.get<number>(SETTING_SEO_TITLE_LENGTH) || 60;
      const messages = [
        LanguageModelChatMessage.User(Copilot.personality),
        LanguageModelChatMessage.User(
          `Generate an SEO-friendly title based on the provided one. Offer a few suggestions, ensuring each does not exceed ${chars} characters.
  
  Each title suggestion should have the following response format: a single string wrapped in double quotes, e.g., "My first blog post" with each suggestion on a new line.`
        ),
        LanguageModelChatMessage.User(`The title of the blog post is """${title}""".`)
      ];

      const chatResponse = await Copilot.getChatResponse(messages);
      if (!chatResponse) {
        return;
      }

      let titles = chatResponse.split('\n').map((title) => title.trim());
      // Remove 1. or - from the beginning of the title
      titles = titles.map((title) => title.replace(/^\d+\.\s+|-/, '').trim());
      // Only take the titles wrapped in quotes
      titles = titles.filter((title) => title.startsWith('"') && title.endsWith('"'));
      // Remove the quotes from the beginning and end of the title
      titles = titles.map((title) => title.slice(1, -1));
      return titles;
    } catch (err) {
      Logger.error(`Copilot:suggestTitles:: ${(err as Error).message}`);
      return [];
    }
  }

  /**
   * Generates a SEO friendly abstract/description for an article based on the provided title and content.
   *
   * @param title - The title of the blog post.
   * @param content - The content of the blog post.
   * @returns A chat response containing the generated description.
   */
  public static async suggestDescription(title: string, content?: string) {
    if (!title) {
      return;
    }

    try {
      const chars = Settings.get<number>(SETTING_SEO_DESCRIPTION_LENGTH) || 160;
      const messages = [
        LanguageModelChatMessage.User(Copilot.personality),
        LanguageModelChatMessage.User(
          `Generate an SEO-friendly description using the provided title and/or content. Ensure the description does not exceed ${chars} characters.

Response format: a single string wrapped in double quotes, e.g., "Boost your website's performance with these easy-to-follow speed optimization tips.".`
        ),
        LanguageModelChatMessage.User(`The title of the blog post is """${title}""".`)
      ];

      if (content) {
        messages.push(
          LanguageModelChatMessage.User(`The content of the blog post is: """${content}""".`)
        );
      }

      const chatResponse = await Copilot.getChatResponse(messages);

      if (!chatResponse) {
        return;
      }

      let description = chatResponse.trim();
      description = description.startsWith('"') ? description.slice(1) : description;
      description = description.endsWith('"') ? description.slice(0, -1) : description;
      return description;
    } catch (err) {
      Logger.error(`Copilot:suggestDescription:: ${(err as Error).message}`);
      return '';
    }
  }

  /**
   * Suggests taxonomy tags based on the provided title, tag type, description, and content.
   *
   * @param title - The title of the blog post.
   * @param tagType - The type of taxonomy tags to suggest (Tag or Category).
   * @param description - The description of the blog post (optional).
   * @param content - The content of the blog post (optional).
   * @returns A promise that resolves to an array of suggested taxonomy tags, or undefined if no title is provided.
   */
  public static async suggestTaxonomy(
    title: string,
    tagType: TagType,
    description?: string,
    content?: string
  ): Promise<string[] | undefined> {
    if (!title) {
      return;
    }

    try {
      let type = tagType === TagType.tags ? 'tags' : 'categories';
      if (tagType === TagType.custom) {
        type = 'tags';
      }

      const messages = [
        LanguageModelChatMessage.User(Copilot.personality),
        LanguageModelChatMessage.User(
          `Generate relevant taxonomy ${type} based on the provided title, description, available ${type}, and/or content. Respond with a list of ${type} separated by commas.

Example: SEO, website optimization, digital marketing.`
        ),
        LanguageModelChatMessage.User(`The title of the blog post is """${title}""".`)
      ];

      if (description) {
        messages.push(
          LanguageModelChatMessage.User(
            `The description of the blog post is: """${description}""".`
          )
        );
      }

      const options =
        tagType === TagType.tags
          ? await TaxonomyHelper.get(TaxonomyType.Tag)
          : await TaxonomyHelper.get(TaxonomyType.Category);
      const optionsString = options?.join(',') || '';

      if (optionsString) {
        messages.push(
          LanguageModelChatMessage.User(
            `Based on the provided title, description, and/or content, select relevant ${tagType} from the available taxonomy list: ${optionsString}. You may suggest up to 5 tags and include new ones if necessary.`
          )
        );
      }

      if (content) {
        messages.push(
          LanguageModelChatMessage.User(`The content of the blog post is: """${content}""".`)
        );
      }

      const chatResponse = await Copilot.getChatResponse(messages);

      if (!chatResponse) {
        return;
      }

      // If the chat response contains a colon character, we take the text after the colon as the response.
      if (chatResponse.includes(':')) {
        return chatResponse
          .split(':')[1]
          .split(',')
          .map((tag) => tag.trim());
      }

      // Otherwise, we split the response by commas.
      return chatResponse.split(',').map((tag) => tag.trim());
    } catch (err) {
      Logger.error(`Copilot:suggestTaxonomy:: ${(err as Error).message}`);
      return [];
    }
  }

  /**
   * Prompts the Copilot service with a given message and returns the response.
   *
   * @param {string} prompt - The message to send to the Copilot service.
   * @returns {Promise<string | undefined>} - The response from the Copilot service, or undefined if no prompt is provided or an error occurs.
   *
   * @throws {Error} - Logs an error message if an exception occurs during the process.
   */
  public static async promptCopilot(prompt: string): Promise<string | undefined> {
    if (!prompt) {
      return;
    }

    try {
      const messages = [LanguageModelChatMessage.User(prompt)];

      const chatResponse = await Copilot.getChatResponse(messages);
      if (!chatResponse) {
        return;
      }

      return chatResponse;
    } catch (err) {
      Logger.error(`Copilot:promptCopilot:: ${(err as Error).message}`);
      return '';
    }
  }

  /**
   * Retrieves the chat response from the language model.
   * @param messages - The chat messages to send to the language model.
   * @returns The concatenated text fragments from the chat response.
   */
  private static async getChatResponse(messages: LanguageModelChatMessage[]) {
    let chatResponse: LanguageModelChatResponse | undefined;

    try {
      const model = await this.getModel();
      if (!model) {
        return;
      }
      chatResponse = await model.sendRequest(messages, {}, new CancellationTokenSource().token);
    } catch (err) {
      Logger.error(`Copilot:getChatResponse:: ${(err as Error).message}`);
      return;
    }

    const allFragments = [];
    for await (const fragment of chatResponse.text) {
      allFragments.push(fragment);
    }

    return allFragments.join('');
  }

  /**
   * Retrieves the chat model for the Copilot service.
   * @returns A Promise that resolves to the chat model.
   */
  private static async getModel(retry = 0): Promise<LanguageModelChat | undefined> {
    // const models = await lm.selectChatModels({
    //   vendor: 'copilot'
    // });
    // console.log(models);
    const [model] = await lm.selectChatModels({
      vendor: 'copilot',
      family: Settings.get<string>(SETTING_COPILOT_FAMILY) || 'gpt-4o-mini'
    });

    if ((!model || !model.sendRequest) && retry <= 5) {
      await sleep(1000);
      return Copilot.getModel(retry + 1);
    }

    return model;
  }
}
