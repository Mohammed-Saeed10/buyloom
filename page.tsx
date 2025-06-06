"use client"

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA-oXuHLfoTpZQwJ5PEyQ_4i8RijzYJ8Og",
  authDomain: "buyloom.firebaseapp.com",
  projectId: "buyloom",
  storageBucket: "buyloom.firebasestorage.app",
  messagingSenderId: "100311165174",
  appId: "1:100311165174:web:fa274b0c894470f25264d7",
  measurementId: "G-R7H2GZ1R3L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import ProductCard from "@/components/product-card"
import ProductModal from "@/components/product-modal"
import type { Product } from "@/lib/types"
import { Toaster } from "@/components/ui/toaster"
import { getStoredProducts, saveProductsToStorage } from "@/lib/storage"

// Product card skeleton loader
function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="rounded-lg overflow-hidden">
        <div className="aspect-square bg-muted"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="flex space-x-1">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-muted"></div>
              ))}
          </div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
          <div className="h-8 bg-muted rounded w-full mt-2"></div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load products from storage on mount
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)

      // Get stored products or initialize with sample data
      const storedProducts = getStoredProducts()
      if (storedProducts.length === 0) {
        // If no products, initialize with sample data
        const { sampleProducts } = await import("@/lib/products")
        saveProductsToStorage(sampleProducts)
        setProducts(sampleProducts)
      } else {
        setProducts(storedProducts)
      }

      // Simulate network delay for skeleton loading demo
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    }

    loadProducts()

    // Listen for storage changes (when admin adds/deletes products)
    const handleStorageChange = () => {
      const updatedProducts = getStoredProducts()
      setProducts(updatedProducts)
    }

    window.addEventListener("storage", handleStorageChange)

    // Custom event for same-tab updates
    window.addEventListener("productsUpdated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("productsUpdated", handleStorageChange)
    }
  }, [])

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory])

  const handleProductClick = (product: Product) => {
    if (isMobile) {
      // Navigate to product page on mobile
      router.push(`/product/${product.id}`)
    } else {
      // Open modal on desktop/tablet
      setSelectedProduct(product)
      setIsModalOpen(true)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onSearch={handleSearch}
        onCategoryFilter={handleCategoryFilter}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to <span className="text-primary">BuyLoom</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover amazing products curated just for you. Find the best deals from trusted retailers.
          </p>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {isLoading
              ? "Loading products..."
              : `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""} found
                ${searchQuery && ` for "${searchQuery}"`}
                ${selectedCategory !== "All" && ` in ${selectedCategory}`}`}
          </p>
        </div>

        {/* Products Grid - Responsive layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {isLoading
            ? // Skeleton loaders while loading
              Array(10)
                .fill(0)
                .map((_, index) => <ProductCardSkeleton key={index} />)
            : // Actual product cards
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onClick={() => handleProductClick(product)} />
              ))}
        </div>

        {/* No Results */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">No products found</p>
            <p className="text-muted-foreground">Try adjusting your search terms or category filter</p>
          </div>
        )}
      </main>

      {/* Product Modal for Desktop/Tablet */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProduct(null)
        }}
      />

      <Toaster />
    </div>
  )
}
