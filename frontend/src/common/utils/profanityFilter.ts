import Filter from "badwords-ko";

const ALLOW_WORDS: string[] = [
  // 오탐 단어를 허용하려면 여기에 추가
];

type ProfanityOptions = {
  extraWords?: string[];
};

const defaultFilter = new Filter();
if (ALLOW_WORDS.length > 0) {
  defaultFilter.removeWords(...ALLOW_WORDS);
}
const defaultWords = ((defaultFilter as unknown as { options?: { list?: string[] } }).options?.list ?? []).filter(
  (word) => !!word?.trim() && !ALLOW_WORDS.includes(word),
);

function createFilter(extraWords: string[] = []): Filter {
  if (extraWords.length === 0) {
    return defaultFilter;
  }

  const filter = new Filter({ list: [...defaultWords, ...extraWords] });
  if (ALLOW_WORDS.length > 0) {
    filter.removeWords(...ALLOW_WORDS);
  }
  return filter;
}

export function stripHtmlToText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasProfanity(value: string, options: ProfanityOptions = {}): boolean {
  const normalized = value.trim();
  if (!normalized) {
    return false;
  }
  const compact = normalized.replace(/\s+/g, "");
  const filter = createFilter(options.extraWords ?? []);
  return filter.isProfane(normalized) || filter.isProfane(compact);
}

export function maskProfanity(value: string, options: ProfanityOptions = {}): string {
  const normalized = value.trim();
  if (!normalized) {
    return value;
  }
  const filter = createFilter(options.extraWords ?? []);
  return filter.clean(value);
}
