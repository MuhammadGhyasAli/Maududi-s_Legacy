"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Book } from "../../../types";
import { apiService } from "../../../services/apiService";
import BookDetail from "../../../components/BookDetail";
import { BookDetailSkeleton } from "../../../components/Skeleton";
import { findBookBySlug } from "../../../utils/slugify";

export default function BookPage() {
  const router = useRouter();
  const params = useParams();
  const bookSlug = params?.bookSlug as string | undefined;
  const category = (params?.category as string | undefined) || "all";

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const fetched = await apiService.getBooks();
        setBooks(fetched);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load books');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const book = useMemo(() => {
    if (!bookSlug) return null;
    return findBookBySlug(books, bookSlug) ?? null;
  }, [books, bookSlug]);

  if (loading) return <BookDetailSkeleton />;
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg-light dark:bg-brand-bg-dark">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Failed to Load Book</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="cursor-pointer px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg-light dark:bg-brand-bg-dark">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Book Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The book you're looking for doesn't exist or may have been moved.
          </p>
          <button
            onClick={() => router.back()}
            className="cursor-pointer px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <BookDetail
      book={book}
      onBack={() => router.back()}
      onReadPdf={() => window.open(book.pdfUrl, "_blank", "noopener,noreferrer")}
      onStartChat={() => router.push(`/${category}/${bookSlug}/chat`)}
    />
  );
}

