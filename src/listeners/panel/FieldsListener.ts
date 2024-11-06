import { i18n } from '../../commands';
import { ExtensionState } from '../../constants';
import { Page } from '../../dashboardWebView/models';
import { Extension } from '../../helpers';
import { PostMessageData } from '../../models';
import { CommandToCode } from '../../panelWebView/CommandToCode';
import { PagesListener } from '../dashboard/PagesListener';
import { BaseListener } from './BaseListener';
import Fuse from 'fuse.js';

export class FieldsListener extends BaseListener {
  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static process(msg: PostMessageData) {
    super.process(msg);

    switch (msg.command) {
      case CommandToCode.searchByType:
        this.searchByType(msg.command, msg.requestId, msg.payload);
        break;
    }
  }

  /**
   * Search by type
   * @param command
   * @param requestId
   * @param payload
   * @returns
   */
  private static async searchByType(
    command: string,
    requestId?: string,
    data?: { type?: string; sameLocale?: boolean; activePath?: string }
  ) {
    if (!data?.type || !data?.activePath || !requestId) {
      return;
    }

    const isLocaleEnabled = await i18n.isLocaleEnabled(data.activePath);
    const activeLocale = await i18n.getLocale(data.activePath);
    if (isLocaleEnabled && !activeLocale?.locale) {
      return;
    }

    PagesListener.getPagesData(false, async (pages) => {
      const fuseKeys: Fuse.FuseOptionKey[] = [{ name: 'fmContentType', weight: 1 }];

      if (isLocaleEnabled && data.sameLocale) {
        fuseKeys.push({ name: 'fmLocale.locale', weight: 1 });
      }

      const fuseOptions: Fuse.IFuseOptions<Page> = {
        keys: fuseKeys,
        findAllMatches: true,
        threshold: 0
      };

      const pagesIndex = await Extension.getInstance().getState<Fuse.FuseIndex<Page>>(
        ExtensionState.Dashboard.Pages.Index,
        'workspace'
      );
      const fuseIndex = Fuse.parseIndex(pagesIndex);
      const fuse = new Fuse(pages || [], fuseOptions, fuseIndex);

      const andExpression: Fuse.Expression[] = [{ fmContentType: data.type ?? '' }];
      if (isLocaleEnabled && activeLocale?.locale && data.sameLocale) {
        andExpression.push({ 'fmLocale.locale': activeLocale.locale });
      }

      const results = fuse.search({
        $and: andExpression
      });
      const pageResults = results.map((page) => page.item);

      this.sendRequest(command, requestId, pageResults || []);
    });
  }
}
