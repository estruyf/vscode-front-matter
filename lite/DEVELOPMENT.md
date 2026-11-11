# Development Guide - Front Matter Lite

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Setup

```bash
cd lite
npm install
```

## Building

### Development Build

```bash
npm run dev
```

This will watch for changes and rebuild automatically.

### Production Build

```bash
npm run build
```

## Testing

### Local Testing

1. Build the extension:
   ```bash
   npm run build
   ```

2. Press F5 in VS Code to open the Extension Development Host

3. Test in a virtual workspace:
   - Open the Command Palette (F1)
   - Run "Open Remote Repository"
   - Enter a GitHub repository URL
   - Test the lite version features

### Testing in github.dev

1. Package the extension:
   ```bash
   npm install -g @vscode/vsce
   vsce package
   ```

2. Navigate to github.dev in your browser
   - Press `.` on any GitHub repository
   - Install the extension manually

## Architecture

The lite version is designed to work without Node.js-specific APIs:

- **No Node.js fs module** - Uses `vscode.workspace.fs` instead
- **No Node.js path module** - Uses `vscode.Uri.joinPath` instead
- **No child_process** - No external script execution
- **Browser-compatible** - Built as a web extension (target: 'webworker')

## Key Differences from Full Extension

| Feature | Full Extension | Lite Version |
|---------|---------------|--------------|
| File Operations | Node.js `fs` | VS Code `workspace.fs` |
| Path Handling | Node.js `path` | `vscode.Uri` |
| Scripts | child_process | Not available |
| Workspace | File system only | Virtual workspaces |
| Dashboard | Full React app | Simplified (planned) |

## Contributing

When adding features to the lite version:

1. Ensure compatibility with virtual workspaces
2. Use only browser-compatible APIs
3. Test in both github.dev and vscode.dev
4. Document any limitations

## Debugging

Enable the Output Channel "Front Matter Lite" to see debug messages:

1. View > Output
2. Select "Front Matter Lite" from the dropdown

## Common Issues

### Extension not loading

- Check the Output channel for errors
- Ensure the extension is built correctly
- Verify the package.json has the correct `browser` entry point

### Features not working in virtual workspace

- Confirm the workspace scheme is not 'file'
- Check browser console for errors
- Verify you're using VS Code FileSystem API

## Resources

- [VS Code Web Extensions Guide](https://code.visualstudio.com/api/extension-guides/web-extensions)
- [Virtual Workspaces Documentation](https://code.visualstudio.com/api/extension-guides/virtual-workspaces)
- [Front Matter Documentation](https://frontmatter.codes)
