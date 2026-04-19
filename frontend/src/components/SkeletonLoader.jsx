const S = ({w='w-full',h='h-4'}) => <div className={`${w} ${h} bg-dark-surface rounded-lg animate-pulse`}/>
export default function SkeletonLoader() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_,i)=><div key={i} className="bg-dark-surface rounded-xl p-4 space-y-2"><S h="h-3" w="w-16"/><S h="h-8" w="w-24"/></div>)}</div>
      <div className="bg-dark-surface rounded-xl p-6 space-y-3"><S h="h-3" w="w-32"/><S h="h-6"/><S h="h-4" w="w-3/4"/></div>
      <div className="grid grid-cols-2 gap-3">{[...Array(6)].map((_,i)=><div key={i} className="bg-dark-surface rounded-xl p-4"><S h="h-4" w="w-2/3"/><div className="mt-2"><S h="h-3"/></div></div>)}</div>
    </div>
  )
}