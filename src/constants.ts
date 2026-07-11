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

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "All": "Discover the complete works of Sayyid Abul A'la Maududi across all categories",
  "Tafsir": "Quranic exegesis and commentary — exploring the deeper meanings of the Quran through Maududi's seminal Tafheem ul Quran",
  "Politics": "Islamic political thought, governance, statecraft, and the principles of an Islamic polity",
  "Theology": "Islamic creed, faith, belief in Allah, prophethood, and the fundamentals of the Islamic worldview",
  "Economics": "Islamic economics, riba (interest), wealth distribution, and economic justice from an Islamic perspective",
  "Jurisprudence": "Islamic law and jurisprudence — Fiqh, Shariah, rulings, and legal principles",
  "Social Issues": "Social reform, women's rights, family, education, and moral development in Islamic society",
  "History": "Islamic history, civilization, and the lessons of the Muslim ummah's past",
  "Guidance": "Spiritual guidance, worship, character development, and personal purification",
};

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
export const TOAST_DURATION = 4000;
export const READING_HISTORY_LIMIT = 10;

export const LANGUAGE_LOCALE_MAP: Record<string, string> = {
  English: 'en-US',
  Turkish: 'tr-TR',
  Urdu: 'ur-PK',
  Arabic: 'ar-SA',
  Persian: 'fa-IR',
  Bengali: 'bn-BD',
};
