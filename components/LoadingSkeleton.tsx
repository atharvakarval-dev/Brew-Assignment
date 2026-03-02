interface LoadingSkeletonProps {
  variant: "movie" | "sentiment";
}

function Skeleton({ className }: { className?: string }): JSX.Element {
  return <div className={`skeleton ${className ?? ""}`} />;
}

export function LoadingSkeleton({ variant }: LoadingSkeletonProps): JSX.Element {
  if (variant === "movie") {
    return (
      <div className="rounded-[16px] border border-border bg-card p-6">
        <Skeleton className="mx-auto aspect-[34/50] w-full max-w-[340px] rounded-[16px]" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-px w-full rounded-none" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-[85%]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-[16px] border border-border bg-card p-7">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-10 w-[60%]" />
      <Skeleton className="h-[6px] w-full rounded-full" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[70%]" />
      </div>
      <Skeleton className="h-28 w-full rounded-[12px]" />
      <div className="space-y-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

export function MovieDetailSkeleton(): JSX.Element {
  return (
    <main className="min-h-screen w-full bg-background">
      <div className="mx-auto w-full max-w-[1100px] px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-4 w-16" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-9 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-12">
          <div>
            <Skeleton className="aspect-[34/50] w-full rounded-[16px]" />
            <div className="mt-6 rounded-[16px] border border-border bg-card p-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="mt-5 h-px w-full rounded-none" />
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
              <Skeleton className="h-12 w-[65%]" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[70%]" />
            </div>

            <div>
              <Skeleton className="mb-4 h-3 w-24" />
              <div className="flex gap-3 overflow-hidden">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index.toString()} className="flex flex-col items-center gap-2">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[16px] border border-border bg-card p-7">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="mt-5 h-10 w-[58%]" />
              <Skeleton className="mt-4 h-[6px] w-full rounded-full" />
              <div className="mt-5 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[88%]" />
                <Skeleton className="h-4 w-[74%]" />
              </div>
              <Skeleton className="mt-5 h-24 w-full rounded-[12px]" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
