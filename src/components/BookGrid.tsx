"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Book } from '../types';
import BookCard from './BookCard';
import Pagination from './Pagination';
import SortFilterControls from './SortFilterControls';
import SearchBar from './SearchBar';
import { deslugifyCategory } from '../utils/slugify';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import Breadcrumbs from './Breadcrumbs';

interface BookGridProps {
  books: Book[];
  loading?: boolean;
}

const BOOKS_PER_PAGE = 15;

const BookGrid: React.FC<BookGridProps> = ({ books, loading = false }) => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const category = (params?.category as string | undefined) || undefined;
  const categoryName = category ? deslugifyCategory(category) : 'All';
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { user } = useAuth();
  const [readingPrefCategories, setReadingPrefCategories] = useState<string[] | null>(null);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);

  useEffect(() => {
    if (!user || category) return;
    apiService.getReadingHistory()
      .then(history => {
        const slugs = history.slice(0, 8).map((h: { slug: string }) => h.slug);
        const matched = books.filter(b => {
          const slug = b.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
          return slugs.includes(slug);
        });
        setRecentBooks(matched);
      })
      .catch(() => setRecentBooks([]));
  }, [user, category, books]);

  useEffect(() => {
    if (sortBy === 'reading-preference' && user) {
      apiService.getReadingHistory()
        .then(history => {
          const counts: Record<string, number> = {};
          history.forEach((h: { category?: string }) => {
            if (h.category) counts[h.category] = (counts[h.category] || 0) + 1;
          });
          setReadingPrefCategories(Object.entries(counts).sort((a, b) => b[1] - a[1]).map(e => e[0]));
        })
        .catch(() => setReadingPrefCategories(null));
    } else if (sortBy !== 'reading-preference') {
      setReadingPrefCategories(null);
    }
  }, [sortBy, user]);

  const [currentPage, setCurrentPage] = useState(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    return isNaN(page) || page < 1 ? 1 : page;
  });

  const processedBooks = useMemo(() => {
    let filteredBooks = books;

    if (categoryName && categoryName !== 'All') {
      filteredBooks = filteredBooks.filter(book => book.category === categoryName);
    }

    if (debouncedSearch) {
      const lowercasedTerm = debouncedSearch.toLowerCase();
      filteredBooks = filteredBooks.filter(book =>
        book.title.toLowerCase().includes(lowercasedTerm) ||
        book.description.toLowerCase().includes(lowercasedTerm) ||
        book.author.toLowerCase().includes(lowercasedTerm)
      );
    }

    const sortedBooks = [...filteredBooks];

    switch (sortBy) {
      case 'title-asc':
        sortedBooks.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        sortedBooks.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'year-desc':
        sortedBooks.sort((a, b) => b.publicationYear - a.publicationYear);
        break;
      case 'year-asc':
        sortedBooks.sort((a, b) => a.publicationYear - b.publicationYear);
        break;
      case 'reading-preference': {
        if (readingPrefCategories && readingPrefCategories.length > 0) {
          sortedBooks.sort((a, b) => {
            const aIdx = readingPrefCategories.indexOf(a.category);
            const bIdx = readingPrefCategories.indexOf(b.category);
            const aRank = aIdx >= 0 ? aIdx : readingPrefCategories.length;
            const bRank = bIdx >= 0 ? bIdx : readingPrefCategories.length;
            if (aRank !== bRank) return aRank - bRank;
            return a.title.localeCompare(b.title);
          });
        }
        break;
      }
      case 'default':
      default: {
        const tafheemBooks = sortedBooks.filter(book => book.title.startsWith("Tafheem ul Quran"));
        const otherBooks = sortedBooks.filter(book => !book.title.startsWith("Tafheem ul Quran"));
        tafheemBooks.sort((a, b) => {
          const volumeA = parseInt(a.title.match(/\(Vol\. (\d+)\)/)?.[1] || '0');
          const volumeB = parseInt(b.title.match(/\(Vol\. (\d+)\)/)?.[1] || '0');
          return volumeA - volumeB;
        });
        otherBooks.sort((a, b) => a.title.localeCompare(b.title));
        return [...tafheemBooks, ...otherBooks];
      }
    }

    return sortedBooks;
  }, [books, categoryName, debouncedSearch, sortBy, readingPrefCategories]);

  const totalPages = Math.ceil(processedBooks.length / BOOKS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedBooks = useMemo(() => {
    const safePage = Math.min(currentPage, Math.max(1, totalPages));
    const startIndex = (safePage - 1) * BOOKS_PER_PAGE;
    return processedBooks.slice(startIndex, startIndex + BOOKS_PER_PAGE);
  }, [currentPage, processedBooks, totalPages]);

  const featuredBooks = useMemo(() => {
    const FEATURED_PATTERNS = [
      'Tafheem ul Quran',
      'Khutabat',
      'Jihad in Islam',
      'Islamic Economic System',
      'Towards Understanding Islam',
      'Four Basic Quranic Terms',
      'Process of Islamic Revolution',
      'Human Rights in Islam',
      'Islamic Civilization',
      'Purda',
    ];
    return books
      .filter(b => FEATURED_PATTERNS.some(p => b.title.toLowerCase().includes(p.toLowerCase())))
      .sort((a, b) => {
        const aIdx = FEATURED_PATTERNS.findIndex(p => a.title.toLowerCase().includes(p.toLowerCase()));
        const bIdx = FEATURED_PATTERNS.findIndex(p => b.title.toLowerCase().includes(p.toLowerCase()));
        return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
      });
  }, [books]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    router.push(`?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [router, searchParams]);

  const handleSelectBook = useCallback((book: Book) => {
    const bookSlug = book.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    const categorySlug = category ? category.toLowerCase().replace(/\s+/g, '-') : 'all';
    router.push(`/${categorySlug}/${bookSlug}`);
  }, [category, router]);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const handleSortChange = useCallback((sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const handleViewModeChange = useCallback((view: 'grid' | 'list') => {
    setViewMode(view);
  }, []);

  // Prefetch book detail pages for instant navigation
  useEffect(() => {
    const cat = category ? category.toLowerCase().replace(/\s+/g, '-') : 'all';
    paginatedBooks.slice(0, 6).forEach(book => {
      const slug = book.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      router.prefetch(`/${cat}/${slug}`);
    });
  }, [paginatedBooks, category, router]);

  return (
    <>
      <main className="flex-1 container mx-auto px-4 py-8">

        {/* Breadcrumbs */}
        <Breadcrumbs crumbs={[
          { label: 'Home', href: '/' },
          ...(category && category !== 'all'
            ? [{ label: categoryName, href: `/${category}` }]
            : []),
        ]} />

        {/* Hero section */}
        <div className="relative text-center max-w-3xl mx-auto mb-8">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
            <svg className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] opacity-[0.03] dark:opacity-[0.04]" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="300" cy="300" r="280" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="300" cy="300" r="220" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="300" cy="300" r="160" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="300" cy="300" r="100" stroke="currentColor" strokeWidth="0.5" />
              <line x1="20" y1="300" x2="580" y2="300" stroke="currentColor" strokeWidth="0.3" />
              <line x1="300" y1="20" x2="300" y2="580" stroke="currentColor" strokeWidth="0.3" />
              <line x1="102" y1="102" x2="498" y2="498" stroke="currentColor" strokeWidth="0.3" />
              <line x1="498" y1="102" x2="102" y2="498" stroke="currentColor" strokeWidth="0.3" />
              <polygon points="300,50 420,180 380,320 220,320 180,180" stroke="currentColor" strokeWidth="0.4" fill="none" />
              <polygon points="300,550 420,420 380,280 220,280 180,420" stroke="currentColor" strokeWidth="0.4" fill="none" />
              <circle cx="300" cy="300" r="40" stroke="currentColor" strokeWidth="0.4" fill="none" />
            </svg>
          </div>
          <div className="inline-flex items-center gap-1.5 mb-5 px-3.5 py-1.5 rounded-full text-xs font-semibold
                          bg-emerald-50 dark:bg-emerald-900/30
                          text-emerald-700 dark:text-emerald-300
                          border border-emerald-200/60 dark:border-emerald-800/50
                          shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            Islamic Scholarship Library
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-[1.1] tracking-tight">
            Explore the{' '}
            <span className="gradient-text">Works of Maududi</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Search, read, and have AI-powered conversations about the complete writings of
            Sayyid Abul A&apos;la Maududi — in multiple languages.
          </p>
        </div>

        {/* Featured / Popular books */}
        {featuredBooks.length > 0 && !category && !debouncedSearch && !loading && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Featured Works</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-amber-200/60 to-transparent dark:from-amber-800/30" />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin -mx-4 px-4 snap-x snap-mandatory">
              {featuredBooks.map(book => (
                <button
                  key={book.id}
                  onClick={() => handleSelectBook(book)}
                  className="flex-none w-28 snap-start group text-left"
                >
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 dark:bg-brand-navy-mid shadow-sm ring-1 ring-gray-200/60 dark:ring-white/10 group-hover:ring-amber-300 dark:group-hover:ring-amber-700 transition-all duration-200">
                    <Image src={book.imageUrl} alt={book.title} fill sizes="112px" className="object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mt-1.5 truncate leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {book.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Continue Reading */}
        {recentBooks.length > 0 && !category && !debouncedSearch && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Continue Reading</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-emerald-200/60 to-transparent dark:from-emerald-800/30" />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin -mx-4 px-4 snap-x snap-mandatory">
              {recentBooks.map(book => (
                <button
                  key={book.id}
                  onClick={() => handleSelectBook(book)}
                  className="flex-none w-28 snap-start group text-left"
                >
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 dark:bg-brand-navy-mid shadow-sm ring-1 ring-gray-200/60 dark:ring-white/10 group-hover:ring-emerald-300 dark:group-hover:ring-emerald-700 transition-all duration-200">
                    <Image src={book.imageUrl} alt={book.title} fill sizes="112px" className="object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mt-1.5 truncate leading-snug group-hover:text-brand-green dark:group-hover:text-brand-green-dark transition-colors">
                    {book.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="max-w-xl mx-auto mb-6">
          <SearchBar searchTerm={searchTerm} setSearchTerm={handleSearchChange} />
        </div>

        {/* Sort & filter */}
        <div className="max-w-5xl mx-auto mb-8 px-0.5">
          <SortFilterControls
            sortBy={sortBy}
            onSortByChange={handleSortChange}
            totalBooks={processedBooks.length}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            isAuthenticated={!!user}
          />
        </div>

        {/* Book results */}
        {loading ? (
          <>
            {/* Enhanced skeleton with category pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {['Tafsir', 'Politics', 'Theology', 'Economics', 'Jurisprudence', 'History'].map(cat => (
                <div key={cat} className="skeleton-shimmer rounded-full h-8 w-20" />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {[...Array(15)].map((_, i) => (
                <div key={i} className={`animate-fade-in-scale-delay-${Math.min(i % 5, 5)}`}>
                  <div className="bg-white dark:bg-brand-card-dark rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.07] shadow-sm">
                    <div className="skeleton-shimmer rounded w-full aspect-[3/4] max-h-48" />
                    <div className="p-4 space-y-2.5">
                      <div className="skeleton-shimmer rounded h-4 w-4/5 h-4" />
                      <div className="skeleton-shimmer rounded h-4 w-1/3 h-3" />
                      <div className="pt-1.5 space-y-1.5">
                        <div className="skeleton-shimmer rounded h-4 w-full h-2.5" />
                        <div className="skeleton-shimmer rounded h-4 w-2/3 h-2.5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : paginatedBooks.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {paginatedBooks.map((book, idx) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={handleSelectBook}
                    priority={idx === 0}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedBooks.map(book => (
                  <div
                    key={book.id}
                    onClick={() => handleSelectBook(book)}
                    className="
                      flex gap-4 items-start cursor-pointer group
                      bg-white dark:bg-brand-card-dark
                      rounded-2xl overflow-hidden
                      border border-gray-100 dark:border-white/[0.07]
                      shadow-card hover:shadow-card-lg
                      hover:-translate-y-0.5 hover:border-emerald-200 dark:hover:border-emerald-800/60
                      transition-all duration-200 p-3
                    "
                  >
                    <div className="relative w-24 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-brand-navy-mid">
                      <Image
                        src={book.imageUrl}
                        alt={book.title}
                        fill
                        sizes="96px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100
                                     group-hover:text-brand-green dark:group-hover:text-brand-green-dark
                                     transition-colors duration-200 leading-snug mb-1 line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                        {book.author} · {book.publicationYear} · {book.category}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                        {book.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/30 flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-200/50 dark:ring-emerald-800/30">
              <svg className="w-9 h-9 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              {debouncedSearch ? 'No books match your search' : 'No books found'}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm mx-auto mb-8">
              {debouncedSearch
                ? 'Try a different keyword or browse by category below.'
                : 'Try adjusting your search or select a different category.'}
            </p>
            {!debouncedSearch && !category && (
              <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                {['Tafsir', 'Politics', 'Theology', 'History'].map(cat => {
                  const slug = cat.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <button
                      key={cat}
                      onClick={() => router.push(`/${slug}`)}
                      className="cursor-pointer px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-brand-card-dark text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-emerald-200 dark:hover:border-emerald-800/50 hover:text-brand-green dark:hover:text-brand-green-dark hover:shadow-sm transition-all duration-200"
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
};

export default BookGrid;
