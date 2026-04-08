const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim() ?? "";

const normalizedBackendUrl = BACKEND_URL.replace(/\/+$/, "");

function isAbsoluteUrl(value: string): boolean {
  return /^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(value);
}

export function toBackendUrl(path: string): string {
  if (!path) return path;
  if (isAbsoluteUrl(path)) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!normalizedBackendUrl) return normalizedPath;
  return `${normalizedBackendUrl}${normalizedPath}`;
}

