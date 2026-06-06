"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Book } from "../../../types";
import { apiService } from "../../../services/apiService";
import BookDetail from "../../../components/BookDetail";
import { BookDetailSkeleton } from "../../../components/Skeleton";
import { useToast } from "../../../components/Toast";
import { findBookBySlug, slugify } from "../../../utils/slugify";

export default function BookPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const bookSlug = params?.bookSlug as string | undefined;
  const category = (params?.category as string | undefined) || "all";

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookSlug) {
      document.title = `${bookSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} - Maududi's Legacy`;
    }
  }, [bookSlug]);

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

  const relatedBooks = useMemo(() => {
    if (!book || !books.length) return [];
    return books
      .filter(b => b.category === book.category && b.id !== book.id)
      .slice(0, 4);
  }, [book, books]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const title = book?.title || "Maududi's Legacy";
    const text = `Check out "${title}" on Maududi's Legacy`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast('Link copied to clipboard!');
    }
  }, [book, toast]);

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
            className="cursor-pointer px-6 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors font-medium"
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
            className="cursor-pointer px-6 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <BookDetail
        book={book}
        onBack={() => router.back()}
        onStartChat={() => router.push(`/${category}/${bookSlug}/chat`)}
      />

      {/* Share & Related Books */}
      <div className="container mx-auto px-4 max-w-5xl pb-16 -mt-3">
        {/* Share */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleShare}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-brand-green dark:hover:text-brand-green-dark hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-gray-700 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
            Share this book
          </button>
        </div>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div>
            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-gray-100 mb-5">
              More in <span className="text-brand-green">{book.category}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedBooks.map((rb) => {
                const rbSlug = slugify(rb.title);
                return (
                  <Link
                    key={rb.id}
                    href={`/${category.replace(/\s+/g, '-')}/${rbSlug}`}
                    className="group block bg-white dark:bg-brand-card-dark rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.07] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden">
                      <Image
                        src={rb.imageUrl}
                        alt={rb.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
                        {rb.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {rb.publicationYear}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
