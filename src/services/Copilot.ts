import {
  CancellationTokenSource,
  LanguageModelChatMessage,
  LanguageModelChatResponse,
  extensions,
  lm,
  version as VscodeVersion
} from 'vscode';
import { Logger, Settings, TaxonomyHelper } from '../helpers';
import { SETTING_SEO_DESCRIPTION_LENGTH, SETTING_SEO_TITLE_LENGTH } from '../constants';
import { TagType } from '../panelWebView/TagType';
import { TaxonomyType } from '../models';

export class Copilot {
  private static personality =
    'You are a CMS expert for Front Matter CMS and your task is to assist the user to help generate content for their article.';

  /**
   * Checks if the GitHub Copilot extension is installed.
   * @returns A promise that resolves to a boolean indicating whether the extension is installed.
   */
  public static async isInstalled(): Promise<boolean> {
    if (!VscodeVersion.includes('insider')) {
      // At the moment Copilot is only available in the insider version of VS Code
      return false;
    }

    const copilotExt = extensions.getExtension(`GitHub.copilot`);
    return !!copilotExt;
  }

  public static async suggestTitles(title: string): Promise<string[] | undefined> {
    if (!title) {
      return;
    }

    const chars = Settings.get<number>(SETTING_SEO_TITLE_LENGTH) || 60;
    const messages = [
      LanguageModelChatMessage.User(Copilot.personality),
      LanguageModelChatMessage.User(
        `The user wants you to create a SEO friendly title. You should give the user a couple of suggestions based on the provided title.
        
        IMPORTANT: You are only allowed to respond with a text that should not exceed ${chars} characters in length.
        
        Desired format: just a string, e.g. "My first blog post". Each suggestion is separated by a new line.`
      ),
      LanguageModelChatMessage.User(`The title of the blog post is """${title}""".`)
    ];

    const chatResponse = await this.getChatResponse(messages);
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

    const chars = Settings.get<number>(SETTING_SEO_DESCRIPTION_LENGTH) || 160;
    const messages = [
      LanguageModelChatMessage.User(Copilot.personality),
      LanguageModelChatMessage.User(
        `The user wants you to create a SEO friendly abstract/description. When the user provides a title and/or content, you should use this information to generate the description.
        
        IMPORTANT: You are only allowed to respond with a text that should not exceed ${chars} characters in length.`
      ),
      LanguageModelChatMessage.User(`The title of the blog post is """${title}""".`)
    ];

    if (content) {
      messages.push(
        LanguageModelChatMessage.User(`The content of the blog post is: """${content}""".`)
      );
    }

    const chatResponse = await this.getChatResponse(messages);
    return chatResponse;
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

    const messages = [
      LanguageModelChatMessage.User(Copilot.personality),
      LanguageModelChatMessage.User(
        `The user wants you to suggest some taxonomy tags. When the user provides a title, description, list of available taxonomy tags, and/or content, you should use this information to generate the tags.
        
        IMPORTANT: You are only allowed to respond with a list of tags separated by commas. Example: tag1, tag2, tag3.`
      ),
      LanguageModelChatMessage.User(`The title of the blog post is """${title}""".`)
    ];

    if (description) {
      messages.push(
        LanguageModelChatMessage.User(`The description of the blog post is: """${description}""".`)
      );
    }

    let options =
      tagType === TagType.tags
        ? await TaxonomyHelper.get(TaxonomyType.Tag)
        : await TaxonomyHelper.get(TaxonomyType.Category);
    const optionsString = options?.join(',') || '';

    if (optionsString) {
      messages.push(
        LanguageModelChatMessage.User(
          `The available taxonomy tags are: ${optionsString}. Please select the tags that are relevant to the article. You are allowed to suggest a maximum of 5 tags and suggest new tags if necessary.`
        )
      );
    }

    if (content) {
      messages.push(
        LanguageModelChatMessage.User(`The content of the blog post is: """${content}""".`)
      );
    }

    const chatResponse = await this.getChatResponse(messages);

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
      chatResponse = await model.sendRequest(messages, {}, new CancellationTokenSource().token);
    } catch (err) {
      Logger.error(`Copilot:getChatResponse:: ${(err as Error).message}`);
      return;
    }

    let allFragments = [];
    for await (const fragment of chatResponse.text) {
      allFragments.push(fragment);
    }

    return allFragments.join('');
  }

  /**
   * Retrieves the chat model for the Copilot service.
   * @returns A Promise that resolves to the chat model.
   */
  private static async getModel() {
    const [model] = await lm.selectChatModels({
      vendor: 'copilot'
      // family: 'gpt-4'
    });

    return model;
  }
}
