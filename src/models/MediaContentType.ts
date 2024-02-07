import { Field } from '.';

export interface MediaContentType {
  name: string;
  fileTypes: string[] | null | undefined;
  fields: Field[];
}

export const DEFAULT_MEDIA_CONTENT_TYPE: MediaContentType = {
  name: 'default',
  fileTypes: null,
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string',
      required: false
    },
    {
      title: 'Caption',
      name: 'caption',
      type: 'string',
      required: false
    },
    {
      title: 'Alt text',
      name: 'alt',
      type: 'string',
      required: false
    }
  ]
};
