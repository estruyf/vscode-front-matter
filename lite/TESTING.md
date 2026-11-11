# Testing Front Matter Lite

This guide explains how to test the Front Matter Lite extension in various environments.

## Prerequisites

- Built extension (run `npm run build`)
- VS Code installed locally OR
- Access to github.dev/vscode.dev

## Testing Methods

### 1. Testing in VS Code Extension Development Host

This is the fastest way to test during development:

1. Open the lite folder in VS Code
2. Build the extension: `npm run build`
3. Press F5 to launch Extension Development Host
4. In the new window, open a folder or workspace
5. The Front Matter Lite sidebar should appear in the Activity Bar

**To test virtual workspace features:**

1. In Extension Development Host, open Command Palette (F1)
2. Run "Open Remote Repository"
3. Enter a GitHub repository URL (e.g., `https://github.com/username/repo`)
4. The extension will activate in virtual workspace mode

### 2. Testing in github.dev

1. Package the extension:
   ```bash
   npm install -g @vscode/vsce
   vsce package
   ```

2. This creates a `.vsix` file

3. Navigate to github.dev:
   - Go to any GitHub repository
   - Press `.` (period key)
   - OR change `github.com` to `github.dev` in the URL

4. Install the extension:
   - Click Extensions icon in Activity Bar
   - Click "..." menu
   - Choose "Install from VSIX..."
   - Select the generated `.vsix` file

5. Test the features

### 3. Testing in vscode.dev

Similar to github.dev:

1. Go to https://vscode.dev
2. Open a folder or repository
3. Install the extension from VSIX (as above)

## Test Scenarios

### Scenario 1: Register a Content Folder

1. Open a repository with markdown files
2. In Explorer, right-click on a folder
3. Select "Front Matter Lite > Register Content Folder (Lite)"
4. Enter a title
5. Verify:
   - Success message appears
   - Folder appears in Dashboard
   - Configuration is saved

### Scenario 2: Create Content

1. Ensure at least one folder is registered
2. Click "Create Content" in the Dashboard OR
3. Run Command: "Front Matter Lite: Create Content (Lite)"
4. Select a content folder
5. Enter a file name
6. Verify:
   - File is created with front matter
   - File opens in editor
   - Front matter includes title, date, tags

### Scenario 3: View Content in Dashboard

1. Register a folder with existing markdown files
2. Click "Refresh" in the Dashboard
3. Verify:
   - Files are listed
   - File names and folders are shown
   - Clicking a file opens it

### Scenario 4: Virtual Workspace Detection

1. Open repository via "Open Remote Repository" or github.dev
2. Check Output channel "Front Matter Lite"
3. Verify message: "Running in virtual workspace mode"
4. Verify information message appears about limited features

## Expected Behavior

### Working Features ✅

- ✅ Register content folders
- ✅ Create new content files
- ✅ View registered folders in dashboard
- ✅ List content files in dashboard
- ✅ Open files from dashboard
- ✅ Basic front matter template
- ✅ Virtual workspace detection

### Known Limitations ❌

- ❌ Cannot edit front matter in UI (use editor)
- ❌ No media upload/management
- ❌ No git integration
- ❌ No custom scripts
- ❌ No file system watch (manual refresh needed)
- ❌ Limited to 100 files per folder

## Debugging

### Enable Logging

1. View > Output
2. Select "Front Matter Lite" from dropdown
3. Check for error messages

### Common Issues

**Extension not appearing:**
- Check that it's built: `npm run build`
- Verify `dist/extension-web.js` exists
- Check package.json has correct `browser` entry point

**Commands not working:**
- Check Output channel for errors
- Verify workspace has folders
- Ensure running in compatible environment

**Dashboard not loading:**
- Check browser console (if in github.dev/vscode.dev)
- Verify webview is enabled
- Check for Content Security Policy errors

### Browser Console (github.dev/vscode.dev)

1. Press F12 to open Developer Tools
2. Check Console tab for JavaScript errors
3. Check Network tab for failed requests

## Manual Testing Checklist

- [ ] Extension activates in virtual workspace
- [ ] Dashboard appears in Activity Bar
- [ ] Can register a folder via context menu
- [ ] Registered folders appear in dashboard
- [ ] Can create content via command
- [ ] Content file has correct front matter
- [ ] Files appear in dashboard after refresh
- [ ] Clicking file in dashboard opens it
- [ ] Virtual workspace mode detected
- [ ] Configuration persists
- [ ] Works in github.dev
- [ ] Works in vscode.dev
- [ ] Works in local VS Code

## Performance Testing

Test with different repository sizes:

1. Small repo (<10 files)
2. Medium repo (10-50 files)
3. Large repo (50-100 files)

Verify:
- Dashboard loads within 2 seconds
- File creation is responsive
- No UI freezing

## Reporting Issues

When reporting issues, include:

1. Environment (github.dev, vscode.dev, local)
2. Workspace type (virtual or file)
3. Steps to reproduce
4. Output channel logs
5. Browser console errors (if applicable)
6. Extension version

## Next Steps

After testing:

1. Document any issues found
2. Verify all test scenarios pass
3. Test in different browsers (Chrome, Firefox, Edge, Safari)
4. Get feedback from users
5. Iterate on improvements
