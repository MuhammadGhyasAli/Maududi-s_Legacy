import React from "react";
import BookGrid from "../components/BookGrid";
import { apiService } from "../services/apiService";

export const revalidate = 0; // Disable static caching (dynamic rendering)

export default async function HomePage() {
  try {
    const books = await apiService.getBooks();
    
    return <BookGrid books={books as any} />;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to load books';
    return (
      <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-brand-card-dark rounded-2xl p-8 text-center
                        border border-amber-200 dark:border-amber-800/40
                        shadow-card dark:shadow-black/30">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Backend Unreachable
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed">{errorMsg}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20
                        rounded-lg px-3 py-2 border border-amber-200/60 dark:border-amber-700/40">
            Make sure the backend server is running on port 8000
          </p>
        </div>
      </main>
    );
  }
}
