const SkeletonLoader = ({ className = '', lines = 1 }) => {
  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={`animate-pulse bg-white/10 rounded-lg h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
        ))}
      </div>
    );
  }
  return <div className={`animate-pulse bg-white/10 rounded-lg ${className}`} />;
};

export const CardSkeleton = () => (
  <div className="glass rounded-2xl p-5 space-y-3">
    <SkeletonLoader className="h-4 w-1/3" />
    <SkeletonLoader className="h-8 w-1/2" />
    <SkeletonLoader className="h-3 w-2/3" />
  </div>
);

export default SkeletonLoader;
