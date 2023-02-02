import fetch from 'node-fetch';

export const fetchWithTimeout = async (url: string, options: any, timeout = 5000) => {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    throw new Error(`Request timed out: ${url}`);
  }
};
