const packageJson = require('../package.json');

for (const key of Object.keys(packageJson.contributes.configuration.properties)) {
  const type = packageJson.contributes.configuration.properties[key].type;

  if (type.includes('object') || type.includes('array')) {
    console.log(`${key} - ${packageJson.contributes.configuration.properties[key].type}`);
  }
}

// TO IGNORE
// frontMatter.extends - array
// frontMatter.dashboard.mediaSnippet - array

// TO PROCESS AS A WHOLE OBJECT
// frontMatter.content.draftField - object
// frontMatter.content.supportedFileTypes - array
// frontMatter.global.notifications - array
// frontMatter.global.disabledNotifications - array
// frontMatter.media.supportedMimeTypes - array
// frontMatter.taxonomy.commaSeparatedFields - array

// MERGE ARRAYS
// frontMatter.taxonomy.categories - array
// frontMatter.taxonomy.tags - array
// frontMatter.taxonomy.noPropertyValueQuotes - array

// PROCESS ITEM BY ITEM
// frontMatter.custom.scripts - array - id
// frontMatter.taxonomy.contentTypes - array,null - name
// frontMatter.data.files - array - id
// frontMatter.data.folders - array - id
// frontMatter.data.types - array - id
// frontMatter.content.pageFolders - array - path
// frontMatter.content.placeholders - array - id
// frontMatter.content.sorting - array - id
// frontMatter.global.modes - array - id
// frontMatter.taxonomy.fieldGroups - array - id
// frontMatter.taxonomy.customTaxonomy - array - id



// frontMatter.content.snippets - object