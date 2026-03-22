import BadWordsFilter from "badwords-ko";

const CUSTOM_BADWORDS: string[] = [
  // 서비스 운영 중 필요한 표현을 여기에 계속 추가
];

const ALLOW_WORDS: string[] = [
  // 오탐 단어를 허용하려면 여기에 추가
];

type ProfanityOptions = {
  extraWords?: string[];
};

const createFilter = (extraWords: string[] = []) => {
  const filter = new BadWordsFilter({
    list: [...CUSTOM_BADWORDS, ...extraWords],
  });
  if (ALLOW_WORDS.length > 0) {
    filter.removeWords(...ALLOW_WORDS);
  }
  return filter;
};

const defaultFilter = createFilter();

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
  const filter = options.extraWords?.length ? createFilter(options.extraWords) : defaultFilter;
  return filter.isProfane(normalized) || filter.isProfane(compact);
}

export function maskProfanity(value: string, options: ProfanityOptions = {}): string {
  const normalized = value.trim();
  if (!normalized) {
    return value;
  }
  const filter = options.extraWords?.length ? createFilter(options.extraWords) : defaultFilter;
  return filter.clean(value);
}
