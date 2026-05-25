"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AiContextFinderPage from "../../components/AiContextFinderModal";
import type { Book } from "../../types";

function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function AiContextFinderRoute() {
  const router = useRouter();

  const onNavigateToBook = (book: Book) => {
    // Best-effort: route via "all" category.
    router.push(`/all/${slugifyTitle(book.title)}`);
  };

  return <AiContextFinderPage onNavigateToBook={onNavigateToBook} />;
}

