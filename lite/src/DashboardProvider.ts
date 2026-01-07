import * as vscode from 'vscode';

export class DashboardProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'frontMatterLite.dashboard';
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'createContent': {
          await vscode.commands.executeCommand('frontMatter.lite.createContent');
          break;
        }
        case 'registerFolder': {
          vscode.window.showInformationMessage(
            'Please right-click on a folder in the Explorer and select "Front Matter Lite > Register Content Folder"'
          );
          break;
        }
        case 'refreshContent': {
          await this._refreshContent();
          break;
        }
        case 'openFile': {
          const uri = vscode.Uri.parse(data.uri);
          const doc = await vscode.workspace.openTextDocument(uri);
          await vscode.window.showTextDocument(doc);
          break;
        }
      }
    });

    // Initial load
    this._refreshContent();
  }

  private async _refreshContent() {
    if (!this._view) {
      return;
    }

    const config = vscode.workspace.getConfiguration('frontMatter');
    const pageFolders = config.get<Array<{ title: string; path: string }>>('content.pageFolders') || [];

    const contentFiles: Array<{ uri: string; name: string; folder: string }> = [];

    // Scan all registered folders for markdown files
    for (const folder of pageFolders) {
      try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) continue;

        const folderUri = vscode.Uri.joinPath(workspaceFolders[0].uri, folder.path);
        const pattern = new vscode.RelativePattern(folderUri, '**/*.{md,mdx,markdown}');
        const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**', 100);

        for (const file of files) {
          const relativePath = vscode.workspace.asRelativePath(file);
          const fileName = relativePath.split('/').pop() || '';
          contentFiles.push({
            uri: file.toString(),
            name: fileName,
            folder: folder.title
          });
        }
      } catch (error) {
        console.error(`Error scanning folder ${folder.path}:`, error);
      }
    }

    // Send data to webview
    this._view.webview.postMessage({
      type: 'updateContent',
      folders: pageFolders,
      files: contentFiles
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Front Matter Lite</title>
  <style>
    body {
      padding: 10px;
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }
    .header {
      margin-bottom: 20px;
    }
    h2 {
      font-size: 18px;
      margin: 0 0 10px 0;
    }
    .button-group {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
    }
    button {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 8px 12px;
      cursor: pointer;
      border-radius: 2px;
    }
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-weight: bold;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .folder-list, .file-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .folder-item, .file-item {
      padding: 8px;
      margin-bottom: 4px;
      background: var(--vscode-list-inactiveSelectionBackground);
      border-radius: 2px;
    }
    .file-item {
      cursor: pointer;
    }
    .file-item:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .file-name {
      font-weight: 500;
    }
    .file-folder {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      margin-top: 2px;
    }
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--vscode-descriptionForeground);
    }
    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>Front Matter Lite</h2>
    <div class="button-group">
      <button id="createBtn">Create Content</button>
      <button id="registerBtn">Register Folder</button>
      <button id="refreshBtn">Refresh</button>
    </div>
  </div>

  <div id="content">
    <div class="empty-state">
      <div class="empty-state-icon">📝</div>
      <p>Loading content...</p>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    document.getElementById('createBtn').addEventListener('click', () => {
      vscode.postMessage({ type: 'createContent' });
    });

    document.getElementById('registerBtn').addEventListener('click', () => {
      vscode.postMessage({ type: 'registerFolder' });
    });

    document.getElementById('refreshBtn').addEventListener('click', () => {
      vscode.postMessage({ type: 'refreshContent' });
    });

    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.type) {
        case 'updateContent': {
          updateContent(message.folders, message.files);
          break;
        }
      }
    });

    function updateContent(folders, files) {
      const contentDiv = document.getElementById('content');
      
      if (folders.length === 0) {
        contentDiv.innerHTML = \`
          <div class="empty-state">
            <div class="empty-state-icon">📁</div>
            <p>No content folders registered</p>
            <p style="font-size: 12px;">Click "Register Folder" to get started</p>
          </div>
        \`;
        return;
      }

      let html = '<div class="section"><div class="section-title">Content Folders</div><ul class="folder-list">';
      folders.forEach(folder => {
        html += \`<li class="folder-item">\${folder.title} <span style="color: var(--vscode-descriptionForeground);">(\${folder.path})</span></li>\`;
      });
      html += '</ul></div>';

      if (files.length > 0) {
        html += '<div class="section"><div class="section-title">Recent Content</div><ul class="file-list">';
        files.forEach(file => {
          html += \`
            <li class="file-item" data-uri="\${file.uri}">
              <div class="file-name">\${file.name}</div>
              <div class="file-folder">\${file.folder}</div>
            </li>
          \`;
        });
        html += '</ul></div>';
      } else {
        html += '<div class="empty-state"><p>No content files found</p></div>';
      }

      contentDiv.innerHTML = html;

      // Add click handlers to files
      document.querySelectorAll('.file-item').forEach(item => {
        item.addEventListener('click', () => {
          const uri = item.getAttribute('data-uri');
          vscode.postMessage({ type: 'openFile', uri });
        });
      });
    }
  </script>
</body>
</html>`;
  }
}
