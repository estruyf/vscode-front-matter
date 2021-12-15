

export const isValidFile = (fileName: string) => {
  return fileName.endsWith(`.md`) || 
         fileName.endsWith(`.markdown`) || 
         fileName.endsWith(`.mdx`);
}