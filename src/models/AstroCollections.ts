export interface AstroCollection {
  name: string;
  type: 'content' | 'data';
  fields: AstroField[];
}

export interface AstroField {
  name: string;
  type:
    | 'ZodString'
    | 'ZodNumber'
    | 'ZodBoolean'
    | 'ZodArray'
    | 'ZodEnum'
    | 'ZodDate'
    | 'ZodObject'
    | 'email'
    | 'url'
    | 'image';
  required: boolean;
  defaultValue?: string;
  options?: string[];
  description?: string;
  fields?: AstroField[];
}
