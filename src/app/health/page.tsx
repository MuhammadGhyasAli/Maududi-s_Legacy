export const metadata = { title: "Health Check" };

export default function HealthPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          API Healthy
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Maududi&apos;s Legacy backend is running.
        </p>
      </div>
    </main>
  );
}
