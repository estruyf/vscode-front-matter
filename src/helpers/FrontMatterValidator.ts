import Ajv, { ErrorObject } from 'ajv';
import { ContentType } from '../models';
import { ContentTypeSchemaGenerator, JSONSchema } from './ContentTypeSchemaGenerator';

/**
 * Validation error with location information
 */
export interface ValidationError {
  field: string;
  message: string;
  keyword?: string;
  params?: Record<string, any>;
}

/**
 * Validates front matter data against content type schemas
 */
export class FrontMatterValidator {
  private ajv: Ajv;
  private schemaCache: Map<string, JSONSchema>;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
      allowUnionTypes: true
    });
    this.schemaCache = new Map();
  }

  /**
   * Validate front matter data against a content type
   * @param data The front matter data to validate
   * @param contentType The content type to validate against
   * @returns Array of validation errors (empty if valid)
   */
  public validate(data: any, contentType: ContentType): ValidationError[] {
    if (!contentType || !contentType.fields || contentType.fields.length === 0) {
      return [];
    }

    // Get or generate schema
    const schema = this.getSchema(contentType);
    if (!schema) {
      return [];
    }

    // Compile and validate
    const validate = this.ajv.compile(schema);
    const valid = validate(data);

    if (valid) {
      return [];
    }

    // Convert AJV errors to our format
    return this.convertAjvErrors(validate.errors || []);
  }

  /**
   * Get or generate schema for a content type
   * @param contentType The content type
   * @returns JSON Schema
   */
  private getSchema(contentType: ContentType): JSONSchema | null {
    // Check cache first
    const cacheKey = contentType.name;
    if (this.schemaCache.has(cacheKey)) {
      return this.schemaCache.get(cacheKey) || null;
    }

    // Generate new schema
    const schema = ContentTypeSchemaGenerator.generateSchema(contentType);
    this.schemaCache.set(cacheKey, schema);

    return schema;
  }

  /**
   * Clear the schema cache
   */
  public clearCache(): void {
    this.schemaCache.clear();
  }

  /**
   * Convert AJV errors to validation errors
   * @param ajvErrors AJV error objects
   * @returns Array of validation errors
   */
  private convertAjvErrors(ajvErrors: ErrorObject[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const error of ajvErrors) {
      const field = this.extractFieldName(error.instancePath);
      const message = this.formatErrorMessage(error, field);

      errors.push({
        field,
        message,
        keyword: error.keyword,
        params: error.params
      });
    }

    return errors;
  }

  /**
   * Extract field name from instance path
   * @param instancePath The JSON pointer path
   * @returns Field name
   */
  private extractFieldName(instancePath: string): string {
    if (!instancePath || instancePath === '') {
      return 'root';
    }

    // Remove leading slash and convert to dot notation
    return instancePath
      .replace(/^\//, '')
      .replace(/\//g, '.')
      .replace(/~1/g, '/')
      .replace(/~0/g, '~');
  }

  /**
   * Format error message for display
   * @param error AJV error object
   * @param field Field name
   * @returns Formatted error message
   */
  private formatErrorMessage(error: ErrorObject, field: string): string {
    const displayField = field === 'root' ? 'The document' : `Field '${field}'`;

    switch (error.keyword) {
      case 'required': {
        const missingProperty = error.params?.missingProperty;
        return `Missing required field '${missingProperty}'`;
      }

      case 'type': {
        const expectedType = error.params?.type;
        return `${displayField} must be of type ${expectedType}`;
      }

      case 'enum': {
        const allowedValues = error.params?.allowedValues;
        if (allowedValues && Array.isArray(allowedValues)) {
          return `${displayField} must be one of: ${allowedValues.join(', ')}`;
        }
        return `${displayField} has an invalid value`;
      }

      case 'format': {
        const format = error.params?.format;
        return `${displayField} must be in ${format} format`;
      }

      case 'minimum': {
        const minimum = error.params?.limit;
        return `${displayField} must be greater than or equal to ${minimum}`;
      }

      case 'maximum': {
        const maximum = error.params?.limit;
        return `${displayField} must be less than or equal to ${maximum}`;
      }

      case 'minItems': {
        const minItems = error.params?.limit;
        return `${displayField} must have at least ${minItems} items`;
      }

      case 'maxItems': {
        const maxItems = error.params?.limit;
        return `${displayField} must have at most ${maxItems} items`;
      }

      case 'additionalProperties': {
        const additionalProperty = error.params?.additionalProperty;
        return `Unexpected field '${additionalProperty}' is not allowed`;
      }

      case 'oneOf':
        return `${displayField} must match exactly one of the allowed schemas`;

      case 'anyOf':
        return `${displayField} must match at least one of the allowed schemas`;

      default:
        return error.message || `${displayField} is invalid`;
    }
  }
}
