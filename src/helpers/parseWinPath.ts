export const parseWinPath = (path: string | undefined): string => {
  return path?.split(`\\`).join(`/`) || '';
}