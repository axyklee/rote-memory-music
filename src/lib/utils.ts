import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function factorial(n: number, r = 1) {
  while (n > 0) r *= n--;
  return r;
}

export function nextPermutation(arr: any[]) {
  let i = arr.length - 2;
  while (i >= 0 && arr[i] >= arr[i + 1]) i--; // Find the rightmost ascent
  
  if (i >= 0) {
      let j = arr.length - 1;
      while (arr[j] <= arr[i]) j--; // Find the rightmost larger element
      [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap
  }

  arr.splice(i + 1, arr.length - (i + 1), ...arr.slice(i + 1).reverse()); // Reverse suffix
  return arr;
}
