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
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
    <Skeleton variant="rectangular" className="w-full h-48" />
    <div className="p-4">
      <Skeleton variant="text" className="w-3/4 h-6 mb-2" />
      <Skeleton variant="text" className="w-1/2 h-4 mb-2" />
      <Skeleton variant="text" className="w-full h-3 mb-1" />
      <Skeleton variant="text" className="w-2/3 h-3" />
    </div>
  </div>
);

export const BookGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
    {[...Array(15)].map((_, i) => (
      <BookCardSkeleton key={i} />
    ))}
  </div>
);

export const BookDetailSkeleton: React.FC = () => (
  <div className="max-w-6xl mx-auto px-4 py-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <Skeleton variant="rectangular" className="w-full h-96" />
      </div>
      <div className="space-y-4">
        <Skeleton variant="text" className="w-3/4 h-8" />
        <Skeleton variant="text" className="w-1/2 h-6" />
        <Skeleton variant="text" className="w-full h-4 mb-2" />
        <Skeleton variant="text" className="w-full h-4 mb-2" />
        <Skeleton variant="text" className="w-2/3 h-4 mb-4" />
        <div className="flex gap-4">
          <Skeleton variant="rectangular" className="w-32 h-10" />
          <Skeleton variant="rectangular" className="w-32 h-10" />
        </div>
      </div>
    </div>
  </div>
);

export default Skeleton;
