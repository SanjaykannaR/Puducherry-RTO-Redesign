import { cn } from "@/lib/utils"

/**
 * Loading skeleton placeholder — a pulsing grey block that signals content is loading.
 * Consumers set width/height via className (e.g. "h-4 w-full") to match the shape of the real content.
 * The animate-pulse animation gives a gentle breathing effect, much less jarring than a spinner.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
