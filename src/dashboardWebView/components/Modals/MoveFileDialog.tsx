import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { FolderIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { parseWinPath } from '../../../helpers/parseWinPath';
import { Page } from '../../models';

export interface IMoveFileDialogProps {
  page: Page;
  availableFolders: string[];
  dismiss: () => void;
  trigger: (destinationFolder: string) => void;
}

interface FolderNode {
  name: string;
  path: string;
  children: FolderNode[];
  level: number;
}

export const MoveFileDialog: React.FunctionComponent<IMoveFileDialogProps> = ({
  page,
  availableFolders,
  dismiss,
  trigger
}: React.PropsWithChildren<IMoveFileDialogProps>) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Build folder tree structure
  const folderTree = useMemo(() => {
    const root: FolderNode[] = [];
    const folderMap = new Map<string, FolderNode>();

    for (const folderPath of availableFolders) {
      const normalized = parseWinPath(folderPath).replace(/^\/+|\/+$/g, '');
      const parts = normalized.split('/').filter(Boolean);

      let currentPath = '';
      let currentLevel: FolderNode[] = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const fullPath = currentPath ? `${currentPath}/${part}` : part;

        if (!folderMap.has(fullPath)) {
          const newNode: FolderNode = {
            name: part,
            path: fullPath,
            children: [],
            level: i
          };
          folderMap.set(fullPath, newNode);
          currentLevel.push(newNode);
        }

        const node = folderMap.get(fullPath);
        if (node) {
          currentLevel = node.children;
        }
        currentPath = fullPath;
      }
    }

    return root;
  }, [availableFolders]);

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFolderNode = (node: FolderNode): React.ReactNode => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFolder === node.path;
    const hasChildren = node.children.length > 0;
    const paddingLeft = node.level * 20;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center py-1 px-2 cursor-pointer hover:bg-[var(--vscode-list-hoverBackground)] rounded ${
            isSelected ? 'bg-[var(--vscode-list-activeSelectionBackground)]' : ''
          }`}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => setSelectedFolder(node.path)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(node.path);
              }}
              className="mr-1"
            >
              <ChevronRightIcon
                className={`w-3 h-3 transform transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            </button>
          )}
          {!hasChildren && <span className="w-3 mr-1"></span>}
          <FolderIcon className="w-4 h-4 mr-2 text-[var(--vscode-symbolIcon-folderForeground)]" />
          <span className="text-sm text-[var(--vscode-editor-foreground)]">{node.name}</span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child) => renderFolderNode(child))}
          </div>
        )}
      </div>
    );
  };

  const handleMove = () => {
    if (selectedFolder) {
      trigger(selectedFolder);
    }
  };

  // Auto-expand folders by default (first level)
  useEffect(() => {
    const firstLevelFolders = folderTree.map(node => node.path);
    setExpandedFolders(new Set(firstLevelFolders));
  }, [folderTree]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-[var(--vscode-editor-background)] border border-[var(--frontmatter-border)] rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-[var(--frontmatter-border)]">
          <h2 className="text-xl font-bold text-[var(--vscode-editor-foreground)]">
            Move File
          </h2>
          <p className="mt-2 text-sm text-[var(--vscode-descriptionForeground)]">
            Move <span className="font-medium">{page.title}</span> to a different folder
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-1">
            {folderTree.length > 0 ? (
              folderTree.map((node) => renderFolderNode(node))
            ) : (
              <p className="text-sm text-[var(--vscode-descriptionForeground)]">
                No folders available
              </p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-[var(--frontmatter-border)] flex justify-end space-x-2">
          <button
            onClick={dismiss}
            className="px-4 py-2 text-sm font-medium rounded text-[var(--vscode-button-foreground)] bg-[var(--vscode-button-secondaryBackground)] hover:bg-[var(--vscode-button-secondaryHoverBackground)]"
          >
            {l10n.t(LocalizationKey.commonCancel)}
          </button>
          <button
            onClick={handleMove}
            disabled={!selectedFolder}
            className="px-4 py-2 text-sm font-medium rounded text-[var(--vscode-button-foreground)] bg-[var(--frontmatter-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Move
          </button>
        </div>
      </div>
    </div>
  );
};
