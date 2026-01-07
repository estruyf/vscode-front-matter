# Front Matter CMS (Lite)

This is the lite version of Front Matter CMS designed specifically for **virtual workspaces** such as github.dev and vscode.dev.

## What is a Virtual Workspace?

Virtual workspaces allow you to work with code directly in your browser without cloning a repository locally. This includes:

- **github.dev** - Press `.` on any GitHub repository
- **vscode.dev** - Open VS Code in your browser
- **GitHub Codespaces** - Cloud-based development environments

## Features

The lite version provides core content management functionality:

### ✅ Supported Features

- **Register Content Folders** - Right-click on folders in the Explorer to register them as content folders
- **Create Content** - Create new markdown files with front matter
- **View Configuration** - Manage your content folder settings

### ❌ Limited/Unavailable Features

The following features from the full extension are not available in the lite version due to virtual workspace limitations:

- **Dashboard** - Full dashboard UI (under development)
- **Media Management** - File upload and media library
- **Local Server Preview** - Starting/stopping local dev servers
- **Git Integration** - Advanced git operations
- **Custom Scripts** - Running custom Node.js scripts
- **File System Watch** - Automatic content refresh
- **Complex Build Tools** - Framework-specific integrations

## Installation

1. Open a virtual workspace (github.dev or vscode.dev)
2. Install the "Front Matter CMS (Lite)" extension from the Extensions marketplace
3. Start managing your content!

## Usage

### Register a Content Folder

1. In the Explorer, right-click on any folder
2. Select **Front Matter Lite > Register Content Folder (Lite)**
3. Enter a title for the folder
4. The folder is now registered and can be used for content creation

### Create New Content

1. Open the Command Palette (F1 or Ctrl/Cmd+Shift+P)
2. Run **Front Matter Lite: Create Content (Lite)**
3. Select a content folder
4. Enter a file name
5. Your new content file is created with basic front matter

## Configuration

The lite version uses the same configuration as the full extension. You can configure your content folders and content types in VS Code settings:

```json
{
  "frontMatter.content.pageFolders": [
    {
      "title": "Blog Posts",
      "path": "content/blog"
    }
  ]
}
```

## Limitations

This lite version is designed to work within the constraints of virtual workspaces:

- Uses only the VS Code FileSystem API
- No Node.js file system operations
- No external process execution
- Limited to browser-compatible APIs

## Need More Features?

For the full Front Matter CMS experience with all features, install the regular extension in VS Code Desktop:

- [Front Matter CMS on the VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=eliostruyf.vscode-front-matter)
- [Documentation](https://frontmatter.codes)

## Contributing

This is part of the Front Matter CMS project. Visit our [GitHub repository](https://github.com/estruyf/vscode-front-matter) to contribute or report issues.

## License

MIT
