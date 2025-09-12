import { Disclosure } from '@headlessui/react';
import { ChevronRightIcon, FolderIcon, PlusIcon } from '@heroicons/react/24/solid';
import * as React from 'react';
import { useMemo } from 'react';
import { Page } from '../../models';
import { StructureItem } from './StructureItem';
import { parseWinPath } from '../../../helpers/parseWinPath';
import { messageHandler } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';

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
  
  const createContentInFolder = React.useCallback((folderPath: string, nodePagesOnly: Page[]) => {
    // Find a page from this folder to get the base content folder information
    // First try to find from the specific folder, then from all pages if not found
    let samplePage = nodePagesOnly.find(page => page.fmPageFolder);
    
    if (!samplePage) {
      // If no pages in this specific folder, find any page that has the same base folder structure
      samplePage = pages.find(page => {
        if (!page.fmFolder || !page.fmPageFolder) return false;
        const normalizedFmFolder = page.fmFolder.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
        return folderPath.startsWith(normalizedFmFolder) || normalizedFmFolder.startsWith(folderPath.split('/')[0]);
      });
    }

    if (samplePage && samplePage.fmPageFolder) {
      // Construct the full folder path by combining the base content folder with the structure path
      const baseFolderPath = samplePage.fmPageFolder.path.replace(/\\/g, '/').replace(/\/+$/, '');
      const relativePath = folderPath.replace(/^\/+|\/+$/g, '');
      const fullFolderPath = `${baseFolderPath}/${relativePath}`;
      
      messageHandler.send(DashboardMessage.createContentInFolder, { folderPath: fullFolderPath });
    }
  }, [pages]);

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
        <div className='space-y-4'>
          {/* Root level folders */}
          {node.children.map(child => renderFolderNode(child, depth + 1))}

          {/* Root level pages */}
          {node.pages.length > 0 && (
            <div>
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
              <div className="flex items-center justify-between w-full group">
                <Disclosure.Button
                  className="flex items-center flex-1 text-left"
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
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    createContentInFolder(node.path, node.pages);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 ml-2 mr-2 rounded hover:bg-[var(--vscode-list-hoverBackground)] transition-opacity"
                  title="Create content in this folder"
                >
                  <PlusIcon className="w-4 h-4 text-[var(--vscode-editor-foreground)]" />
                </button>
              </div>

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