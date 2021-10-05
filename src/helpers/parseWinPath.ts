export const parseWinPath = (path: string | undefined) => {
    return path?.split(`\\`).join(`/`);
  }