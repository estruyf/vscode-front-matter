import * as vscode from 'vscode';

/**
 * Panel provider for editing front matter metadata of the current file
 */
export class PanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'frontMatterLite.panel';
  private _view?: vscode.WebviewView;
  private _outputChannel: vscode.OutputChannel;
  private _currentFileUri?: vscode.Uri;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    outputChannel: vscode.OutputChannel
  ) {
    this._outputChannel = outputChannel;
  }

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
        case 'updateField': {
          await this._updateFrontMatterField(data.field, data.value);
          break;
        }
        case 'refresh': {
          await this._loadCurrentFile();
          break;
        }
      }
    });

    // Listen for active editor changes
    vscode.window.onDidChangeActiveTextEditor(() => {
      this._loadCurrentFile();
    });

    // Initial load
    this._loadCurrentFile();
  }

  private async _loadCurrentFile() {
    if (!this._view) {
      return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      this._view.webview.postMessage({
        type: 'noFile'
      });
      return;
    }

    const doc = editor.document;
    const fileName = doc.uri.path.split('/').pop() || '';
    
    // Only process markdown files
    if (!fileName.match(/\.(md|mdx|markdown)$/i)) {
      this._view.webview.postMessage({
        type: 'notMarkdown'
      });
      return;
    }

    this._currentFileUri = doc.uri;

    try {
      const content = doc.getText();
      const frontMatter = this._parseFrontMatter(content);

      this._view.webview.postMessage({
        type: 'fileLoaded',
        fileName,
        frontMatter
      });
    } catch (error) {
      this._outputChannel.appendLine(`Error loading file: ${error}`);
      this._view.webview.postMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Parse front matter from markdown content
   * Note: This is a simplified YAML parser that handles basic key: value pairs
   * Limitations:
   * - Only supports bracket-style arrays: [item1, item2]
   * - Does not support dash-style arrays (- item)
   * - Does not handle multiline values
   * - May not handle special YAML characters in strings
   */
  private _parseFrontMatter(content: string): Record<string, any> {
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---/;
    const match = content.match(frontMatterRegex);
    
    if (!match) {
      return {};
    }

    const frontMatterText = match[1];
    const frontMatter: Record<string, any> = {};

    // Simple YAML parser (for basic key: value pairs)
    const lines = frontMatterText.split('\n');
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const key = line.substring(0, colonIndex).trim();
      let valueStr = line.substring(colonIndex + 1).trim();

      // Handle arrays
      if (valueStr.startsWith('[') && valueStr.endsWith(']')) {
        frontMatter[key] = valueStr.substring(1, valueStr.length - 1)
          .split(',')
          .map(v => v.trim().replace(/^['"]|['"]$/g, ''));
      } else {
        // Remove quotes
        frontMatter[key] = valueStr.replace(/^['"]|['"]$/g, '');
      }
    }

    return frontMatter;
  }

  private async _updateFrontMatterField(field: string, value: any) {
    if (!this._currentFileUri) {
      return;
    }

    try {
      const doc = await vscode.workspace.openTextDocument(this._currentFileUri);
      const content = doc.getText();
      const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---/;
      const match = content.match(frontMatterRegex);

      if (!match) {
        vscode.window.showErrorMessage('No front matter found in file');
        return;
      }

      const frontMatterText = match[1];
      const lines = frontMatterText.split('\n');
      let updated = false;

      // Update the field
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) continue;

        const key = line.substring(0, colonIndex).trim();
        if (key === field) {
          // Format the value
          // Note: String values with special characters should ideally be quoted
          // This simple implementation may not handle all YAML edge cases
          let formattedValue: string;
          if (Array.isArray(value)) {
            formattedValue = `[${value.map(v => `"${v}"`).join(', ')}]`;
          } else if (typeof value === 'string') {
            // Add quotes if value contains special characters
            formattedValue = value.match(/[:\[\]{}]/) ? `"${value}"` : value;
          } else {
            formattedValue = String(value);
          }

          lines[i] = `${key}: ${formattedValue}`;
          updated = true;
          break;
        }
      }

      if (!updated) {
        // Field doesn't exist, add it
        let formattedValue: string;
        if (Array.isArray(value)) {
          formattedValue = `[${value.map(v => `"${v}"`).join(', ')}]`;
        } else if (typeof value === 'string') {
          // Add quotes if value contains special characters
          formattedValue = value.match(/[:\[\]{}]/) ? `"${value}"` : value;
        } else {
          formattedValue = String(value);
        }
        lines.push(`${field}: ${formattedValue}`);
      }

      const newFrontMatter = lines.join('\n');
      const newContent = content.replace(frontMatterRegex, `---\n${newFrontMatter}\n---`);

      // Write the updated content
      const edit = new vscode.WorkspaceEdit();
      edit.replace(
        this._currentFileUri,
        new vscode.Range(0, 0, doc.lineCount, 0),
        newContent
      );

      await vscode.workspace.applyEdit(edit);

      // Reload to show updated values
      await this._loadCurrentFile();

      this._outputChannel.appendLine(`Updated field "${field}" with value: ${value}`);
    } catch (error) {
      const errorMsg = `Error updating front matter: ${error instanceof Error ? error.message : 'Unknown error'}`;
      vscode.window.showErrorMessage(errorMsg);
      this._outputChannel.appendLine(errorMsg);
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Front Matter Panel</title>
  <style>
    body {
      padding: 10px;
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }
    .header {
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    h2 {
      font-size: 14px;
      margin: 0 0 5px 0;
      font-weight: 600;
    }
    .file-name {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
    }
    .field-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 4px;
      color: var(--vscode-foreground);
    }
    input[type="text"],
    input[type="datetime-local"],
    textarea {
      width: 100%;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      padding: 6px 8px;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      box-sizing: border-box;
    }
    input[type="text"]:focus,
    input[type="datetime-local"]:focus,
    textarea:focus {
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: -1px;
    }
    textarea {
      resize: vertical;
      min-height: 60px;
    }
    .tags-input {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      padding: 4px;
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      min-height: 32px;
    }
    .tag {
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      padding: 2px 8px;
      border-radius: 2px;
      font-size: 11px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .tag-remove {
      cursor: pointer;
      font-weight: bold;
    }
    .tag-input {
      border: none;
      background: transparent;
      color: var(--vscode-input-foreground);
      flex: 1;
      min-width: 100px;
      padding: 4px;
      outline: none;
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
    button {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 12px;
      margin-top: 10px;
    }
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
  </style>
</head>
<body>
  <div id="content">
    <div class="empty-state">
      <div class="empty-state-icon">📄</div>
      <p>Open a markdown file to edit its front matter</p>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    let currentFrontMatter = {};
    let currentFileName = '';

    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.type) {
        case 'fileLoaded': {
          currentFrontMatter = message.frontMatter;
          currentFileName = message.fileName;
          renderFrontMatter();
          break;
        }
        case 'noFile': {
          renderEmptyState('No file open');
          break;
        }
        case 'notMarkdown': {
          renderEmptyState('Not a markdown file');
          break;
        }
        case 'error': {
          renderEmptyState(\`Error: \${message.message}\`);
          break;
        }
      }
    });

    function renderEmptyState(message) {
      const contentDiv = document.getElementById('content');
      contentDiv.innerHTML = \`
        <div class="empty-state">
          <div class="empty-state-icon">📄</div>
          <p>\${message}</p>
        </div>
      \`;
    }

    function renderFrontMatter() {
      const contentDiv = document.getElementById('content');
      
      let html = \`
        <div class="header">
          <h2>Front Matter</h2>
          <div class="file-name">\${currentFileName}</div>
        </div>
      \`;

      // Render common fields
      const commonFields = ['title', 'description', 'date', 'tags', 'categories', 'draft'];
      
      for (const field of commonFields) {
        const value = currentFrontMatter[field];
        if (value !== undefined) {
          html += renderField(field, value);
        }
      }

      // Render other fields
      for (const [field, value] of Object.entries(currentFrontMatter)) {
        if (!commonFields.includes(field)) {
          html += renderField(field, value);
        }
      }

      html += \`<button onclick="refreshPanel()">Refresh</button>\`;
      
      contentDiv.innerHTML = html;

      // Add event listeners
      addFieldListeners();
    }

    function renderField(field, value) {
      const fieldId = \`field-\${field}\`;
      
      if (Array.isArray(value)) {
        return \`
          <div class="field-group">
            <label>\${capitalizeFirst(field)}</label>
            <div class="tags-input" id="\${fieldId}">
              \${value.map(tag => \`<span class="tag">\${tag} <span class="tag-remove" onclick="removeTag('\${field}', '\${tag}')">×</span></span>\`).join('')}
              <input type="text" class="tag-input" placeholder="Add \${field}..." onkeydown="handleTagInput(event, '\${field}')">
            </div>
          </div>
        \`;
      } else if (field === 'description') {
        return \`
          <div class="field-group">
            <label>\${capitalizeFirst(field)}</label>
            <textarea id="\${fieldId}" data-field="\${field}">\${value || ''}</textarea>
          </div>
        \`;
      } else if (field === 'date') {
        // Try to format date for datetime-local input
        let dateValue = value;
        if (value) {
          try {
            const d = new Date(value);
            dateValue = d.toISOString().slice(0, 16);
          } catch (e) {
            dateValue = value;
          }
        }
        return \`
          <div class="field-group">
            <label>\${capitalizeFirst(field)}</label>
            <input type="datetime-local" id="\${fieldId}" data-field="\${field}" value="\${dateValue || ''}">
          </div>
        \`;
      } else {
        return \`
          <div class="field-group">
            <label>\${capitalizeFirst(field)}</label>
            <input type="text" id="\${fieldId}" data-field="\${field}" value="\${value || ''}">
          </div>
        \`;
      }
    }

    function capitalizeFirst(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function addFieldListeners() {
      const inputs = document.querySelectorAll('input[data-field], textarea[data-field]');
      inputs.forEach(input => {
        input.addEventListener('change', (e) => {
          const field = e.target.getAttribute('data-field');
          let value = e.target.value;

          // Convert datetime-local to ISO string
          if (e.target.type === 'datetime-local' && value) {
            value = new Date(value).toISOString();
          }

          updateField(field, value);
        });
      });
    }

    function handleTagInput(event, field) {
      if (event.key === 'Enter' && event.target.value.trim()) {
        const tag = event.target.value.trim();
        const currentTags = currentFrontMatter[field] || [];
        
        if (!currentTags.includes(tag)) {
          const newTags = [...currentTags, tag];
          updateField(field, newTags);
          event.target.value = '';
        }
      }
    }

    function removeTag(field, tag) {
      const currentTags = currentFrontMatter[field] || [];
      const newTags = currentTags.filter(t => t !== tag);
      updateField(field, newTags);
    }

    function updateField(field, value) {
      vscode.postMessage({
        type: 'updateField',
        field,
        value
      });
    }

    function refreshPanel() {
      vscode.postMessage({ type: 'refresh' });
    }
  </script>
</body>
</html>`;
  }
}
