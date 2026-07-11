'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
  _error,
  reset,
}: {
  _error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { document.title = "Something Went Wrong | Maududi's Legacy"; }, []);
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-brand-bg-light dark:bg-brand-bg-dark">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-gray-50 mb-3">
          Something went wrong
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-lg text-white font-semibold bg-brand-green hover:bg-brand-green-dark transition-all duration-200 cursor-pointer"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
