# VSCode Front Matter Helpers

> **Info**: Extension is still in development, but can already be tested out.

## Available commands:

**Front Matter: Create <tag | category>**
  - Creates a new <tag | category> and allows you to automatically include it into your post

![Create tag or category](./assets/create-tag-category.gif)
  
**Front Matter: Insert <tags | categories>**
  - Inserts a selected <tags | categories> into the front matter of your article/post/...

![Insert tags or categories](./assets/insert-tag-category.gif)

**Front Matter: Export all tags & categories to your settings**
  - Export all the already used tags & categories in your articles/posts/... to your user settings

## Where is the data stored?

The tags and categories are stored in the project VSCode user settings. You can find them back under: `.vscode/settings.json`.

```json
{
  "frontMatter.taxonomy.tags": [],
  "frontMatter.taxonomy.categories": []
}
```

## Feedback / issues / ideas

Please submit them via creating an issue in the project repository: [issue list](https://github.com/estruyf/vscode-front-matter/issues).