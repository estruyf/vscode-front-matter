import { FileType, Uri, workspace } from 'vscode';
import { parse } from 'path';

/**
 * Processes file prefix placeholders in a given string value.
 *
 * This function replaces placeholders in the format `{{filePrefix.index}}` or `{{filePrefix.index|zeros:4}}`
 * with the appropriate index number based on the number of files in the directory of the given file path.
 *
 * @param value - The string containing the placeholders to be replaced.
 * @param folderPath - The path of the file whose directory will be used to determine the index number.
 * @returns A promise that resolves to the string with the placeholders replaced by the index number.
 */
export const processFilePrefixPlaceholders = async (value: string, folderPath?: string) => {
  // Example: {{filePrefix.index}} or {{filePrefix.index|chars:4,zeros:true}}
  if (value && value.includes('{{filePrefix.index') && folderPath) {
    const dirContent = await workspace.fs.readDirectory(Uri.file(folderPath));
    const files = dirContent.filter(([_, type]) => type === FileType.File);

    let chars = 3;
    let idxValue = files.length + 1;

    if (value.includes('{{filePrefix.index}}')) {
      const regex = new RegExp('{{filePrefix.index}}', 'g');
      const placeholderValue = idxValue.toString().padStart(chars, '0');
      value = value.replace(regex, placeholderValue);
    }
    // Example: {{filePrefix.index|zeros:4}}
    else if (value.includes('{{filePrefix.index')) {
      const regex = /{{filePrefix.index[^}]*}}/g;
      const matches = value.match(regex);
      if (matches) {
        for (const match of matches) {
          const placeholderParts = match.split('|');
          if (placeholderParts.length > 1) {
            let options = placeholderParts[1].trim().replace('}}', '').split(',');

            for (const option of options) {
              if (option.startsWith('zeros:')) {
                chars = parseInt(option.replace('zeros:', ''));
              }
            }

            const placeholderValue = chars
              ? idxValue.toString().padStart(chars, '0')
              : idxValue.toString();
            value = value.replace(match, placeholderValue);
          }
        }
      }
    }
  }

  return value;
};
