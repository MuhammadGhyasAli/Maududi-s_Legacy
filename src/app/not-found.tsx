import Link from 'next/link';

export const metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold text-brand-green mb-4">
          404
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          This page could not be found. It may have been moved, renamed, or never existed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-green hover:bg-brand-green-dark text-white font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </main>
  );
}
