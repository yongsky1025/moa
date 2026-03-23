declare module "badwords-ko" {
  interface FilterOptions {
    emptyList?: boolean;
    list?: string[];
    exclude?: string[];
    splitRegex?: RegExp;
    placeHolder?: string;
    regex?: RegExp;
    replaceRegex?: RegExp;
  }

  export default class Filter {
    constructor(options?: FilterOptions);
    isProfane(value: string): boolean;
    clean(value: string): string;
    addWords(...wordsToAdd: string[]): void;
    removeWords(...wordsToRemove: string[]): void;
  }
}

