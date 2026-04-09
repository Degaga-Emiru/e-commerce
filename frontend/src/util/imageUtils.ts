export const getImageUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  // If it starts with /uploads, prepend the backend host
  if (url.startsWith('/uploads')) {
    return `http://localhost:8080${url}`;
  }
  return url;
};
