import { join } from "path";
import { Uri, workspace } from "vscode";
import { Folders } from "../../commands/Folders";
import { DEFAULT_FILE_TYPES, SETTING_CONTENT_SUPPORTED_FILETYPES, SETTING_TAXONOMY_CATEGORIES, SETTING_TAXONOMY_CUSTOM, SETTING_TAXONOMY_TAGS } from "../../constants";
import { DashboardCommand } from "../../dashboardWebView/DashboardCommand";
import { DashboardMessage } from "../../dashboardWebView/DashboardMessage";
import { Settings } from "../../helpers";
import { CustomTaxonomy } from "../../models";
import { BaseListener } from "./BaseListener";


export class TaxonomyListener extends BaseListener {

  /**
   * Process the messages for the dashboard views
   * @param msg 
   */
  public static process(msg: { command: DashboardMessage, data: any }) {
    super.process(msg);

    switch(msg.command) {
      case DashboardMessage.getTaxonomyData:
        this.getData();
        break;
    }
  }

  private static async getData() {
    // Retrieve the tags, categories and custom taxonomy
    const taxonomyData = {
      tags: Settings.get<string[]>(SETTING_TAXONOMY_TAGS) || [],
      categories: Settings.get<string[]>(SETTING_TAXONOMY_CATEGORIES) || [],
      customTaxonomy: Settings.get<CustomTaxonomy[]>(SETTING_TAXONOMY_CUSTOM) || []
    };

    const supportedFiles = Settings.get<string[]>(SETTING_CONTENT_SUPPORTED_FILETYPES) || DEFAULT_FILE_TYPES;
    const fileExtensions = supportedFiles.map(fileType => `${fileType.startsWith('.') ? '' : '.'}${fileType}`);

    const folders = Folders.get();
    const projectName = Folders.getProjectFolderName();

    let files: Uri[] = [];

    for (const folder of folders) {
      let projectStart = folder.path.split(projectName).pop();
      projectStart = projectStart || "";
      projectStart = projectStart?.replace(/\\/g, '/');
      projectStart = projectStart?.startsWith('/') ? projectStart.substring(1) : projectStart;

      for (const fileExtension of fileExtensions) {
        const crntFiles = await workspace.findFiles(join(projectStart, folder.excludeSubdir ? '/' : '**/', `*${fileExtension}`));
        if (crntFiles && crntFiles.length > 0) {
          files = [...files, ...crntFiles];
        }
      }
    }

    console.log(files)

    this.sendMsg(DashboardCommand.setTaxonomyData, taxonomyData);
  }
}