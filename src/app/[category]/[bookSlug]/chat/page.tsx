"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import type { Book } from "../../../../types";
import { apiService } from "../../../../services/apiService";
import { findBookBySlug, slugify } from "../../../../utils/slugify";

const ChatPage = dynamic(() => import("../../../../components/ChatPage"), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-brand-bg-light dark:bg-brand-bg-dark">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
    </div>
  ),
});

export default function BookChatPage() {
  const router = useRouter();
  const params = useParams();
  const bookSlug = params?.bookSlug as string | undefined;

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const fetched = await apiService.getBooks();
        setBooks(fetched);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load books");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const book = useMemo(() => {
    if (!bookSlug) return null;
    return findBookBySlug(books, bookSlug);
  }, [books, bookSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg-light dark:bg-brand-bg-dark">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-brand-bg-light dark:bg-brand-bg-dark text-gray-600 dark:text-gray-400">
        <p className="text-lg mb-4">Failed to load books</p>
        <p className="text-sm mb-6">{error}</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-brand-primary text-white rounded hover:opacity-90">
          Go Back
        </button>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-brand-bg-light dark:bg-brand-bg-dark text-gray-600 dark:text-gray-400">
        <p className="text-lg mb-4">Book not found</p>
        <p className="text-sm mb-6">The book "{bookSlug}" could not be found.</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-brand-primary text-white rounded hover:opacity-90">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <ChatPage
      book={book}
      books={books}
      onBack={() => router.back()}
      onNavigateToBook={(b) => { const cat = (b.category || "").toLowerCase().replace(/\s+/g, "-"); router.push(`/${cat}/${slugify(b.title || "")}`); }}
    />
  );
}
