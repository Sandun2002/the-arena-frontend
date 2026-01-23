import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// This helper lets us combine conditional classes cleanly
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}