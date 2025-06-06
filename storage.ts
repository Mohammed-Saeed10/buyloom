import type { Product } from "./types"

const STORAGE_KEYS = {
  PRODUCTS: "buyloom-products",
  ADMIN_AUTH: "buyloom-admin-auth",
} as const

// Product storage functions
export function getStoredProducts(): Product[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
    if (!stored) return []

    const products = JSON.parse(stored)
    // Convert date strings back to Date objects
    return products.map((product: any) => ({
      ...product,
      createdAt: new Date(product.createdAt),
    }))
  } catch (error) {
    console.error("Error loading products from storage:", error)
    return []
  }
}

export function saveProductsToStorage(products: Product[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
    // Dispatch custom event for cross-tab updates
    window.dispatchEvent(new CustomEvent("productsUpdated"))
  } catch (error) {
    console.error("Error saving products to storage:", error)
  }
}

export function addProductToStorage(product: Product): void {
  const products = getStoredProducts()
  const updatedProducts = [product, ...products]
  saveProductsToStorage(updatedProducts)
}

export function updateProductInStorage(productId: string, updatedProduct: Product): void {
  const products = getStoredProducts()
  const updatedProducts = products.map((p) => (p.id === productId ? updatedProduct : p))
  saveProductsToStorage(updatedProducts)
}

export function deleteProductFromStorage(productId: string): void {
  const products = getStoredProducts()
  const updatedProducts = products.filter((p) => p.id !== productId)
  saveProductsToStorage(updatedProducts)
}

export function getProductById(productId: string): Product | null {
  const products = getStoredProducts()
  return products.find((p) => p.id === productId) || null
}

// Initialize storage with sample data if empty
export function initializeStorage(): Product[] {
  const stored = getStoredProducts()
  if (stored.length === 0) {
    // Import sample products for first-time users
    import("./products").then(({ sampleProducts }) => {
      saveProductsToStorage(sampleProducts)
    })
    return [] // Return empty array initially, will be populated after import
  }
  return stored
}

// Auth storage functions
export function getAuthStatus(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === "true"
}

export function setAuthStatus(isAuthenticated: boolean): void {
  if (typeof window === "undefined") return

  if (isAuthenticated) {
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, "true")
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH)
  }
}
