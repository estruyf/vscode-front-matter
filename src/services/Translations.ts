import { ExtensionState } from '../constants';
import { Extension } from '../helpers';

export class Translations {
  /**
   * Translates an array of text from a source language to a target language.
   * @param text - The array of text to be translated.
   * @param source - The source language code.
   * @param target - The target language code.
   * @returns A Promise that resolves to an array of translated text, or undefined if translation is not possible.
   */
  public static async translate(
    text: string[],
    source: string,
    target: string
  ): Promise<string[] | undefined> {
    const deeplAuthKey = await Extension.getInstance().getSecret(
      ExtensionState.Secrets.Deepl.ApiKey
    );
    const azureAuthKey = await Extension.getInstance().getSecret(
      ExtensionState.Secrets.Azure.TranslatorKey
    );
    const azureRegion = await Extension.getInstance().getSecret(
      ExtensionState.Secrets.Azure.TranslatorRegion
    );

    if (azureAuthKey && azureRegion) {
      return this.translateAzure(text, source, target, azureAuthKey, azureRegion);
    }

    if (deeplAuthKey) {
      return this.translateDeepL(text, source, target, deeplAuthKey);
    }

    return;
  }

  /**
   * Translates an array of text using Azure Cognitive Services Translator API.
   * @param text - The array of text to be translated.
   * @param source - The source language code.
   * @param target - The target language code.
   * @param azureAuthKey - The Azure authentication key.
   * @param azureRegion - The Azure region for the translation service.
   * @returns A promise that resolves to an array of translated text.
   * @throws An error if the translation fails.
   */
  private static async translateAzure(
    text: string[],
    source: string,
    target: string,
    azureAuthKey: string,
    azureRegion: string
  ): Promise<string[]> {
    try {
      const body = JSON.stringify(text.map((t) => ({ Text: t })));

      const response = await fetch(
        `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${target}&from=${source}`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': azureAuthKey,
            'Ocp-Apim-Subscription-Region': azureRegion,
            'Content-Type': 'application/json; charset=UTF-8'
          },
          body
        }
      );

      if (!response.ok) {
        throw new Error(`${response.statusText}`);
      }

      const data = await response.json();

      return data.map((t: { translations: { text: string }[] }) => t.translations[0].text);
    } catch (error) {
      throw new Error(`Azure: ${(error as Error).message}`);
    }
  }

  /**
   * Translates an array of text using the DeepL translation service.
   * @param text - The text to be translated.
   * @param source - The source language of the text.
   * @param target - The target language for the translation.
   * @param deeplAuthKey - The authentication key for accessing the DeepL API.
   * @returns A Promise that resolves to an array of translated text.
   * @throws If there is an error during the translation process.
   */
  private static async translateDeepL(
    text: string[],
    source: string,
    target: string,
    deeplAuthKey: string
  ): Promise<string[]> {
    try {
      const body = JSON.stringify({
        text,
        source_lang: source,
        target_lang: target
      });

      let host = deeplAuthKey.endsWith(':fx') ? 'api-free.deepl.com' : 'api.deepl.com';

      const response = await fetch(`https://${host}/v2/translate`, {
        method: 'POST',
        headers: {
          Authorization: `DeepL-Auth-Key ${deeplAuthKey}`,
          'User-Agent': `FrontMatterCMS/${Extension.getInstance().version}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body
      });

      if (!response.ok) {
        throw new Error(`${response.statusText}`);
      }

      const data = await response.json();
      if (!data.translations || data.translations.length < 3) {
        throw new Error('Invalid response');
      }

      return data.translations.map((t: { text: string }) => t.text);
    } catch (error) {
      throw new Error(`DeepL: ${(error as Error).message}`);
    }
  }
}
