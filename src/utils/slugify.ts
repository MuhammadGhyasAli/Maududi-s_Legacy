// Utility to slugify strings
export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
};

// Utility to deslugify category slugs back to proper names
export const deslugifyCategory = (slug: string): string => {
  const categoryMap: { [key: string]: string } = {
    'all': 'All',
    'tafsir': 'Tafsir',
    'politics': 'Politics',
    'theology': 'Theology',
    'economics': 'Economics',
    'jurisprudence': 'Jurisprudence',
    'social-issues': 'Social Issues',
    'history': 'History',
    'guidance': 'Guidance',
  };
  return categoryMap[slug] || slug.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

// Utility to find book by slug
export const findBookBySlug = (books: any[], slug: string): any => {
  return books.find(book => {
    const bookSlug = slugify(book.title);
    return bookSlug === slug;
  });
};
