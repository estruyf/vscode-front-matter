const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

(async () => {
  const baseUrl = `https://frontmatter.codes`;
  
  // Ignore Next.js specific files (e.g., _app.js) and API routes.
  let pages = fs
  .readdirSync(path.join(__dirname, '../pages'))
  .filter((staticPage) => {
    return ![
      "_app.tsx",
      "_document.tsx",
      "_error.tsx",
      "sitemap.xml.tsx",
      "index.tsx",
      "404",
      "api"
    ].includes(staticPage);
  })
  .map((staticPagePath) => ({
    lastModified: new Date().toISOString(),
    slug: `${baseUrl}/${staticPagePath}`
  }));

  const mdDir = path.join(process.cwd(), 'content');
  const mdFiles = fs.readdirSync(path.join(mdDir, 'docs')).filter(f => f.endsWith(`.md`));
  const mdPages = mdFiles.map((fileName) => {
    const fullPath = path.join(mdDir, 'docs', `${fileName}`)
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);
    return {
      lastModified: data["lastmod"] || new Date().toISOString(),
      slug: `${baseUrl}/docs/${data['slug'] || fileName.split('.').slice(0, -1).join('.')}`
    };
  });

  pages = [...pages, ...mdPages];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
  <loc>${baseUrl}</loc>
  <lastmod>${new Date().toISOString()}</lastmod>
  <changefreq>daily</changefreq>
  <priority>1.0</priority>
  </url>
  ${pages
    .map((page) => {
      return `
      <url>
      <loc>${`${page.slug}`}</loc>
      <lastmod>${page.lastModified}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>1.0</priority>
      </url>
      `;
    })
    .join('')}
    </urlset>
    `;
    
    fs.writeFileSync('public/sitemap.xml', sitemap);
  })();