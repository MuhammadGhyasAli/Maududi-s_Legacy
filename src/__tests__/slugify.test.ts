import { slugify, deslugifyCategory, findBookBySlug } from '../utils/slugify';

describe('slugify', () => {
  it('converts string to URL-safe slug', () => {
    expect(slugify('Tafheem ul Quran')).toBe('tafheem-ul-quran');
  });

  it('removes special characters', () => {
    expect(slugify('Islamic Law & Constitution')).toBe('islamic-law-constitution');
  });

  it('trims whitespace', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world');
  });
});

describe('deslugifyCategory', () => {
  it('returns proper name for known categories', () => {
    expect(deslugifyCategory('social-issues')).toBe('Social Issues');
    expect(deslugifyCategory('tafsir')).toBe('Tafsir');
    expect(deslugifyCategory('all')).toBe('All');
  });

  it('capitalizes unknown slugs', () => {
    expect(deslugifyCategory('custom-category')).toBe('Custom Category');
  });
});

describe('findBookBySlug', () => {
  const books = [
    { title: 'Tafheem ul Quran' },
    { title: 'Islamic Law and Constitution' },
  ];

  it('finds book by slugified title', () => {
    const book = findBookBySlug(books, 'tafheem-ul-quran');
    expect(book).toBeDefined();
    expect(book?.title).toBe('Tafheem ul Quran');
  });

  it('returns undefined for non-matching slug', () => {
    const book = findBookBySlug(books, 'nonexistent-book');
    expect(book).toBeUndefined();
  });
});
