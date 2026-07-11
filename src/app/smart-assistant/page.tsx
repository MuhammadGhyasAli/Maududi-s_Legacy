"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import type { Book } from "../../types";
import { slugify } from "../../utils/slugify";

const SmartAssistant = dynamic(() => import("../../components/SmartAssistant"), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-brand-bg-light dark:bg-brand-bg-dark">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
    </div>
  ),
});

export default function SmartAssistantRoute() {
  useDocumentMeta('Smart Assistant');
  const router = useRouter();

  const onNavigateToBook = (book: Book) => {
    router.push(`/${slugify(book.category || "")}/${slugify(book.title || "")}`);
  };

  return <SmartAssistant onNavigateToBook={onNavigateToBook} />;
}
