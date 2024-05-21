import { urlJoin } from 'url-join-ts';

export const joinUrl = (baseUrl: string | undefined, ...paths: any[]): string => {
  const url = urlJoin(baseUrl, ...paths);

  // Get last path
  const lastPath = paths[paths.length - 1];
  if (lastPath && lastPath.endsWith('/') && !url.endsWith('/')) {
    return url + '/';
  }

  return url;
};
