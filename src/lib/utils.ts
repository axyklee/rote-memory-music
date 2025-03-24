import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function factorial(n: number, r = 1) {
  while (n > 0) r *= n--;
  return r;
}

export function nextPermutation<T>(arr: T[]): T[] {
  if (arr.length <= 1) return arr; // Edge case: single element or empty array

  let i = arr.length - 2;

  while (i >= 0 && arr[i] !== undefined && arr[i + 1] !== undefined && arr[i]! >= arr[i + 1]!) {
    i--; // Find the rightmost ascent
  }

  if (i >= 0 && arr[i] !== undefined) {
    let j = arr.length - 1;
    while (arr[j] !== undefined && arr[i] !== undefined && arr[j]! <= arr[i]!) {
      j--; // Find the rightmost larger element
    }
    if (arr[j] !== undefined) {
      [arr[i], arr[j]] = [arr[j]!, arr[i]!]; // Swap
    }
  }

  arr.splice(i + 1, arr.length - (i + 1), ...arr.slice(i + 1).reverse()); // Reverse suffix
  return arr;
}
