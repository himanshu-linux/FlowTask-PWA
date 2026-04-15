export function SkeletonCard() {
  return (
    <div className="glass-card p-4 mb-3 animate-pulse border-border/50">
      <div className="flex items-center justify-between mb-3">
        <div className="w-16 h-4 bg-border/40 rounded-md skeleton" />
        <div className="w-8 h-4 bg-border/40 rounded-md skeleton" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="w-full h-4 bg-border/40 rounded-md skeleton" />
        <div className="w-3/4 h-4 bg-border/40 rounded-md skeleton" />
      </div>
      <div className="flex gap-2 pt-3 border-t border-border/20">
        <div className="w-20 h-3 bg-border/30 rounded-md skeleton" />
        <div className="w-12 h-3 bg-border/30 rounded-md skeleton" />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="glass-card p-5 animate-pulse border-border/50">
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-xl bg-border/40 skeleton" />
        <div className="w-12 h-4 bg-border/40 rounded-md skeleton" />
      </div>
      <div className="w-20 h-7 bg-border/40 rounded-md skeleton mb-1" />
      <div className="w-16 h-3 bg-border/30 rounded-md skeleton" />
    </div>
  );
}
