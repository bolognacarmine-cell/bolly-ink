interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string;
  height?: string;
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height 
}: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  };

  return (
    <div
      className={`animate-pulse bg-white/10 ${variants[variant]} ${className}`}
      style={{ width, height }}
      role="status"
      aria-label="Caricamento"
    />
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <Skeleton variant="text" width="60%" height="24px" />
        <Skeleton variant="rectangular" width="40px" height="20px" />
      </div>
      <Skeleton variant="text" className="mb-2" />
      <Skeleton variant="text" className="mb-2" width="80%" />
      <Skeleton variant="text" width="60%" />
      <div className="mt-5 flex gap-2">
        <Skeleton variant="rectangular" width="60px" height="24px" />
        <Skeleton variant="rectangular" width="60px" height="24px" />
      </div>
    </div>
  );
}
