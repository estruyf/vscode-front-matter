import { writeFileSync } from 'fs';
import { join } from 'path';
import { createServer } from 'vite';
import zod from 'astro/zod';

const { ZodDefault, ZodObject, ZodOptional, ZodString, ZodEffects, ZodEnum, ZodUnion } = zod;

/**
 * Process the Zod field
 * @param {ZodTypeAny} field
 * @param {boolean} isOptional
 * @param {string} defaultValue
 * @returns
 */
function getField(field, isOptional = false, defaultValue = undefined) {
  // Handle various type transformations and assignments
  if (field instanceof ZodOptional) {
    isOptional = true;
    const type = field.unwrap();

    return getField(type, isOptional, defaultValue);
  }

  if (field instanceof ZodEffects) {
    const type = field.sourceType();
    return getField(type, isOptional, defaultValue);
  }

  if (field instanceof ZodUnion) {
    const types = field._def.options;
    const type = types[0];
    return getField(type, isOptional, defaultValue);
  }

  if (field instanceof ZodDefault) {
    // https://github.com/colinhacks/zod/blob/master/README.md#default
    isOptional = true;
    defaultValue = field.parse(undefined);
    // https://github.com/sachinraja/zod-to-ts/blob/main/src/index.ts
    const type = field._def.innerType;
    return getField(type, isOptional, defaultValue);
  }

  return {
    type: field,
    isOptional,
    defaultValue
  };
}

/**
 * Generate the field information
 * @param {string} name
 * @param {ZodTypeAny} type
 * @returns
 */
function generateFieldInfo(name, type) {
  let description = type.description;
  let defaultValue = undefined;

  const {
    type: fieldType,
    isOptional: isFieldOptional,
    defaultValue: fieldDefaultValue
  } = getField(type, false, defaultValue);

  const fieldInfo = {
    name: name,
    description: description,
    defaultValue: fieldDefaultValue,
    type: fieldType._def.typeName,
    required: !isFieldOptional
  };

  if (fieldType instanceof ZodObject) {
    const subFields = extractFieldInfoFromShape(fieldType);

    fieldInfo.fields = subFields;
  }

  if (fieldType instanceof ZodEffects) {
    fieldInfo.type = fieldType.sourceType().fmFieldType;
  }

  if (fieldInfo.name.toLowerCase().includes('image')) {
    fieldInfo.type = 'image';
  }

  if (fieldType instanceof ZodEnum) {
    fieldInfo.options = fieldType.options;
  }

  if (fieldType instanceof ZodString) {
    // https://github.com/StefanTerdell/zod-to-json-schema/blob/master/src/parsers/string.ts#L45
    if (fieldType._def.checks && fieldType._def.checks.length > 0) {
      const check = fieldType._def.checks.pop();
      fieldInfo.type = check.kind;
    }
  }

  return fieldInfo;
}

/**
 * Parse the scheme into an array of fields
 * @param {ZodTypeAny} type
 * @returns
 */
function extractFieldInfoFromShape(type) {
  if (type instanceof ZodOptional) {
    type = type.unwrap();
  }

  if (!(type instanceof ZodObject)) {
    // Return an empty array if the type is not of the expected type
    return [];
  }

  // Iterate through the shape properties
  // https://github.com/sachinraja/zod-to-ts/blob/1389b33557bcca8a02da66cd5c48efbe7579720c/src/index.ts#L134
  const properties = Object.entries(type._def.shape());
  const fieldInfoList = properties.map(([fieldName, fieldShape]) => {
    return generateFieldInfo(fieldName, fieldShape);
  });

  return fieldInfoList;
}

/**
 * Process each content collection
 * @param {*} collections
 * @returns
 */
function processCollection(collections) {
  if (!Array.isArray(collections)) {
    return [];
  }

  return collections.map(([name, collection]) => {
    const schema =
      typeof collection.schema === 'function'
        ? collection.schema({
            image() {
              const field = zod.string();
              field.fmFieldType = 'image';
              return field;
            }
          })
        : collection.schema;

    return {
      name,
      type: collection.type || 'content',
      fields: extractFieldInfoFromShape(schema)
    };
  });
}

/**
 * More info: https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention
 * @returns
 */
const astroContentModulePlugin = () => {
  const astroContent = 'astro:content';
  const astroContentMarker = `\0${astroContent}`;

  return {
    name: 'astro-content-collections',
    resolveId(importee) {
      if (importee === astroContent) {
        return astroContentMarker;
      }
    },
    load(id) {
      if (id === astroContentMarker) {
        // https://github.com/withastro/astro/blob/defab70cb2a0c67d5e9153542490d2749046b151/packages/astro/content-module.template.mjs#L12
        return `
          export { z } from 'astro/zod';
          // Reference: /node_modules/astro/content-module.template.mjs
          export function defineCollection(config) {
            if (!config.type) config.type = 'content';
            return config;
          };
        `;
      }
    }
  };
};

/**
 * Start of the Astro Collections script
 */
(async () => {
  const configPath = process.argv[2];
  if (!configPath || typeof configPath !== 'string') {
    console.log('No config path provided');
    process.exit(1);
  }

  // https://vitejs.dev/guide/ssr.html#setting-up-the-dev-server
  // https://github.com/withastro/astro/blob/defab70cb2a0c67d5e9153542490d2749046b151/packages/astro/src/core/config/vite-load.ts#L8
  const server = await createServer({
    server: {
      middlewareMode: true,
      hmr: false
    },
    optimizeDeps: {
      disabled: true
    },
    appType: 'custom',
    plugins: [astroContentModulePlugin()]
  });

  try {
    // https://github.dev/withastro/astro/blob/defab70cb2a0c67d5e9153542490d2749046b151/packages/astro/src/content/utils.ts#L334
    const contentModule = await server.ssrLoadModule(configPath);

    const collections = Object.entries(contentModule.collections ?? {});
    const processedCollections = processCollection(collections);

    writeFileSync(
      join(process.cwd(), `./.frontmatter/temp/astro.collections.json`),
      JSON.stringify(processedCollections, null, 2)
    );

    console.log('Collections generated successfully');
    process.exit(0);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  } finally {
    await server.close();
  }
})();
