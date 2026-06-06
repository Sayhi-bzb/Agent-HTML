import { Skeleton } from "@/app/shared/ui/skeleton"

export function GallerySidebarFallback() {
  return (
    <div className="flex flex-col gap-4 px-2 py-2" data-selection="none">
      {Array.from({ length: 3 }).map((_, groupIndex) => (
        <div className="space-y-2" key={groupIndex}>
          <Skeleton className="h-3 w-24" />
          <div className="space-y-1.5">
            {Array.from({ length: 3 }).map((__, rowIndex) => (
              <div className="flex items-center gap-2" key={rowIndex}>
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="h-8 flex-1" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
