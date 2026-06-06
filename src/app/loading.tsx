import { BookGridSkeleton } from "../components/Skeleton";

export default function RootLoading() {
  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="relative text-center max-w-3xl mx-auto mb-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
          <svg className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] opacity-[0.03] dark:opacity-[0.04]" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="300" cy="300" r="280" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="300" cy="300" r="220" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="300" cy="300" r="160" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="300" cy="300" r="100" stroke="currentColor" strokeWidth="0.5" />
            <line x1="20" y1="300" x2="580" y2="300" stroke="currentColor" strokeWidth="0.3" />
            <line x1="300" y1="20" x2="300" y2="580" stroke="currentColor" strokeWidth="0.3" />
            <line x1="102" y1="102" x2="498" y2="498" stroke="currentColor" strokeWidth="0.3" />
            <line x1="498" y1="102" x2="102" y2="498" stroke="currentColor" strokeWidth="0.3" />
            <polygon points="300,50 420,180 380,320 220,320 180,180" stroke="currentColor" strokeWidth="0.4" fill="none" />
            <polygon points="300,550 420,420 380,280 220,280 180,420" stroke="currentColor" strokeWidth="0.4" fill="none" />
            <circle cx="300" cy="300" r="40" stroke="currentColor" strokeWidth="0.4" fill="none" />
          </svg>
        </div>
        <div className="skeleton-shimmer mx-auto rounded-full h-7 w-48 mb-5" />
        <div className="skeleton-shimmer mx-auto rounded h-14 w-3/4 mb-4" />
        <div className="skeleton-shimmer mx-auto rounded h-5 w-2/3" />
      </div>
      <BookGridSkeleton />
    </main>
  );
}
