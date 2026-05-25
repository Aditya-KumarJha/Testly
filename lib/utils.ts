import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const time = date.getTime();

  if (Number.isNaN(time)) {
    return "Unknown update time";
  }

  const now = Date.now();
  const diffInDays = Math.floor((now - time) / (1000 * 60 * 60 * 24));

  if (diffInDays <= 0) {
    return "Updated today";
  }

  if (diffInDays === 1) {
    return "Updated yesterday";
  }

  if (diffInDays < 7) {
    return `Updated ${diffInDays} days ago`;
  }

  return `Updated on ${date.toLocaleDateString()}`;
}
