import { authentication, QuickPickItem, QuickPickItemKind, window } from 'vscode';
import { Folders } from '../commands/Folders';
import { SETTING_SPONSORS_AI_ENABLED } from '../constants';
import { ContentType } from './ContentType';
import { Notifications } from './Notifications';
import { Settings } from './SettingsHelper';
import { Logger } from './Logger';
import { SponsorAi } from '../services/SponsorAI';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../localization';
import { ContentFolder } from '../models';

interface FolderQuickPickItem extends QuickPickItem {
  path: string;
  locale?: string;
}

export class Questions {
  /**
   * Yes/No question
   * @param placeholder
   * @returns
   */
  public static async yesOrNo(placeholder: string) {
    const answer = await window.showQuickPick(
      [l10n.t(LocalizationKey.commonYes), l10n.t(LocalizationKey.commonNo)],
      {
        placeHolder: placeholder,
        canPickMany: false,
        ignoreFocusOut: true
      }
    );
    return answer === l10n.t(LocalizationKey.commonYes);
  }

  /**
   * Specify the name of the content to create
   * @param showWarning
   * @returns
   */
  public static async ContentTitle(showWarning: boolean = true): Promise<string | undefined> {
    const aiEnabled = Settings.get<boolean>(SETTING_SPONSORS_AI_ENABLED);
    let title: string | undefined = '';

    if (aiEnabled) {
      const githubAuth = await authentication.getSession('github', ['read:user'], { silent: true });

      if (githubAuth && githubAuth.account.label) {
        title = await window.showInputBox({
          title: l10n.t(LocalizationKey.helpersQuestionsContentTitleAiInputTitle),
          prompt: l10n.t(LocalizationKey.helpersQuestionsContentTitleAiInputPrompt),
          placeHolder: l10n.t(LocalizationKey.helpersQuestionsContentTitleAiInputPlaceholder),
          ignoreFocusOut: true
        });

        if (title) {
          try {
            const aiTitles = await SponsorAi.getTitles(githubAuth.accessToken, title);

            if (aiTitles && aiTitles.length > 0) {
              const options: QuickPickItem[] = [
                {
                  label: `✏️ ${l10n.t(
                    LocalizationKey.helpersQuestionsContentTitleAiInputQuickPickTitleSeparator
                  )}`,
                  kind: QuickPickItemKind.Separator
                },
                {
                  label: title
                },
                {
                  label: `🤖 ${l10n.t(
                    LocalizationKey.helpersQuestionsContentTitleAiInputQuickPickAiSeparator
                  )}`,
                  kind: QuickPickItemKind.Separator
                },
                ...aiTitles.map((d: string) => ({
                  label: d
                }))
              ];

              const selectedTitle = await window.showQuickPick(options, {
                title: l10n.t(LocalizationKey.helpersQuestionsContentTitleAiInputSelectTitle),
                placeHolder: l10n.t(
                  LocalizationKey.helpersQuestionsContentTitleAiInputSelectPlaceholder
                ),
                ignoreFocusOut: true
              });

              if (selectedTitle) {
                title = selectedTitle.label;
              } else if (!selectedTitle) {
                // Reset the title, so the user can enter their own title
                title = undefined;
              }
            }
          } catch (e) {
            Logger.error((e as Error).message);
            Notifications.error(l10n.t(LocalizationKey.helpersQuestionsContentTitleAiInputFailed));
            title = undefined;
          }
        } else if (!title && showWarning) {
          Notifications.warning(l10n.t(LocalizationKey.helpersQuestionsContentTitleAiInputWarning));
          return;
        }
      }
    }

    if (!title) {
      title = await window.showInputBox({
        title: l10n.t(LocalizationKey.helpersQuestionsContentTitleTitleInputTitle),
        prompt: l10n.t(LocalizationKey.helpersQuestionsContentTitleTitleInputPrompt),
        placeHolder: l10n.t(LocalizationKey.helpersQuestionsContentTitleTitleInputPlaceholder),
        ignoreFocusOut: true
      });
    }

    if (!title && showWarning) {
      Notifications.warning(l10n.t(LocalizationKey.helpersQuestionsContentTitleTitleInputWarning));
      return;
    }

    return title;
  }

  /**
   * Select the folder for your content creation
   * @param showWarning
   * @returns
   */
  public static async SelectContentFolder(
    showWarning: boolean = true
  ): Promise<FolderQuickPickItem | undefined> {
    let folders = await Folders.get();
    folders = folders.filter((f) => !f.disableCreation);

    let selectedFolder: FolderQuickPickItem | undefined;
    if (folders.length > 1) {
      const folderOptions = folders.map((f: ContentFolder) => {
        if (f.locale) {
          return {
            label: `${f.title} (${f.localeTitle || f.locale})`,
            locale: f.locale,
            path: f.path
          } as FolderQuickPickItem;
        }
        return {
          label: f.title,
          path: f.path
        } as FolderQuickPickItem;
      });

      selectedFolder = await window.showQuickPick(folderOptions, {
        title: l10n.t(LocalizationKey.helpersQuestionsSelectContentFolderQuickPickTitle),
        placeHolder: l10n.t(
          LocalizationKey.helpersQuestionsSelectContentFolderQuickPickPlaceholder
        ),
        ignoreFocusOut: true
      });
    } else if (folders.length === 1) {
      selectedFolder = {
        label: folders[0].title,
        path: folders[0].path
      } as FolderQuickPickItem;
    } else {
      // When no page folders are found, the welcome dashboard is shown
      return;
    }

    if (!selectedFolder && showWarning) {
      Notifications.warning(
        l10n.t(LocalizationKey.helpersQuestionsSelectContentFolderQuickPickNoSelectionWarning)
      );
      return;
    }

    return selectedFolder;
  }

  /**
   * Select the content type to create new content
   * @param allowedCts Allowed content types for the folder
   * @param showWarning
   * @returns
   */
  public static async SelectContentType(
    allowedCts: string[],
    showWarning: boolean = true
  ): Promise<string | undefined> {
    let contentTypes = ContentType.getAll();
    if (!contentTypes || contentTypes.length === 0) {
      Notifications.warning(
        l10n.t(LocalizationKey.helpersQuestionsSelectContentTypeNoContentTypeWarning)
      );
      return;
    }

    // Only allow content types that are allowed for the folder
    if (allowedCts && allowedCts.length > 0) {
      contentTypes = contentTypes.filter((ct) =>
        allowedCts.find((allowedCt) => allowedCt === ct.name)
      );
    }

    if (contentTypes.length === 1) {
      return contentTypes[0].name;
    }

    const options = contentTypes.map((contentType) => ({
      label: contentType.name
    }));

    if (options.length === 0) {
      Notifications.error(
        LocalizationKey.helpersQuestionsSelectContentTypeQuickPickErrorNoContentTypes
      );
      return;
    }

    const selectedOption = await window.showQuickPick(options, {
      title: l10n.t(LocalizationKey.helpersQuestionsSelectContentTypeQuickPickTitle),
      placeHolder: l10n.t(LocalizationKey.helpersQuestionsSelectContentTypeQuickPickPlaceholder),
      canPickMany: false,
      ignoreFocusOut: true
    });

    if (!selectedOption && showWarning) {
      Notifications.warning(
        l10n.t(LocalizationKey.helpersQuestionsSelectContentTypeNoSelectionWarning)
      );
      return;
    }

    return selectedOption?.label;
  }
}
