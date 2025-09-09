import { Disclosure } from '@headlessui/react';
import { ChevronRightIcon, FolderIcon } from '@heroicons/react/24/solid';
import * as React from 'react';
import { useMemo } from 'react';
import { Page } from '../../models';
import { StructureItem } from './StructureItem';
import { parseWinPath } from '../../../helpers/parseWinPath';

export interface IStructureViewProps {
  pages: Page[];
}

interface FolderNode {
  name: string;
  path: string;
  children: FolderNode[];
  pages: Page[];
}

export const StructureView: React.FunctionComponent<IStructureViewProps> = ({
  pages
}: React.PropsWithChildren<IStructureViewProps>) => {

  const folderTree = useMemo(() => {
    const root: FolderNode = {
      name: '',
      path: '',
      children: [],
      pages: []
    };

    const folderMap = new Map<string, FolderNode>();
    folderMap.set('', root);

    // Helper to compute the normalized folder path for a page.
    // It ensures the page's folder starts with the `fmFolder` segment and
    // preserves any subpaths after that segment (so subfolders are created).
    const computeNormalizedFolderPath = (page: Page): string => {
      if (!page.fmFolder) {
        return '';
      }

      const fmFolder = page.fmFolder.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');

      // If we have a file path, use its directory (exclude the filename) to compute
      // the relative path. This avoids treating filenames as folder segments.
      const filePath = page.fmFilePath ? parseWinPath(page.fmFilePath).replace(/^\/+|\/+$/g, '') : '';
      const fileDir = filePath && filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')).replace(/^\/+|\/+$/g, '') : '';

      if (fileDir) {
        // If the content folder is known, and the file directory starts with it,
        // replace that root with the fmFolder (preserving subfolders after it).
        if (page.fmPageFolder?.path) {
          const contentFolderPath = parseWinPath(page.fmPageFolder.path).replace(/^\/+|\/+$/g, '');
          if (fileDir.startsWith(contentFolderPath)) {
            const rel = fileDir.substring(contentFolderPath.length).replace(/^\/+|\/+$/g, '');
            return rel ? `${fmFolder}/${rel}` : fmFolder;
          }
        }

        // Otherwise try to find fmFolder as a directory segment in the fileDir
        const segments = fileDir.split('/').filter(Boolean);
        const fmIndex = segments.indexOf(fmFolder);
        if (fmIndex >= 0) {
          return segments.slice(fmIndex).join('/');
        }
      }

      // Fallback: just use the fmFolder name
      return fmFolder;
    };

    // First pass: create all folder nodes (ensure nodes exist even if a page lacks fmFilePath)
    for (const page of pages) {
      if (!page.fmFolder) {
        continue;
      }

      const normalizedPath = computeNormalizedFolderPath(page).replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
      if (!normalizedPath) {
        continue;
      }

      const parts = normalizedPath.split('/').filter(part => part.length > 0);

      let currentPath = '';
      let currentNode = root;

      for (const part of parts) {
        const fullPath = currentPath ? `${currentPath}/${part}` : part;

        if (!folderMap.has(fullPath)) {
          const newNode: FolderNode = {
            name: part,
            path: fullPath,
            children: [],
            pages: []
          };
          folderMap.set(fullPath, newNode);
          currentNode.children.push(newNode);
        }

        const nextNode = folderMap.get(fullPath);
        if (nextNode) {
          currentNode = nextNode;
        }
        currentPath = fullPath;
      }
    }

    // Second pass: assign pages to their exact folder node (including subfolders)
    for (const page of pages) {
      if (!page.fmFolder) {
        root.pages.push(page);
        continue;
      }

      const normalizedPath = computeNormalizedFolderPath(page).replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
      const folderNode = normalizedPath ? folderMap.get(normalizedPath) : folderMap.get(page.fmFolder.replace(/\\/g, '/').replace(/^\/+|\/+$/g, ''));
      if (folderNode) {
        folderNode.pages.push(page);
      } else {
        // If folder not found, add to root as fallback
        root.pages.push(page);
      }
    }

    // Sort folders and pages
    const sortNode = (node: FolderNode) => {
      node.children.sort((a, b) => a.name.localeCompare(b.name));
      node.pages.sort((a, b) => a.title.localeCompare(b.title));
      node.children.forEach(sortNode);
    };

    sortNode(root);

    return root;
  }, [pages]);

  const renderFolderNode = (node: FolderNode, depth = 0): React.ReactNode => {
    const hasContent = node.pages.length > 0 || node.children.length > 0;

    if (!hasContent) {
      return null;
    }

    const isRoot = depth === 0;
    const paddingLeft = depth * 20;

    if (isRoot) {
      // For root node, render children and pages directly
      return (
        <div>
          {/* Root level folders */}
          {node.children.map(child => renderFolderNode(child, depth + 1))}

          {/* Root level pages */}
          {node.pages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-[var(--vscode-editor-foreground)]">
                Root Files
              </h3>
              <ul className="space-y-2">
                {node.pages.map((page, idx) => (
                  <li key={`${page.slug}-${idx}`}>
                    <StructureItem {...page} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={node.path} className="mb-4">
        <Disclosure defaultOpen={depth <= 1}>
          {({ open }) => (
            <>
              <Disclosure.Button
                className="flex items-center w-full text-left"
                style={{ paddingLeft: `${paddingLeft}px` }}
              >
                <ChevronRightIcon
                  className={`w-4 h-4 mr-2 transform transition-transform ${open ? 'rotate-90' : ''
                    }`}
                />
                <FolderIcon className="w-4 h-4 mr-2 text-[var(--vscode-symbolIcon-folderForeground)]" />
                <span className="font-medium text-[var(--vscode-editor-foreground)]">
                  {node.name}
                  {node.pages.length > 0 && (
                    <span className="ml-2 text-sm text-[var(--vscode-descriptionForeground)]">
                      ({node.pages.length} {node.pages.length === 1 ? 'file' : 'files'})
                    </span>
                  )}
                </span>
              </Disclosure.Button>

              <Disclosure.Panel className="mt-2">
                {/* Child folders */}
                {node.children.map(child => renderFolderNode(child, depth + 1))}

                {/* Pages in this folder */}
                {node.pages.length > 0 && (
                  <ul className="space-y-1 mb-3">
                    {node.pages.map((page, idx) => (
                      <li key={`${page.slug}-${idx}`} style={{ paddingLeft: `${paddingLeft + 20}px` }}>
                        <StructureItem {...page} />
                      </li>
                    ))}
                  </ul>
                )}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    );
  };

  return (
    <div className="structure-view">
      {renderFolderNode(folderTree)}
    </div>
  );
};