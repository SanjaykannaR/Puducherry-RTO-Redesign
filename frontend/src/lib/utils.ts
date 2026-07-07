import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind class strings intelligently.
 * clsx handles conditional classes (falsy filtering); twMerge resolves conflicts
 * (e.g. combining "px-4" with "px-2" keeps the last one instead of duplicating).
 * This is the standard utility used across every component for className composition.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
