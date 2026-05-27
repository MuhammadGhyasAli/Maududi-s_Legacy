"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BookGrid from "../../components/BookGrid";
import { BookGridSkeleton } from "../../components/Skeleton";
import type { Book } from "../../types";
import { apiService } from "../../services/apiService";
import { deslugifyCategory } from "../../utils/slugify";

export default function CategoryPage() {
  const params = useParams();
  const category = params?.category as string | undefined;
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showingRelated, setShowingRelated] = useState(false);

  useEffect(() => {
    (async () => {
      setError(null);
      setLoading(true);
      setShowingRelated(false);
      try {
        const fetched = await apiService.getBooks(category);
        if (fetched.length === 0) {
          // If no books in specific category, try to get all books as fallback
          const allBooks = await apiService.getBooks();
          setBooks(allBooks);
          setShowingRelated(allBooks.length > 0);
        } else {
          setBooks(fetched);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load books');
      } finally {
        setLoading(false);
      }
    })();
  }, [category]);

  if (loading) {
    return (
      <main className="flex-1 container mx-auto px-4 py-8">
        <BookGridSkeleton />
      </main>
    );
  }

  if (error) {
    const isInvalidCategory = error.includes('Invalid category');
    return (
      <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-brand-card-dark rounded-2xl p-8 text-center
                        border border-amber-200 dark:border-amber-800/40
                        shadow-card dark:shadow-black/30">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${isInvalidCategory ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-amber-50 dark:bg-amber-900/30'}`}>
            <span className="text-3xl">{isInvalidCategory ? '🔍' : '⚠️'}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {isInvalidCategory ? 'Category Not Found' : 'Server Unreachable'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed">
            {isInvalidCategory
              ? `The category "${category}" does not exist.`
              : error}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20
                        rounded-lg px-3 py-2 border border-amber-200/60 dark:border-amber-700/40">
            {isInvalidCategory
              ? 'Try selecting a different category from the menu.'
              : 'Books are loaded directly from the server — no external backend needed'}
          </p>
        </div>
      </main>
    );
  }

  if (books.length === 0) {
    return (
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No books found
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Try adjusting your search or select a different category.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      {showingRelated && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Showing related books from all categories (no books found in {category ? `${deslugifyCategory(category)}` : 'selected category'})
          </p>
        </div>
      )}
      <BookGrid books={books} />
    </>
  );
}