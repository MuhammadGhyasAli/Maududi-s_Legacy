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
}

const BOOKS_PER_PAGE = 15;

const BookGrid: React.FC<BookGridProps> = ({ books }) => {
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
        <div className="text-center max-w-3xl mx-auto mb-8">
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
          />
        </div>

        {/* Book results */}
        {paginatedBooks.length > 0 ? (
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
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              No books found
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
              Try adjusting your search or select a different category.
            </p>
          </div>
        )}
      </main>
    </>
  );
};

export default BookGrid;
