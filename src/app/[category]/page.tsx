"use client";

import React, { useEffect, useState } from "react";
import BookGrid from "../../components/BookGrid";
import { BookGridSkeleton } from "../../components/Skeleton";
import type { Book } from "../../types";
import { apiService } from "../../services/apiService";

export default function CategoryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const fetched = await apiService.getBooks();
        setBooks(fetched as any);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <main className="flex-1 container mx-auto px-4 py-8">
        <BookGridSkeleton />
      </main>
    );
  }

  return <BookGrid books={books} />;
}

