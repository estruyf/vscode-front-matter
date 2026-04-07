import { ContentType, Field, FieldType, CustomTaxonomy } from '../models';
import { Settings } from '../helpers/SettingsHelper';
import { SETTING_TAXONOMY_FIELD_GROUPS, SETTING_TAXONOMY_CUSTOM } from '../constants';
import { TaxonomyHelper } from './TaxonomyHelper';
import { TaxonomyType } from '../models/TaxonomyType';

/**
 * JSON Schema type definition
 */
export interface JSONSchema {
  $schema?: string;
  type?: string | string[];
  properties?: { [key: string]: JSONSchema };
  required?: string[];
  items?: JSONSchema;
  enum?: any[];
  format?: string;
  anyOf?: JSONSchema[];
  oneOf?: JSONSchema[];
  allOf?: JSONSchema[];
  description?: string;
  default?: any;
  minimum?: number;
  maximum?: number;
}

/**
 * Generates JSON Schema from Front Matter Content Type definitions
 *
 * This utility converts Front Matter content type definitions into JSON Schema format
 * which can then be used for validation. It handles all field types supported by
 * Front Matter CMS including nested fields, blocks, and field groups.
 *
 * Field Type Mappings:
 * - string, slug, image, file, customField → string
 * - number → number (with optional min/max)
 * - boolean, draft → boolean
 * - datetime → string with date-time format
 * - choice → string with enum (or array if multiple)
 * - tags, categories, taxonomy, list → array of strings
 * - fields → nested object with properties
 * - block → array of objects with oneOf for field groups
 * - json → any valid JSON type
 * - dataFile, contentRelationship → string or array
 *
 * Features:
 * - Required field validation
 * - Type validation
 * - Enum/choice validation
 * - Number range validation (min/max)
 * - Nested object support
 * - Block field support with multiple field group options
 *
 * Usage:
 * ```typescript
 * const schema = ContentTypeSchemaGenerator.generateSchema(contentType);
 * // Use schema for validation with AJV or other JSON Schema validators
 * ```
 */
export class ContentTypeSchemaGenerator {
  /**
   * Generate JSON Schema from a content type
   * @param contentType The content type to generate schema from
   * @returns JSON Schema object
   */
  public static async generateSchema(contentType: ContentType): Promise<JSONSchema> {
    const schema: JSONSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {},
      required: []
    };

    if (!contentType.fields || contentType.fields.length === 0) {
      return schema;
    }

    // Process each field in the content type
    for (const field of contentType.fields) {
      const fieldSchema = await this.generateFieldSchema(field);
      if (fieldSchema && schema.properties) {
        schema.properties[field.name] = fieldSchema;

        // Add to required array if field is required
        if (field.required && schema.required) {
          schema.required.push(field.name);
        }
      }
    }

    // Remove required array if empty
    if (schema.required && schema.required.length === 0) {
      delete schema.required;
    }

