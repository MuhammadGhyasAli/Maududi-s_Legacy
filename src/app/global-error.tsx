'use client';

export default function GlobalError({
  _error,
  reset,
}: {
  _error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 bg-brand-bg-light dark:bg-brand-bg-dark">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-gray-50 mb-3">
              Critical error
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
              A critical error occurred. Please reload the page.
            </p>
            <button
              onClick={() => reset()}
              className="px-6 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-brand-green to-brand-blue hover:from-brand-green hover:to-brand-blue shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              Reload page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
