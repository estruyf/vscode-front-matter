# Quick Start Guide for Maintainers

This guide helps you quickly test and publish Front Matter Lite.

## Prerequisites

- Node.js 18+
- VS Code installed
- (Optional) vsce installed globally: `npm install -g @vscode/vsce`

## Build and Test (5 minutes)

### 1. Build the Extension

```bash
cd lite
npm install
npm run build
```

Expected output: `dist/extension-web.js` created successfully (~12KB)

### 2. Test in VS Code Extension Development Host

```bash
# From the lite directory, press F5 in VS Code
# OR run:
code --extensionDevelopmentPath=/path/to/lite
```

This opens a new VS Code window with the extension loaded.

### 3. Test Virtual Workspace Features

In the Extension Development Host:

1. **Open Command Palette** (F1)
2. **Run**: "Open Remote Repository"
3. **Enter**: Any GitHub repo URL (e.g., `https://github.com/microsoft/vscode`)
4. **Verify**: 
   - "Front Matter Lite" appears in Activity Bar
   - Dashboard loads
   - Information message about virtual workspace mode appears

### 4. Test Core Features

**Register a Folder:**
1. In Explorer, right-click any folder
2. Select "Front Matter Lite > Register Content Folder (Lite)"
3. Enter a title
4. Check dashboard shows the folder

**Create Content:**
1. Click "Create Content" in dashboard
2. Select folder
3. Enter file name
4. Verify file is created with front matter

## Package for Distribution

### Create VSIX File

```bash
cd lite
vsce package
```

Output: `vscode-front-matter-lite-10.9.0.vsix`

### Test VSIX in github.dev

1. Navigate to any GitHub repo
2. Press `.` to open github.dev
3. Install extension:
   - Extensions → "..." menu → "Install from VSIX..."
   - Select the generated `.vsix` file
4. Test features

## Publish to Marketplace

### Prerequisites

- Azure DevOps account
- Personal Access Token (PAT) with Marketplace publish permissions
- Publisher ID set up

### Publish

```bash
# First time setup
vsce login <publisher-name>

# Publish
cd lite
vsce publish
```

### Update Version

```bash
# In package.json, update version
# Then publish with:
vsce publish minor  # or major, patch
```

## Development Workflow

### Watch Mode

```bash
npm run dev
```

Keep this running while developing. Press F5 to test changes.

### Make Changes

1. Edit source files in `src/`
2. Save (watch mode rebuilds automatically)
3. Reload Extension Development Host (Ctrl+R in dev window)
4. Test changes

### Debug

1. Set breakpoints in source files
2. Press F5
3. Trigger the feature in dev host
4. Debugger stops at breakpoints

## Common Tasks

### Update Front Matter Template

Edit in `src/extension.ts` (~line 170):

```typescript
const content = `---
title: ${fileName}
description: 
date: ${date}
tags: []
draft: false  // Add new field
---`;
```

### Change Dashboard UI

Edit `src/DashboardProvider.ts` `_getHtmlForWebview()` method.

### Add New Command

1. Register in `package.json` `contributes.commands`
2. Implement in `src/extension.ts`
3. Add to menu if needed

### Modify Configuration Schema

Update `package.json` `contributes.configuration.properties`

## Troubleshooting

### Build Fails

```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Extension Not Loading

Check:
1. `dist/extension-web.js` exists
2. `package.json` has correct `browser` entry point
3. Output channel for errors

### Virtual Workspace Not Detected

Ensure workspace scheme is not 'file':
- github.dev uses 'vscode-vfs'
- Check Output channel for detection message

## Quality Checks

Before publishing:

```bash
# Build
npm run build

# Check size (should be ~12KB)
ls -lh dist/extension-web.js

# Lint (if you add linting)
npm run lint

# Package
vsce package
```

## Integration with Main Extension

The lite version is independent but uses compatible configuration:

```json
{
  "frontMatter.content.pageFolders": [
    { "title": "Blog", "path": "content/blog" }
  ]
}
```

This works in both full and lite versions.

## Support

For issues:
1. Check Output channel "Front Matter Lite"
2. Check browser console (F12 in github.dev)
3. Review error messages
4. Check GitHub issues

## Next Steps

After testing:
1. ✅ Verify features work
2. ✅ Test in github.dev
3. ✅ Get user feedback
4. 📋 Iterate on improvements
5. 🚀 Publish to marketplace
6. 📢 Announce to users

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Build for development (watch mode)
npm run dev

# Package extension
vsce package

# Publish extension
vsce publish

# Test in VS Code
code --extensionDevelopmentPath=$(pwd)
```

## Files to Review

- `package.json` - Extension manifest
- `src/extension.ts` - Main logic
- `src/DashboardProvider.ts` - UI
- `README.md` - User documentation

That's it! You're ready to test and publish Front Matter Lite. 🚀
