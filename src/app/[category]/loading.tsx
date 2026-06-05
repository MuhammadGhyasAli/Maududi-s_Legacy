export default function CategoryLoading() {
  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="skeleton-shimmer rounded h-4 w-20" />
        <div className="skeleton-shimmer rounded h-4 w-24" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {[...Array(10)].map((_, i) => (
          <div key={i}>
            <div className="bg-white dark:bg-brand-card-dark rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.07] shadow-sm">
              <div className="skeleton-shimmer rounded w-full aspect-[3/4] max-h-48" />
              <div className="p-4 space-y-2.5">
                <div className="skeleton-shimmer rounded h-4 w-4/5" />
                <div className="skeleton-shimmer rounded h-3 w-1/3" />
                <div className="pt-1.5 space-y-1.5">
                  <div className="skeleton-shimmer rounded h-2.5 w-full" />
                  <div className="skeleton-shimmer rounded h-2.5 w-2/3" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
