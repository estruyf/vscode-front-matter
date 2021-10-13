import { ContentType } from './../models/PanelSettings';

export const DEFAULT_CONTENT_TYPE_NAME = 'default';

export const DEFAULT_CONTENT_TYPE: ContentType = {
  "name": "default",
  "pageBundle": false,
  "fields": [
    {
      "title": "Title",
      "name": "title",
      "type": "string"
    },
    {
      "title": "Description",
      "name": "description",
      "type": "string"
    },
    {
      "title": "Publishing date",
      "name": "date",
      "type": "datetime"
    },
    {
      "title": "Article preview",
      "name": "preview",
      "type": "image"
    },
    {
      "title": "Is in draft",
      "name": "draft",
      "type": "boolean"
    },
    {
      "title": "Tags",
      "name": "tags",
      "type": "tags"
    },
    {
      "title": "Categories",
      "name": "categories",
      "type": "categories"
    }
  ]
};