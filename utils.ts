import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSearchHistory(): string[] {
  if (typeof window === "undefined") return []
  const history = localStorage.getItem("buyloom-search-history")
  return history ? JSON.parse(history) : []
}

export function addToSearchHistory(query: string) {
  if (typeof window === "undefined") return
  const history = getSearchHistory()
  const updatedHistory = [query, ...history.filter((h) => h !== query)].slice(0, 10)
  localStorage.setItem("buyloom-search-history", JSON.stringify(updatedHistory))
}

export function getWishlist(): string[] {
  if (typeof window === "undefined") return []
  const wishlist = localStorage.getItem("buyloom-wishlist")
  return wishlist ? JSON.parse(wishlist) : []
}

export function addToWishlist(productId: string) {
  if (typeof window === "undefined") return
  const wishlist = getWishlist()
  if (!wishlist.includes(productId)) {
    const updatedWishlist = [...wishlist, productId]
    localStorage.setItem("buyloom-wishlist", JSON.stringify(updatedWishlist))
  }
}

export function removeFromWishlist(productId: string) {
  if (typeof window === "undefined") return
  const wishlist = getWishlist()
  const updatedWishlist = wishlist.filter((id) => id !== productId)
  localStorage.setItem("buyloom-wishlist", JSON.stringify(updatedWishlist))
}
