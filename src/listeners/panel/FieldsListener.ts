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
  private static async searchByType(command: string, requestId?: string, type?: string) {
    if (!type || !requestId) {
      return;
    }

    PagesListener.getPagesData(false, async (pages) => {
      const fuseOptions: Fuse.IFuseOptions<Page> = {
        keys: [{ name: 'type', weight: 1 }]
      };

      const pagesIndex = await Extension.getInstance().getState<Fuse.FuseIndex<Page>>(
        ExtensionState.Dashboard.Pages.Index,
        'workspace'
      );
      const fuse = new Fuse(pages || [], fuseOptions, Fuse.parseIndex(pagesIndex));
      const results = fuse.search({
        $and: [
          {
            type
          }
        ]
      });
      const pageResults = results.map((page) => page.item);

      this.sendRequest(command, requestId, pageResults || []);
    });
  }
}
