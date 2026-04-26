function S({ w = 'w-full', h = 'h-4' }) {
  return <div className={`${w} ${h} skeleton`} />
}

export default function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary card */}
      <div className="card-flat p-6 space-y-3 border-l-4 border-accent/20">
        <S h="h-3" w="w-32" />
        <S h="h-4" />
        <S h="h-4" w="w-3/4" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-flat p-5 space-y-3">
            <S h="h-3" w="w-20" />
            <S h="h-8" w="w-28" />
          </div>
        ))}
      </div>

      {/* Trust Score + Sentiment row */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-flat p-6">
          <S h="h-3" w="w-24" />
          <div className="flex items-center gap-6 mt-4">
            <div className="w-28 h-28 rounded-full skeleton flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <S h="h-4" />
              <S h="h-3" w="w-3/4" />
              <S h="h-3" w="w-1/2" />
            </div>
          </div>
        </div>
        <div className="card-flat p-6 flex flex-col items-center">
          <S h="h-3" w="w-32" />
          <div className="w-48 h-48 rounded-full skeleton mt-4" />
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="card-flat overflow-hidden">
        <div className="flex border-b p-1" style={{ borderColor: 'var(--border-color)' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="px-5 py-3">
              <S h="h-4" w="w-20" />
            </div>
          ))}
        </div>
        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-2">
                  <S h="h-5" w="w-5" />
                  <S h="h-4" />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-2">
                  <S h="h-5" w="w-5" />
                  <S h="h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Verdict skeleton */}
      <div className="card-flat p-6 border-2 border-[var(--border-color)] rounded-2xl">
        <S h="h-8" w="w-40" />
        <div className="mt-3">
          <S h="h-5" w="w-3/4" />
        </div>
        <div className="mt-4 space-y-2">
          {[...Array(3)].map((_, i) => (
            <S key={i} h="h-4" w="w-2/3" />
          ))}
        </div>
      </div>
    </div>
  )
}