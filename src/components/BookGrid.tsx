"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Book } from '../types';
import BookCard from './BookCard';
import Pagination from './Pagination';
import SortFilterControls from './SortFilterControls';
import SearchBar from './SearchBar';
import { CATEGORIES } from '../constants';
import { deslugifyCategory } from '../utils/slugify';
import { useDebounce } from '../hooks/useDebounce';
import Breadcrumbs from './Breadcrumbs';

interface BookGridProps {
  books: Book[];
}

const BOOKS_PER_PAGE = 15;

const BookGrid: React.FC<BookGridProps> = ({ books }) => {
  const router = useRouter();
  const params = useParams();
  const category = (params?.category as string | undefined) || undefined;
  const categoryName = category ? deslugifyCategory(category) : 'All';
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
  }, [books, categoryName, debouncedSearch, sortBy]);

  const totalPages = Math.ceil(processedBooks.length / BOOKS_PER_PAGE);
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
    return processedBooks.slice(startIndex, startIndex + BOOKS_PER_PAGE);
  }, [currentPage, processedBooks]);

  const handleSelectBook = (book: Book) => {
    const bookSlug = book.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    const categorySlug = category ? category.toLowerCase().replace(/\s+/g, '-') : 'all';
    router.push(`/${categorySlug}/${bookSlug}`);
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, category, sortBy]);

  // Prefetch book detail pages for instant navigation
  React.useEffect(() => {
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
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-semibold
                          bg-emerald-100 dark:bg-emerald-900/40
                          text-brand-green dark:text-brand-green-dark
                          border border-emerald-200 dark:border-emerald-800/50">
            <span>📚</span>
            <span>Islamic Scholarship Library</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3 leading-tight">
            Explore the{' '}
            <span className="gradient-text">Works of Maududi</span>
          </h2>
          <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Search, read, and have AI-powered conversations about the complete writings of
            Sayyid Abul A'la Maududi — in multiple languages.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-5">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>

        {/* Sort & filter */}
        <div className="max-w-5xl mx-auto mb-8">
          <SortFilterControls
            categories={CATEGORIES}
            selectedCategory={category || 'All'}
            onSelectCategory={() => {}}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            totalBooks={processedBooks.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {/* Book results */}
        {paginatedBooks.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {paginatedBooks.map(book => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={handleSelectBook}
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
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No books found
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Try adjusting your search or select a different category.
            </p>
          </div>
        )}
      </main>
    </>
  );
};

export default BookGrid;
