import { commands } from 'vscode';
import { COMMAND_NAME } from '../../constants';
import { DashboardCommand } from '../../dashboardWebView/DashboardCommand';
import { DashboardMessage } from '../../dashboardWebView/DashboardMessage';
import { TaxonomyHelper } from '../../helpers';
import { PostMessageData } from '../../models';
import { BaseListener } from './BaseListener';

export class TaxonomyListener extends BaseListener {
  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static process(msg: PostMessageData) {
    super.process(msg);

    switch (msg.command) {
      case DashboardMessage.getTaxonomyData:
        this.getData();
        break;
      case DashboardMessage.editTaxonomy:
        TaxonomyHelper.rename(msg.payload);
        break;
      case DashboardMessage.mergeTaxonomy:
        TaxonomyHelper.merge(msg.payload);
        break;
      case DashboardMessage.deleteTaxonomy:
        TaxonomyHelper.delete(msg.payload);
        break;
      case DashboardMessage.moveTaxonomy:
        TaxonomyHelper.move(msg.payload);
        break;
      case DashboardMessage.addToTaxonomy:
        TaxonomyHelper.addTaxonomy(msg.payload);
        break;
      case DashboardMessage.createTaxonomy:
        TaxonomyHelper.createNew(msg.payload);
        break;
      case DashboardMessage.importTaxonomy:
        commands.executeCommand(COMMAND_NAME.exportTaxonomy);
        break;
    }
  }

  private static getData() {
    // Retrieve the tags, categories and custom taxonomy
    const taxonomyData = TaxonomyHelper.getAll();

    this.sendMsg(DashboardCommand.setTaxonomyData, taxonomyData);
  }
}
