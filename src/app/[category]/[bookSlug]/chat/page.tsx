"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Book } from "../../../../types";
import { apiService } from "../../../../services/apiService";
import ChatPage from "../../../../components/ChatPage";
import { findBookBySlug } from "../../../../utils/slugify";

export default function BookChatPage() {
  const router = useRouter();
  const params = useParams();
  const bookSlug = params?.bookSlug as string | undefined;

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

  const book = useMemo(() => {
    if (!bookSlug) return null;
    return findBookBySlug(books, bookSlug) as Book | null;
  }, [books, bookSlug]);

  if (loading || !book) return null;

  return (
    <ChatPage
      book={book}
      onBack={() => router.back()}
      onNavigateToBook={(b) => router.push(`/all/${(b.title || "").toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-")}`)}
    />
  );
}