    return schema;
  }

  /**
   * Generate JSON Schema for a single field
   * @param field The field to generate schema from
   * @returns JSON Schema object for the field
   */
  private static async generateFieldSchema(field: Field): Promise<JSONSchema | null> {
    // Skip divider and heading fields as they are UI-only
    if (field.type === 'divider' || field.type === 'heading') {
      return null;
    }

    const schema: JSONSchema = {};

    // Add description if available
    if (field.description) {
      schema.description = field.description;
    }

    // Add default value if specified
    if (field.default !== undefined && field.default !== null) {
      schema.default = field.default;
    }

    // Map field type to JSON Schema type
    switch (field.type) {
      case 'string':
      case 'slug':
      case 'customField':
        schema.type = 'string';
        break;

      case 'image':
      case 'file':
        if (field.multiple) {
          schema.type = 'array';
          schema.items = { type: 'string' };
        } else {
          schema.type = 'string';
        }
        break;

      case 'number':
        schema.type = 'number';
        if (field.numberOptions) {
          if (field.numberOptions.min !== undefined) {
            schema.minimum = field.numberOptions.min;
          }
          if (field.numberOptions.max !== undefined) {
            schema.maximum = field.numberOptions.max;
          }
        }
        break;

      case 'boolean':
      case 'draft':
        schema.type = 'boolean';
        break;

      case 'datetime':
        schema.type = 'string';
        schema.format = 'date-time';
        break;

      case 'choice':
        if (field.multiple) {
          schema.type = 'array';
          schema.items = {
            type: 'string'
          };
          if (field.choices && field.choices.length > 0) {
            schema.items.enum = this.extractChoiceValues(field.choices);
          }
        } else {
          schema.type = 'string';
          if (field.choices && field.choices.length > 0) {
            schema.enum = this.extractChoiceValues(field.choices);
          }
        }
        break;

      case 'tags': {
        schema.type = 'array';
        schema.items = {
          type: 'string'
        };

        // Get available tags and add as enum for validation
        const availableTags = await TaxonomyHelper.get(TaxonomyType.Tag);
        if (availableTags && availableTags.length > 0) {
          schema.items.enum = availableTags;
        }
        break;
      }

      case 'categories': {
        schema.type = 'array';
        schema.items = {
          type: 'string'
        };

        // Get available categories and add as enum for validation
        const availableCategories = await TaxonomyHelper.get(TaxonomyType.Category);
        if (availableCategories && availableCategories.length > 0) {
          schema.items.enum = availableCategories;
        }
        break;
      }

      case 'taxonomy': {
        schema.type = 'array';
        schema.items = {
          type: 'string'
        };

        // Get custom taxonomy options if taxonomyId is specified
        if (field.taxonomyId) {
          const customTaxonomies = Settings.get<CustomTaxonomy[]>(SETTING_TAXONOMY_CUSTOM);
          if (customTaxonomies && customTaxonomies.length > 0) {
            const taxonomy = customTaxonomies.find((t) => t.id === field.taxonomyId);
            if (taxonomy && taxonomy.options && taxonomy.options.length > 0) {
              schema.items.enum = taxonomy.options;
            }
          }
        }
        break;
      }

      case 'list':
        schema.type = 'array';
        schema.items = {
          type: 'string'
        };
        break;

      case 'fields':
        schema.type = 'object';
        schema.properties = {};
        schema.required = [];

        if (field.fields && field.fields.length > 0) {
          for (const subField of field.fields) {
            const subFieldSchema = await this.generateFieldSchema(subField);
            if (subFieldSchema && schema.properties) {
              schema.properties[subField.name] = subFieldSchema;

              if (subField.required && schema.required) {
                schema.required.push(subField.name);
              }
            }
          }
        }

        // Remove required array if empty
        if (schema.required && schema.required.length === 0) {
          delete schema.required;
        }
        break;

      case 'block': {
        // Block fields can contain different field groups
        schema.type = 'array';
        schema.items = {
          type: 'object'
        };

        // Try to get the field group schemas
        const blockSchemas = await this.getBlockFieldGroupSchemas(field);
        if (blockSchemas.length > 0) {
          schema.items = {
            oneOf: blockSchemas
          };
        }
        break;
      }

      case 'json':
        // JSON fields can be any valid JSON
        schema.type = ['object', 'array', 'string', 'number', 'boolean', 'null'];
        break;

      case 'dataFile':
        // Data file references are typically strings (IDs or keys)
        schema.type = 'string';
        break;

      case 'contentRelationship':
        // Content relationships can be a string (slug/path) or array of strings
        if (field.multiple) {
          schema.type = 'array';
          schema.items = {
            type: 'string'
          };
        } else {
          schema.type = 'string';
        }
        break;

      case 'fieldCollection':
        // Field collections reference field groups, handle similarly to blocks
        schema.type = 'array';
        schema.items = {
          type: 'object'
        };
        break;

      default:
        // Unknown field type, default to string
        schema.type = 'string';
        break;
    }

    return schema;
  }

  /**
   * Extract choice values from field choices
   * @param choices Array of choice strings or objects
   * @returns Array of choice values
   */
  private static extractChoiceValues(
    choices: (string | { id?: string | null; title: string })[]
  ): string[] {
    return choices.map((choice) => {
      if (typeof choice === 'string') {
        return choice;
      } else {
        return choice.id || choice.title;
      }
    });
  }

  /**
   * Get schemas for block field groups
   * @param field The block field
   * @returns Array of JSON Schemas for each field group
   */
  private static async getBlockFieldGroupSchemas(field: Field): Promise<JSONSchema[]> {
    const schemas: JSONSchema[] = [];

    if (!field.fieldGroup) {
      return schemas;
    }

    const fieldGroupIds = Array.isArray(field.fieldGroup) ? field.fieldGroup : [field.fieldGroup];
    const fieldGroups = Settings.get(SETTING_TAXONOMY_FIELD_GROUPS) as
      | { id: string; fields: Field[] }[]
      | undefined;

    if (!fieldGroups || fieldGroups.length === 0) {
      return schemas;
    }

    for (const groupId of fieldGroupIds) {
      const fieldGroup = fieldGroups.find((fg) => fg.id === groupId);
      if (fieldGroup && fieldGroup.fields) {
        const groupSchema: JSONSchema = {
          type: 'object',
          properties: {},
          required: []
        };

        for (const groupField of fieldGroup.fields) {
          const fieldSchema = await this.generateFieldSchema(groupField);
          if (fieldSchema && groupSchema.properties) {
            groupSchema.properties[groupField.name] = fieldSchema;

            if (groupField.required && groupSchema.required) {
              groupSchema.required.push(groupField.name);
            }
          }
        }

        // Remove required array if empty
        if (groupSchema.required && groupSchema.required.length === 0) {
          delete groupSchema.required;
        }

        schemas.push(groupSchema);
      }
    }

    return schemas;
  }
}
