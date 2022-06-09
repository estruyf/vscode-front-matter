import { ContentType } from '../models';


export const getTaxonomyField = (taxonomyType: string, contentType: ContentType): string | undefined => {
  let fieldName: string | undefined;
  
  if (taxonomyType === "tags") {
    fieldName = contentType.fields.find(f => f.name === "tags")?.name || "tags";
  } else if (taxonomyType === "categories") {
    fieldName = contentType.fields.find(f => f.name === "categories")?.name || "categories";
  } else {
    fieldName = contentType.fields.find(f => f.type === "taxonomy" && f.taxonomyId === taxonomyType)?.name;
  }

  return fieldName;
}