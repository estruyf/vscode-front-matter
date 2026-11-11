import { join, dirname, extname, basename } from 'path';
import { Uri, workspace } from 'vscode';
import { ContentFolder } from '../models';
import { parseWinPath } from './parseWinPath';
import { PagesParser } from '../services/PagesParser';
import { Page } from '../dashboardWebView/models/Page';

export interface LinkValidationResult {
  url: string;
  exists: boolean;
  /** Resolved absolute file path — only set for internal links that map to a file */
  filePath?: string;
  internal: boolean;
}

interface ExternalCacheEntry {
  ok: boolean;
  checkedAt: number;
}

const EXTERNAL_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export class LinkValidator {
  private static externalCache = new Map<string, ExternalCacheEntry>();

  /**
   * Validate internal link URLs against the workspace file system.
   * Returns results with `filePath` set for links that resolve to a file
   * so the UI can offer a click-to-open action.
   */
  public static async validateInternalLinks(
    urls: string[],
    currentFilePath: string,
    folders: ContentFolder[]
  ): Promise<LinkValidationResult[]> {
    const results: LinkValidationResult[] = [];
    const pages = await LinkValidator.getInternalPages();
    const slugIndex = LinkValidator.buildSlugIndex(pages, folders);

    for (const url of urls) {
      const cleanUrl = LinkValidator.normalizeInternalUrl(url);
      if (!cleanUrl) {
        continue;
      }

      const filePath = await LinkValidator.resolveToFilePath(
        cleanUrl,
        currentFilePath,
        folders,
        slugIndex
      );

      if (filePath) {
        results.push({ url, exists: true, filePath, internal: true });
      } else {
        results.push({ url, exists: false, internal: true });
      }
    }

    return results;
  }

  /**
   * Validate external HTTP(S) URLs via HEAD requests, falling back to GET (with caching).
   */
  public static async validateExternalLinks(urls: string[]): Promise<LinkValidationResult[]> {
    const results: LinkValidationResult[] = [];

    for (const url of urls) {
      const cached = LinkValidator.externalCache.get(url);
      if (cached && Date.now() - cached.checkedAt < EXTERNAL_CACHE_TTL_MS) {
        results.push({ url, exists: cached.ok, internal: false });
        continue;
      }

      const ok = await LinkValidator.isReachable(url);
      LinkValidator.externalCache.set(url, { ok, checkedAt: Date.now() });
      results.push({ url, exists: ok, internal: false });
    }

    return results;
  }

  /**
   * Ensure a resolved path stays within the given root to prevent path traversal.
   */
  private static isWithinRoot(resolvedPath: string, root: string): boolean {
    const normalizedResolved = parseWinPath(resolvedPath);
    const normalizedRoot = parseWinPath(root).replace(/\/?$/, '/');
    return normalizedResolved.startsWith(normalizedRoot);
  }

  /**
   * Resolve a link URL to an absolute file path.
   *
   * Resolution order:
   * 1. Relative paths (./foo, ../foo) → resolve against current file's directory,
   *    clamped to the workspace root.
   * 2. Absolute paths (/foo/bar) → try to match against a content folder's previewPath,
   *    then fall back to the workspace root.
   *
   * Paths that resolve outside the workspace are rejected to prevent traversal.
   */
  private static async resolveToFilePath(
    url: string,
    currentFilePath: string,
    folders: ContentFolder[],
    slugIndex: Map<string, string>
  ): Promise<string | undefined> {
    const wsFolder = workspace.workspaceFolders?.[0]?.uri.fsPath;
    const normalizedUrl = parseWinPath(url);
    const isRelative =
      normalizedUrl.startsWith('./') ||
      normalizedUrl.startsWith('../') ||
      !normalizedUrl.startsWith('/');

    // Slug-like links ("post-name", "/blog/post-name") are first resolved
    // against indexed internal pages, then we fall back to file probing.
    if (!normalizedUrl.startsWith('./') && !normalizedUrl.startsWith('../')) {
      const resolvedFromSlug = LinkValidator.resolveBySlug(normalizedUrl, folders, slugIndex);
      if (resolvedFromSlug) {
        return resolvedFromSlug;
      }
    }

    if (isRelative) {
      const base = dirname(currentFilePath);
      const resolved = join(base, normalizedUrl);
      // Reject paths that escape the workspace
      if (wsFolder && !LinkValidator.isWithinRoot(resolved, wsFolder)) {
        return undefined;
      }
      return await LinkValidator.findContentFile(resolved);
    }

    // Absolute path — try content folders first (previewPath → filesystem path)
    const sortedFolders = [...folders].sort(
      (a, b) => (b.previewPath?.length ?? 0) - (a.previewPath?.length ?? 0)
    );

    for (const folder of sortedFolders) {
      const preview = folder.previewPath ? parseWinPath(folder.previewPath) : '';
      if (!preview) {
        continue;
      }
      if (normalizedUrl.startsWith(preview)) {
        // Strip only alphanumeric path segments — reject traversal sequences
        const relativePart = normalizedUrl
          .slice(preview.length)
          .replace(/^\//, '')
          .replace(/\.\.\//g, ''); // strip any traversal attempts
        const folderPath = parseWinPath(folder.path);
        const candidate = join(folderPath, relativePart);
        // Confirm it stays inside the folder
        if (!LinkValidator.isWithinRoot(candidate, folderPath)) {
          continue;
        }
        const resolved = await LinkValidator.findContentFile(candidate);
        if (resolved) {
          return resolved;
        }
      }
    }

    // Fall back: try resolving against workspace root
    if (wsFolder) {
      const sanitizedUrl = normalizedUrl.replace(/\.\.\//g, '');
      const candidate = join(wsFolder, sanitizedUrl);
      if (!LinkValidator.isWithinRoot(candidate, wsFolder)) {
        return undefined;
      }
      const resolved = await LinkValidator.findContentFile(candidate);
      if (resolved) {
        return resolved;
      }
    }

    return undefined;
  }

  private static normalizeInternalUrl(url: string): string | undefined {
    let cleanUrl = url.split('#')[0].split('?')[0].trim();
    if (!cleanUrl) {
      return undefined;
    }

    // Internal links may still come in absolute form when they match baseUrl.
    if (/^https?:\/\//i.test(cleanUrl)) {
      try {
        const parsed = new URL(cleanUrl);
        cleanUrl = parsed.pathname || '/';
      } catch {
        // Keep the original string if URL parsing fails.
      }
    } else if (/^[a-z][a-z0-9+.-]+:/i.test(cleanUrl)) {
      // Other schemes (mailto:, tel:, data:, ...) are no files
      return undefined;
    }

    // Links to files with spaces or special characters are URL encoded
    try {
      cleanUrl = decodeURIComponent(cleanUrl);
    } catch {
      // Keep the original string if it is not validly encoded.
    }

    return parseWinPath(cleanUrl);
  }

  private static async getInternalPages(): Promise<Page[]> {
    if (PagesParser.allPages?.length > 0) {
      return PagesParser.allPages;
    }

    return new Promise((resolve) => {
      try {
        PagesParser.getPages((pages) => resolve(pages || []));
      } catch {
        resolve([]);
      }
    });
  }

  private static buildSlugIndex(pages: Page[], folders: ContentFolder[]): Map<string, string> {
    const index = new Map<string, string>();
    const previews = folders
      .map((f) => LinkValidator.toComparablePath(f.previewPath || ''))
      .filter((p) => !!p);

    for (const page of pages) {
      const filePath = page.fmFilePath;
      if (!filePath) {
        continue;
      }

      const slug = LinkValidator.toComparablePath(page.slug || '');
      const fileName = page.fmFileName || basename(filePath);
      const fileNameWithoutExt = fileName
        ? fileName.slice(0, fileName.length - extname(fileName).length)
        : '';
      const candidates = new Set<string>();
      candidates.add(slug);

      // Fallback: allow matching links by filename when no slug match exists.
      if (fileNameWithoutExt) {
        candidates.add(LinkValidator.toComparablePath(fileNameWithoutExt));
      }

      if (slug.endsWith('/index')) {
        candidates.add(slug.slice(0, -6));
      }

      for (const preview of previews) {
        if (!preview) {
          continue;
        }

        if (slug) {
          candidates.add(LinkValidator.toComparablePath(`${preview}/${slug}`));
          if (fileNameWithoutExt) {
            candidates.add(LinkValidator.toComparablePath(`${preview}/${fileNameWithoutExt}`));
          }
          if (slug.startsWith(`${preview}/`)) {
            candidates.add(LinkValidator.toComparablePath(slug.slice(preview.length + 1)));
          }
        } else {
          candidates.add(preview);
        }
      }

      for (const candidate of candidates) {
        if (!index.has(candidate)) {
          index.set(candidate, filePath);
        }
      }
    }

    return index;
  }

  private static resolveBySlug(
    url: string,
    folders: ContentFolder[],
    slugIndex: Map<string, string>
  ): string | undefined {
    const urlPath = LinkValidator.toComparablePath(url);
    const candidates = new Set<string>([urlPath]);

    if (urlPath.endsWith('/index')) {
      candidates.add(urlPath.slice(0, -6));
    }

    // Some frameworks prepend route groups (for example, /session/<slug>)
    // while front matter stores only the terminal slug. Add trailing path
    // slices so the resolver can still match the page.
    const pathParts = urlPath.split('/').filter(Boolean);
    if (pathParts.length > 1) {
      for (let i = 1; i < pathParts.length; i++) {
        candidates.add(pathParts.slice(i).join('/'));
      }
    }

    const previews = folders
      .map((f) => LinkValidator.toComparablePath(f.previewPath || ''))
      .filter((p) => !!p);

    for (const preview of previews) {
      if (!preview) {
        continue;
      }

      if (urlPath.startsWith(`${preview}/`)) {
        candidates.add(LinkValidator.toComparablePath(urlPath.slice(preview.length + 1)));
      }

      if (urlPath === preview) {
        candidates.add('');
      }
    }

    for (const candidate of candidates) {
      const filePath = slugIndex.get(candidate);
      if (filePath) {
        return filePath;
      }
    }

    return undefined;
  }

  private static toComparablePath(path: string): string {
    const normalized = parseWinPath(path || '')
      .trim()
      .replace(/^\/+/, '')
      .replace(/\/+$/, '')
      .replace(/\/+/g, '/');

    if (!normalized || normalized === 'index') {
      return '';
    }

    return normalized;
  }

  /**
   * Given a base path (without extension), probe common content file variants.
   */
  private static async findContentFile(basePath: string): Promise<string | undefined> {
    // If the path already has a known extension, check it directly
    const ext = extname(basePath);
    if (ext) {
      return (await LinkValidator.fileExists(basePath)) ? basePath : undefined;
    }

    const candidates = [
      `${basePath}.md`,
      `${basePath}.mdx`,
      `${basePath}/index.md`,
      `${basePath}/index.mdx`
    ];

    for (const candidate of candidates) {
      if (await LinkValidator.fileExists(candidate)) {
        return candidate;
      }
    }

    return undefined;
  }

  private static async fileExists(filePath: string): Promise<boolean> {
    try {
      await workspace.fs.stat(Uri.file(filePath));
      return true;
    } catch {
      return false;
    }
  }

  private static async isReachable(url: string): Promise<boolean> {
    try {
      const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        return true;
      }
    } catch {
      return false;
    }

    // Not all servers support HEAD requests (405, 403, ...), retry with GET
    try {
      const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(5000) });
      // Only the status is needed, skip downloading the body
      res.body?.cancel().catch(() => undefined);
      return res.ok;
    } catch {
      return false;
    }
  }
}
