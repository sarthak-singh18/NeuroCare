import { useThemeMode } from '../context/ThemeContext.jsx';

export default function SkeletonLoader({ variant = 'default' }) {
  const { isDark } = useThemeMode();

  const baseClass = `animate-pulse ${
    isDark 
      ? 'bg-purple-900/30' 
      : 'bg-gray-200'
  }`;

  if (variant === 'dashboard') {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className={`${baseClass} h-4 w-32 mb-4 rounded`} />
            <div className={`${baseClass} h-10 w-80 mb-2 rounded`} />
            <div className={`${baseClass} h-6 w-96 rounded`} />
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`p-4 rounded-xl border ${
                isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'
              }`}>
                <div className={`${baseClass} h-8 w-12 mb-2 rounded`} />
                <div className={`${baseClass} h-4 w-20 rounded`} />
              </div>
            ))}
          </div>

          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Chart Skeleton */}
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'
              }`}>
                <div className={`${baseClass} h-6 w-40 mb-4 rounded`} />
                <div className={`${baseClass} h-80 w-full rounded`} />
              </div>

              {/* Progress Skeleton */}
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'
              }`}>
                <div className={`${baseClass} h-6 w-32 mb-4 rounded`} />
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                      <div className={`${baseClass} h-4 w-24 mb-2 rounded`} />
                      <div className={`${baseClass} h-2 w-full rounded-full`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Insights Skeleton */}
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'
              }`}>
                <div className={`${baseClass} h-6 w-28 mb-4 rounded`} />
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className={`${baseClass} h-8 w-8 rounded-full`} />
                      <div className="flex-1">
                        <div className={`${baseClass} h-4 w-full mb-1 rounded`} />
                        <div className={`${baseClass} h-3 w-3/4 rounded`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'journal') {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className={`${baseClass} h-4 w-32 mb-4 rounded`} />
            <div className={`${baseClass} h-10 w-64 mb-4 rounded`} />
            <div className={`${baseClass} h-12 w-48 rounded-lg`} />
          </div>

          {/* Journal Entry Form */}
          <div className={`p-6 rounded-xl border ${
            isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'
          } mb-8`}>
            <div className={`${baseClass} h-6 w-40 mb-4 rounded`} />
            <div className={`${baseClass} h-32 w-full mb-4 rounded`} />
            <div className={`${baseClass} h-6 w-32 mb-4 rounded`} />
            <div className={`${baseClass} h-4 w-full mb-4 rounded-full`} />
            <div className={`${baseClass} h-12 w-full rounded-lg`} />
          </div>

          {/* Recent Entries */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`p-6 rounded-xl border ${
                isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div className={`${baseClass} h-5 w-32 rounded`} />
                  <div className={`${baseClass} h-4 w-20 rounded`} />
                </div>
                <div className={`${baseClass} h-20 w-full mb-3 rounded`} />
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className={`${baseClass} h-6 w-16 rounded-full`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'breathing') {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className={`${baseClass} h-4 w-32 mb-4 rounded`} />
            <div className={`${baseClass} h-10 w-72 mb-4 rounded`} />
            <div className={`${baseClass} h-6 w-96 rounded`} />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${baseClass} h-10 w-24 rounded-lg`} />
            ))}
          </div>

          {/* Breathing Pattern Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`p-6 rounded-xl border ${
                isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`${baseClass} h-6 w-32 rounded`} />
                  <div className={`${baseClass} h-6 w-16 rounded-full`} />
                </div>
                <div className={`${baseClass} h-16 w-full mb-4 rounded`} />
                <div className="flex gap-2 mb-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className={`${baseClass} h-5 w-12 rounded-full`} />
                  ))}
                </div>
                <div className={`${baseClass} h-10 w-full rounded-lg`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default skeleton
  return (
    <div className="animate-pulse space-y-4">
      <div className={`${baseClass} h-4 w-3/4 rounded`} />
      <div className={`${baseClass} h-4 w-1/2 rounded`} />
      <div className={`${baseClass} h-32 w-full rounded`} />
    </div>
  );
}

// Loading Spinner Component
export function LoadingSpinner({ size = 'md', color = 'purple' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    purple: 'border-purple-500',
    blue: 'border-blue-500',
    green: 'border-green-500',
    white: 'border-white'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`} />
    </div>
  );
}

// Branded Loading Screen
export function BrandedLoader({ message = "Loading..." }) {
  const { isDark } = useThemeMode();
  
  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDark ? 'bg-purple-950' : 'bg-purple-50'
    }`}>
      <div className="text-center">
        {/* Brain emoji with pulse animation */}
        <div className="text-6xl mb-6 animate-pulse">🧠</div>
        
        {/* Loading spinner */}
        <LoadingSpinner size="lg" color="purple" />
        
        {/* Loading text */}
        <p className={`mt-4 text-lg font-medium ${
          isDark ? 'text-purple-200' : 'text-purple-700'
        }`}>
          {message}
        </p>
        
        {/* Brand name */}
        <p className={`mt-2 text-sm ${
          isDark ? 'text-purple-400' : 'text-purple-600'
        }`}>
          NeuraCare
        </p>
      </div>
    </div>
  );
}