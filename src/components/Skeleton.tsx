import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'rectangular',
  width,
  height 
}) => {
  const baseClasses = 'skeleton-shimmer';
  
  const variantClasses = {
    text: 'rounded h-4',
    rectangular: 'rounded',
    circular: 'rounded-full'
  };
  
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// Specific skeleton components for different use cases
export const BookCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-brand-card-dark rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.07] shadow-sm">
    <Skeleton variant="rectangular" className="w-full aspect-[3/4] max-h-48" />
    <div className="p-4 space-y-2.5">
      <Skeleton variant="text" className="w-4/5 h-4" />
      <Skeleton variant="text" className="w-1/3 h-3" />
      <div className="pt-1.5 space-y-1.5">
        <Skeleton variant="text" className="w-full h-2.5" />
        <Skeleton variant="text" className="w-2/3 h-2.5" />
      </div>
    </div>
  </div>
);

export const BookGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
    {[...Array(15)].map((_, i) => (
      <div key={i} className={`animate-fade-in-scale-delay-${Math.min(i % 5, 5)}`}>
        <BookCardSkeleton />
      </div>
    ))}
  </div>
);

export const BookDetailSkeleton: React.FC = () => (
  <div className="max-w-5xl mx-auto px-4 py-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
      <div className="md:col-span-1">
        <Skeleton variant="rectangular" className="w-full aspect-[3/4] rounded-2xl" />
      </div>
      <div className="md:col-span-2 space-y-4">
        <Skeleton variant="text" className="w-24 h-6" />
        <Skeleton variant="text" className="w-3/4 h-10" />
        <Skeleton variant="text" className="w-1/2 h-5" />
        <div className="space-y-2 pt-2">
          <Skeleton variant="text" className="w-full h-4" />
          <Skeleton variant="text" className="w-full h-4" />
          <Skeleton variant="text" className="w-4/5 h-4" />
        </div>
        <div className="flex gap-3 pt-4">
          <Skeleton variant="rectangular" className="flex-1 h-12 rounded-xl" />
          <Skeleton variant="rectangular" className="flex-1 h-12 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

export default Skeleton;
