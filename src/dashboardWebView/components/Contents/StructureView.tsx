import { Disclosure } from '@headlessui/react';
import { ChevronRightIcon, FolderIcon } from '@heroicons/react/24/solid';
import * as React from 'react';
import { useMemo } from 'react';
import { Page } from '../../models';
import { Item } from './Item';

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

    // First pass: create all folder nodes
    pages.forEach(page => {
      if (!page.fmFolder) {
        return;
      }
      
      const folderPath = page.fmFolder;
      const parts = folderPath.split('/').filter(part => part.length > 0);
      
      let currentPath = '';
      let currentNode = root;
      
      parts.forEach(part => {
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
      });
    });

    // Second pass: assign pages to their folders
    pages.forEach(page => {
      if (!page.fmFolder) {
        root.pages.push(page);
      } else {
        const folderNode = folderMap.get(page.fmFolder);
        if (folderNode) {
          folderNode.pages.push(page);
        }
      }
    });

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
          {/* Root level pages */}
          {node.pages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-[var(--vscode-editor-foreground)]">
                Root Files
              </h3>
              <ul className="space-y-2">
                {node.pages.map((page, idx) => (
                  <li key={`${page.slug}-${idx}`}>
                    <Item {...page} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Root level folders */}
          {node.children.map(child => renderFolderNode(child, depth + 1))}
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
                  className={`w-4 h-4 mr-2 transform transition-transform ${
                    open ? 'rotate-90' : ''
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
                {/* Pages in this folder */}
                {node.pages.length > 0 && (
                  <ul className="space-y-1 mb-3">
                    {node.pages.map((page, idx) => (
                      <li key={`${page.slug}-${idx}`} style={{ paddingLeft: `${paddingLeft + 20}px` }}>
                        <Item {...page} />
                      </li>
                    ))}
                  </ul>
                )}
                
                {/* Child folders */}
                {node.children.map(child => renderFolderNode(child, depth + 1))}
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