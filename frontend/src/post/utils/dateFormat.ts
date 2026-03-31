export function formatDateTime(value: string): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(value: string): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function isEdited(createDate?: string, updateDate?: string): boolean {
  if (!createDate || !updateDate) return false;

  const created = new Date(createDate).getTime();
  const updated = new Date(updateDate).getTime();

  if (Number.isNaN(created) || Number.isNaN(updated)) return false;
  return updated - created > 1000;
}
