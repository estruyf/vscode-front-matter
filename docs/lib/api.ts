import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'

type ContentType = "docs" | "changelog";

const postsDirectory = join(process.cwd(), 'content');

export function getPostSlugs(type: ContentType) {
  return fs.readdirSync(join(postsDirectory, type)).filter(f => f.endsWith(`.md`))
}

export function getPostByFilename(type: ContentType, crntFile: string, fields: string[] = []) {
  
  const realSlug = crntFile.replace(/\.md$/, '');
  const fullPath = join(postsDirectory, type, `${realSlug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const items: any = {}

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === 'content') {
      items[field] = content
    }

    if (field === 'fileName') {
      items[field] = realSlug
    }

    if (data[field]) {
      items[field] = data[field]
    }
    
    if (field === 'slug') {
      items[field] = data['slug'] || realSlug
    }
  })

  return items
}

export function getAllPosts(type: ContentType, fields: string[] = []) {
  const fileNames = getPostSlugs(type);
  
  const posts = fileNames
    .map((fileName) => getPostByFilename(type, fileName, fields))
    // sort posts by date in descending order
    .sort((post1, post2) => ((post1 as any)?.date > (post2 as any)?.date ? -1 : 1));

  return posts
}