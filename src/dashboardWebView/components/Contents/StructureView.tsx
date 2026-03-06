import { Disclosure } from '@headlessui/react';
import { ChevronRightIcon, FolderIcon, PlusIcon, HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import * as React from 'react';
import { useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Page } from '../../models';
import { StructureItem } from './StructureItem';
import { parseWinPath } from '../../../helpers/parseWinPath';
import { SelectedStructureFolderAtom, SettingsSelector } from '../../state';
import { Messenger } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

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
  const [selectedFolder, setSelectedFolder] = useRecoilState(SelectedStructureFolderAtom);
  const settings = useRecoilValue(SettingsSelector);

  const folderTree = useMemo(() => {
    const root: FolderNode = {
      name: '',
      path: '',
      children: [],
      pages: []
    };

    const folderMap = new Map<string, FolderNode>();
    folderMap.set('', root);

    // Helper to compute the normalized workspace-relative folder path for a page.
    // This returns the actual folder path relative to the workspace, not just titles.
    const computeNormalizedFolderPath = (page: Page): string => {
      if (!page.fmFolder) {
        return '';
      }

      const fmFolder = page.fmFolder.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');

      // Use fmRelFilePath which is already workspace-relative
      if (page.fmRelFilePath) {
        const relPath = parseWinPath(page.fmRelFilePath).replace(/^\/+|\/+$/g, '');
        const relDir = relPath.includes('/') ? relPath.substring(0, relPath.lastIndexOf('/')).replace(/^\/+|\/+$/g, '') : '';
        if (relDir) {
          return relDir;
        }
      }

      // Fallback: use fmFolder title if we can't determine the path
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

  // Filter the folder tree based on the selected folder
  const displayedNode = useMemo(() => {
    if (!selectedFolder) {
      return folderTree;
    }

    // Find the selected folder node in the tree
    const findNode = (node: FolderNode, path: string): FolderNode | null => {
      if (node.path === path) {
        return node;
      }
      for (const child of node.children) {
        const found = findNode(child, path);
        if (found) {
          return found;
        }
      }
      return null;
    };

    const foundNode = findNode(folderTree, selectedFolder);
    return foundNode || folderTree;
  }, [folderTree, selectedFolder]);

  const handleFolderClick = (folderPath: string) => {
    setSelectedFolder(folderPath);
  };

  const handleBackClick = () => {
    if (!selectedFolder) {
      return;
    }

    // Navigate to parent folder
    const parts = selectedFolder.split('/');
    if (parts.length > 1) {
      const parentPath = parts.slice(0, -1).join('/');
      setSelectedFolder(parentPath);
    } else {
      setSelectedFolder(null);
    }
  };

  const handleHomeClick = () => {
    setSelectedFolder(null);
  };

  const handleCreateContent = () => {
    Messenger.send(DashboardMessage.createContentInFolder, { folderPath: selectedFolder });
  };

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
              <div className="flex items-center w-full gap-1" style={{ paddingLeft: `${paddingLeft}px` }}>
                <Disclosure.Button className="flex items-center text-left hover:bg-[var(--vscode-list-hoverBackground)] rounded px-2 py-1 transition-colors">
                  <ChevronRightIcon
                    className={`w-4 h-4 transform transition-transform ${open ? 'rotate-90' : ''}`}
                  />
                </Disclosure.Button>

                <button
                  onClick={() => handleFolderClick(node.path)}
                  className="flex items-center flex-1 px-2 py-1 hover:bg-[var(--vscode-list-hoverBackground)] rounded transition-colors"
                  title={l10n.t(LocalizationKey.commonOpen)}
                >
                  <FolderIcon className="w-4 h-4 mr-2 flex-shrink-0 text-[var(--vscode-symbolIcon-folderForeground)]" />
                  <span className="flex items-center font-medium text-[var(--vscode-editor-foreground)] flex-1">
                    <span className="mr-2">{node.name}</span>
                    {node.pages.length > 0 && (
                      <span className="text-sm text-[var(--vscode-descriptionForeground)]">
                        ({node.pages.length} {node.pages.length === 1 ? 'file' : 'files'})
                      </span>
                    )}
                  </span>
                  <ChevronRightIcon className="w-4 h-4 flex-shrink-0 text-[var(--vscode-descriptionForeground)]" />
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
      {/* Toolbar */}
      <div className="mb-4 pb-3 border-b border-[var(--frontmatter-border)]">
        {/* Breadcrumb navigation */}
        {selectedFolder && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleHomeClick}
                className="p-1 hover:bg-[var(--vscode-list-hoverBackground)] rounded"
                title="Home"
              >
                <HomeIcon className="w-4 h-4 text-[var(--vscode-descriptionForeground)]" />
              </button>
              <button
                onClick={handleBackClick}
                className="flex items-center space-x-1 px-2 py-1 hover:bg-[var(--vscode-list-hoverBackground)] rounded text-sm"
                title={l10n.t(LocalizationKey.commonBack) || 'Back'}
              >
                <ArrowLeftIcon className="w-3 h-3" />
                <span>{l10n.t(LocalizationKey.commonBack) || 'Back'}</span>
              </button>
              <span className="text-sm text-[var(--vscode-descriptionForeground)]">
                / {selectedFolder.split('/').join(' / ')}
              </span>
            </div>
          </div>
        )}

        {/* Create content button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCreateContent}
            disabled={!settings?.initialized}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium focus:outline-none rounded text-[var(--vscode-button-foreground)] bg-[var(--frontmatter-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] disabled:opacity-50"
            title={selectedFolder
              ? l10n.t(LocalizationKey.dashboardHeaderHeaderCreateContent) + ` in ${selectedFolder}`
              : l10n.t(LocalizationKey.dashboardHeaderHeaderCreateContent)}
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            <span>
              {selectedFolder
                ? `${l10n.t(LocalizationKey.dashboardHeaderHeaderCreateContent)} here`
                : l10n.t(LocalizationKey.dashboardHeaderHeaderCreateContent)}
            </span>
          </button>
          {selectedFolder && (
            <span className="text-xs text-[var(--vscode-descriptionForeground)]">
              in {selectedFolder}
            </span>
          )}
        </div>
      </div>

      {/* Folder tree */}
      {renderFolderNode(displayedNode)}
    </div>
  );
};