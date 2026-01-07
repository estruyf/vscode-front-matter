# Changelog - Front Matter Lite

All notable changes to the Front Matter Lite extension will be documented in this file.

## [Unreleased]

### Added
- Initial release of Front Matter Lite for virtual workspaces
- Dashboard webview with folder and file listing
- Register content folders via context menu
- Create content command
- Basic front matter template
- Virtual workspace detection
- Support for github.dev and vscode.dev
- File operations using VS Code FileSystem API
- Configuration persistence
- Content file browser in dashboard

### Features
- ✅ Register content folders
- ✅ Create new markdown files with front matter
- ✅ View registered folders
- ✅ List content files
- ✅ Open files from dashboard
- ✅ Manual refresh

### Limitations
- Dashboard is read-only (no inline editing)
- Limited to 100 files per folder
- No file system watch (manual refresh required)
- No media management
- No git integration
- No custom scripts
- No local server preview

## Architecture

Built as a web extension with:
- Target: `webworker` for browser compatibility
- No Node.js dependencies (fs, path, child_process)
- Uses VS Code FileSystem API (`vscode.workspace.fs`)
- Uses `vscode.Uri` for path operations
- Webview-based dashboard UI

## Roadmap

Future enhancements planned:
- [ ] Inline front matter editing in dashboard
- [ ] Better content filtering and search
- [ ] Tags and categories management
- [ ] Simple content preview
- [ ] Export content list
- [ ] Keyboard shortcuts
- [ ] Better error handling
- [ ] Content statistics

## Version 1.0.0 Goals

Before releasing v1.0.0:
- [ ] Complete testing in github.dev
- [ ] Complete testing in vscode.dev
- [ ] User feedback incorporated
- [ ] Documentation complete
- [ ] Bug fixes for all critical issues
- [ ] Performance optimization
