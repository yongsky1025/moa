export function getReplyDisplayName(
  name: string | null | undefined,
  fallback = "익명",
): string {
  const normalized = name?.trim();
  return normalized && normalized.length > 0 ? normalized : fallback;
}
