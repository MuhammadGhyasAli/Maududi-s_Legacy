export const CATEGORIES: string[] = [
  "All",
  "Tafsir",
  "Politics",
  "Theology",
  "Economics",
  "Jurisprudence",
  "Social Issues",
  "History",
  "Guidance",
];

export const CATEGORY_SLUGS: string[] = [
  "tafsir",
  "politics",
  "theology",
  "economics",
  "jurisprudence",
  "social-issues",
  "history",
  "guidance",
];

export const LANGUAGES: string[] = [
  "English",
  "Turkish",
  "Urdu",
  "Arabic",
  "Persian",
  "Bengali",
];

export const SORT_OPTIONS = {
  DEFAULT: "default",
  READING_PREFERENCE: "reading-preference",
  TITLE_ASC: "title-asc",
  TITLE_DESC: "title-desc",
  YEAR_DESC: "year-desc",
  YEAR_ASC: "year-asc",
} as const;

export const CACHE_DURATION = 30 * 60 * 1000;
export const STALE_DURATION = 5 * 60 * 1000;
export const BOOKS_PER_PAGE = 15;
export const TOAST_DURATION = 3000;
export const READING_HISTORY_LIMIT = 10;
