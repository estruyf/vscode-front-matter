#!/usr/bin/env bash
# Create a git-tracked sample Front Matter workspace that exercises most field types and folder setups.
# Usage: make-workspace.sh <dir>
set -euo pipefail
W="$1"
rm -rf "$W"
mkdir -p "$W/content/blog" "$W/content/blog-archive" "$W/content/news" "$W/content/docs/a" "$W/content/docs/b" \
  "$W/public/images" "$W/scripts" "$W/src" "$W/data" "$W/.frontmatter/templates"

cat > "$W/frontmatter.json" <<'EOF'
{
  "$schema": "https://beta.frontmatter.codes/frontmatter.schema.json",
  // Content folders for the test site
  "frontMatter.content.pageFolders": [
    { "title": "blog", "path": "[[workspace]]/content/blog" },
    { "title": "archive", "path": "[[workspace]]/content/blog-archive" },
    { "title": "docs", "path": "[[workspace]]/content/docs/*" }
  ],
  "frontMatter.content.publicFolder": "public",
  /* Content types */
  "frontMatter.taxonomy.contentTypes": [
    {
      "name": "default",
      "pageBundle": false,
      "clearEmpty": true,
      "fields": [
        { "title": "Title", "name": "title", "type": "string" },
        { "title": "Description", "name": "description", "type": "string" },
        { "title": "Summary", "name": "summary", "type": "string", "wysiwyg": "markdown" },
        { "title": "Slug", "name": "slug", "type": "slug", "editable": true },
        { "title": "Weight", "name": "weight", "type": "number", "numberOptions": { "isDecimal": true } },
        { "title": "Tags", "name": "tags", "type": "tags" },
        {
          "title": "SEO", "name": "seo", "type": "fields",
          "fields": [
            { "title": "Meta", "name": "meta", "type": "fields", "fields": [
              { "title": "Meta title", "name": "title", "type": "string" }
            ] },
            { "title": "Canonical", "name": "canonical", "type": "string" }
          ]
        }
      ]
    },
    { "name": "custom-type", "fields": [ { "title": "Title", "name": "title", "type": "string" } ] }
  ],
  "frontMatter.custom.scripts": [
    { "title": "Echo args", "script": "./scripts/echo.js", "command": "node" }
  ],
  "frontMatter.taxonomy.tags": ["alpha", "beta", "gamma"]
}
EOF

mkpage() {
  cat > "$1" <<EOF
---
title: $2
description: Description of $2
summary: |-
  First paragraph of $2.

  - item one
  - item two
slug: $3
weight: 1
tags:
  - zeta
  - alpha
seo:
  meta:
    title: Meta $2
  canonical: https://example.com/$3
---

Body of $2. Shared keyword: frontmatterzebra.
EOF
}

mkpage "$W/content/blog/post-1.md" "Post one" post-one
for i in $(seq 2 25); do mkpage "$W/content/blog/post-$i.md" "Post $i" "post-$i"; done
mkpage "$W/content/blog-archive/old-1.md" "Old one" old-one
# A file name that runs a command when it ends up in a shell string
mkpage "$W/content/blog/\$(touch fm-pwned).md" "Crafted name" crafted
printf -- '---\ntitle: Doc A\n---\n' > "$W/content/docs/a/doc.md"
printf -- '---\ntitle: Doc B\n---\n' > "$W/content/docs/b/doc.md"

# Writes the arguments it receives to <workspace>/script-args.json
cat > "$W/scripts/echo.js" <<'EOF'
const fs = require('fs');
const path = require('path');
fs.writeFileSync(path.join(process.argv[2], 'script-args.json'), JSON.stringify(process.argv.slice(2), null, 2));
console.log('echo done');
EOF

echo 'export const x: number = 1;' > "$W/src/app.ts"
printf '\x89PNG\r\n\x1a\n' > "$W/public/images/public-logo.png"
cat > "$W/.frontmatter/templates/article.md" <<'EOF'
---
title:
draft: true
weight: 1
image:
---
EOF

cd "$W"
git init -q
git add -A
git -c user.email=test@example.com -c user.name=test commit -qm init
echo "Sample workspace created in $W"
