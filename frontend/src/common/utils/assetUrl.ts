const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim() ?? "";

const normalizedBackendUrl = BACKEND_URL.replace(/\/+$/, "");

const ASSET_PATH_PREFIXES = ["/uploads/", "/images/", "/api/chat/files/"];

function isAbsoluteUrl(value: string): boolean {
  return /^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(value) || /^(data:|blob:|mailto:|tel:)/i.test(value);
}

function shouldAttachBackendOrigin(value: string): boolean {
  return ASSET_PATH_PREFIXES.some((prefix) => value.startsWith(prefix));
}

export function toAssetUrl(value?: string | null): string {
  if (!value) {
    return "";
  }
  if (isAbsoluteUrl(value)) {
    return value;
  }
  if (!normalizedBackendUrl) {
    return value;
  }
  if (!shouldAttachBackendOrigin(value)) {
    return value;
  }
  return `${normalizedBackendUrl}${value}`;
}

export function rewriteHtmlAssetUrls(html: string): string {
  return html.replace(
    /(src|href)\s*=\s*(["'])(\/(?:uploads|images|api\/chat\/files)\/[^"']*)\2/gi,
    (_, attr: string, quote: string, path: string) => `${attr}=${quote}${toAssetUrl(path)}${quote}`,
  );
}
