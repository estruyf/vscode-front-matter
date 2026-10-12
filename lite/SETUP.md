# Front Matter Lite Setup Guide

This guide will help you set up and start using Front Matter Lite in virtual workspaces.

## Quick Start

### For Users (github.dev / vscode.dev)

1. **Open a repository in github.dev:**
   - Navigate to any GitHub repository
   - Press `.` (period key)
   - OR change `github.com` to `github.dev` in URL

2. **Install Front Matter Lite:**
   - Currently in development, will be available on the VS Code Marketplace
   - For now, request the `.vsix` file from the project maintainers

3. **Get Started:**
   - Look for "Front Matter Lite" in the Activity Bar (left sidebar)
   - Click to open the dashboard

### For Developers

1. **Clone and Setup:**
   ```bash
   git clone https://github.com/estruyf/vscode-front-matter.git
   cd vscode-front-matter/lite
   npm install
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Test:**
   - Press F5 in VS Code to open Extension Development Host
   - OR package and install manually in github.dev

## First Time Setup

### 1. Register Your First Content Folder

After installing, you'll need to tell Front Matter Lite where your content is:

**Method A: Using Explorer Context Menu**
1. Open the Explorer view
2. Right-click on a folder containing your markdown files
3. Select **Front Matter Lite > Register Content Folder (Lite)**
4. Enter a descriptive title (e.g., "Blog Posts")
5. Click OK

**Method B: Manual Configuration**
1. Open Settings (Ctrl/Cmd + ,)
2. Search for "frontMatter.content.pageFolders"
3. Click "Edit in settings.json"
4. Add your folders:
   ```json
   {
     "frontMatter.content.pageFolders": [
       {
         "title": "Blog Posts",
         "path": "content/blog"
       },
       {
         "title": "Documentation",
         "path": "docs"
       }
     ]
   }
   ```

### 2. Verify Setup

1. Open the Front Matter Lite dashboard
2. You should see your registered folders
3. Click "Refresh" to load existing content files

## Usage

### Creating New Content

1. **Via Dashboard:**
   - Open Front Matter Lite dashboard
   - Click "Create Content" button
   - Select a content folder
   - Enter a file name (without .md extension)
   - File is created and opened

2. **Via Command Palette:**
   - Press F1 or Ctrl/Cmd+Shift+P
   - Type "Front Matter Lite: Create Content"
   - Follow the prompts

### Viewing Content

1. Open the Front Matter Lite dashboard
2. Registered folders are listed at the top
3. Recent content files are shown below
4. Click any file to open it

### Editing Front Matter

Currently, front matter editing is done directly in the markdown file:

```markdown
---
title: My Post
description: A description of my post
date: 2024-01-07T10:00:00.000Z
tags: [blog, tutorial]
---

# My Post Content

Your content here...
```

## Configuration

### Basic Settings

Add to your workspace `.vscode/settings.json`:

```json
{
  "frontMatter.content.pageFolders": [
    {
      "title": "Blog",
      "path": "content/blog"
    }
  ],
  "frontMatter.taxonomy.contentTypes": [
    {
      "name": "default",
      "fields": [
        {
          "title": "Title",
          "name": "title",
          "type": "string"
        },
        {
          "title": "Description",
          "name": "description",
          "type": "string"
        },
        {
          "title": "Date",
          "name": "date",
          "type": "datetime"
        },
        {
          "title": "Tags",
          "name": "tags",
          "type": "tags"
        }
      ]
    }
  ]
}
```

### Advanced Configuration

For more control over your content:

```json
{
  "frontMatter.content.pageFolders": [
    {
      "title": "Blog Posts",
      "path": "content/blog",
      "excludeSubdir": false
    },
    {
      "title": "Documentation",
      "path": "docs",
      "excludeSubdir": true
    }
  ]
}
```

## Workflow Integration

### Hugo Example

```
my-hugo-site/
├── content/
│   ├── blog/          <- Register this folder
│   └── docs/          <- And this one
├── static/
└── config.toml
```

### Jekyll Example

```
my-jekyll-site/
├── _posts/            <- Register this folder
├── _pages/
└── _config.yml
```

### Next.js Example

```
my-nextjs-site/
├── content/           <- Register this folder
│   └── blog/
├── pages/
└── package.json
```

## Troubleshooting

### Extension Not Showing Up

1. **Check Extension is Installed:**
   - Open Extensions view (Ctrl/Cmd+Shift+X)
   - Search for "Front Matter Lite"
   - Verify it's installed and enabled

2. **Check Output Channel:**
   - View > Output
   - Select "Front Matter Lite" from dropdown
   - Look for activation message

### No Folders Showing in Dashboard

1. **Verify folders are registered:**
   - Check settings: `frontMatter.content.pageFolders`
   - Ensure paths are relative to workspace root
   - Click "Refresh" button in dashboard

2. **Check workspace:**
   - Ensure you have a workspace/folder open
   - Verify the workspace contains the specified paths

### Can't Create Content

1. **Verify folder is registered:**
   - At least one folder must be in `frontMatter.content.pageFolders`

2. **Check permissions:**
   - Ensure you have write access to the repository
   - In github.dev, you need to fork or have write access

### Files Not Appearing

1. **Click "Refresh":**
   - Dashboard doesn't auto-update
   - Click the "Refresh" button

2. **Check file extensions:**
   - Only .md, .mdx, and .markdown files are shown
   - Check your files have the correct extension

## Best Practices

### 1. Organize Content by Type

```json
{
  "frontMatter.content.pageFolders": [
    { "title": "Blog Posts", "path": "content/blog" },
    { "title": "Tutorials", "path": "content/tutorials" },
    { "title": "Documentation", "path": "docs" }
  ]
}
```

### 2. Use Consistent Front Matter

Define a template for all your content:

```markdown
---
title: Post Title
description: Brief description
date: 2024-01-07T10:00:00.000Z
tags: []
categories: []
draft: false
---
```

### 3. Commit Configuration

Add `.vscode/settings.json` to your repository so all team members have the same setup.

### 4. Regular Backups

Even though you're in a virtual workspace:
- Commit changes regularly
- Push to GitHub frequently
- Use branches for experiments

## Getting Help

- **Documentation:** [https://frontmatter.codes](https://frontmatter.codes)
- **Issues:** [GitHub Issues](https://github.com/estruyf/vscode-front-matter/issues)
- **Discussions:** [GitHub Discussions](https://github.com/estruyf/vscode-front-matter/discussions)

## Next Steps

1. **Explore the Dashboard:**
   - Familiarize yourself with the interface
   - Try creating a few test posts

2. **Customize Front Matter:**
   - Define content types that match your needs
   - Add custom fields

3. **Share with Team:**
   - Commit your configuration
   - Share the setup guide with collaborators

4. **Upgrade to Full Version:**
   - For advanced features, install the full Front Matter extension in VS Code Desktop
   - Enjoy media management, custom scripts, and more
