import { darkenColor } from './darkenColor';
import { preserveColor } from './preserveColor';

export const updateCssVariables = (isDarkTheme: boolean = true) => {
  const styles = getComputedStyle(document.documentElement);

  // Lightbox
  const background = styles.getPropertyValue('--vscode-editor-background');
  // Adds 75% opacity to the background color
  document.documentElement.style.setProperty(
    '--frontmatter-lightbox-background',
    `${preserveColor(background)}BF`
  );

  // Text
  document.documentElement.style.setProperty(
    '--frontmatter-text',
    'var(--vscode-editor-foreground)'
  );
  document.documentElement.style.setProperty(
    '--frontmatter-secondary-text',
    'var(--vscode-editorHint-foreground)'
  );
  document.documentElement.style.setProperty(
    '--frontmatter-link',
    'var(--vscode-textLink-foreground)'
  );
  document.documentElement.style.setProperty(
    '--frontmatter-link-hover',
    'var(--vscode-textLink-activeForeground)'
  );

  // List
  document.documentElement.style.setProperty(
    '--frontmatter-list-text',
    'var(--vscode-editor-foreground)'
  );
  document.documentElement.style.setProperty(
    '--frontmatter-list-background',
    'var(--vscode-list-activeSelectionBackground)'
  );
  document.documentElement.style.setProperty(
    '--frontmatter-list-hover-background',
    'var(--vscode-list-hoverBackground)'
  );
  document.documentElement.style.setProperty(
    '--frontmatter-list-selected-background',
    'var(--vscode-list-activeSelectionBackground)'
  );
  document.documentElement.style.setProperty(
    '--frontmatter-list-selected-text',
    'var(--vscode-list-activeSelectionForeground)'
  );

  // Borders
  const borderColor = styles.getPropertyValue('--vscode-panel-border');
  document.documentElement.style.setProperty('--frontmatter-border', 'var(--vscode-panel-border)');
  document.documentElement.style.setProperty(
    '--frontmatter-border-preserve',
    preserveColor(borderColor) || 'var(--vscode-panel-border)'
  );

  // Other colors which should be preserved (no opacity)
  const buttonBackground = styles.getPropertyValue('--vscode-button-background');
  if (buttonBackground) {
    document.documentElement.style.setProperty(
      '--frontmatter-button-background',
      preserveColor(buttonBackground) || 'var(--vscode-button-background)'
    );
  }

  const buttonHoverBackground = styles.getPropertyValue('--vscode-button-hoverBackground');
  if (buttonHoverBackground) {
    document.documentElement.style.setProperty(
      '--frontmatter-button-hoverBackground',
      preserveColor(buttonHoverBackground) || 'var(--vscode-button-hoverBackground)'
    );
  }

  // Darken the background of a color
  const sideBarBg = styles.getPropertyValue('--vscode-sideBar-background');
  document.documentElement.style.setProperty(
    '--frontmatter-sideBar-background',
    darkenColor(sideBarBg, 2) || 'var(--vscode-sideBar-background)'
  );

  document.documentElement.style.setProperty(
    '--frontmatter-border-active',
    darkenColor(borderColor, isDarkTheme ? -30 : 30) || 'var(--vscode-activityBar-activeBorder)'
  );
};
