"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Menu, Moon, Sun, Heart, X } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { categories } from "@/lib/products"
import { getSearchHistory, addToSearchHistory, getWishlist } from "@/lib/utils"

interface NavbarProps {
  onSearch: (query: string) => void
  onCategoryFilter: (category: string) => void
  searchQuery: string
  selectedCategory: string
}

export default function Navbar({ onSearch, onCategoryFilter, searchQuery, selectedCategory }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(searchQuery)
  const [showSearchHistory, setShowSearchHistory] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [wishlistCount, setWishlistCount] = useState(0)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    setSearchHistory(getSearchHistory())

    // Check if we're on a large screen
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024) // lg breakpoint
    }

    // Set initial value
    checkScreenSize()

    // Add event listener for resize
    window.addEventListener("resize", checkScreenSize)

    // Update wishlist count and listen for changes
    const updateWishlistCount = () => {
      setWishlistCount(getWishlist().length)
    }

    updateWishlistCount()
    window.addEventListener("storage", updateWishlistCount)
    window.addEventListener("wishlistUpdated", updateWishlistCount)

    // Set theme based on user preference
    const savedTheme = localStorage.getItem("buyloom-theme")
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (typeof window !== "undefined" && window.matchMedia) {
      // Use system preference as default if no saved preference
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(systemPrefersDark ? "dark" : "light")
    }

    return () => {
      window.removeEventListener("resize", checkScreenSize)
      window.removeEventListener("storage", updateWishlistCount)
      window.removeEventListener("wishlistUpdated", updateWishlistCount)
    }
  }, [setTheme])

  useEffect(() => {
    setSearchInput(searchQuery)
  }, [searchQuery])

  const handleSearch = (query: string) => {
    if (query.trim()) {
      addToSearchHistory(query.trim())
      setSearchHistory(getSearchHistory())
      onSearch(query.trim())
      setShowSearchHistory(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(searchInput)
  }

  const handleLogoClick = () => {
    if (isLargeScreen) {
      router.push("/admin")
    } else {
      router.push("/")
    }
  }

  const saveThemePreference = (newTheme: string) => {
    localStorage.setItem("buyloom-theme", newTheme)
    setTheme(newTheme)
  }

  if (!mounted) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div
            className={`flex items-center space-x-2 ${isLargeScreen ? "cursor-pointer" : ""}`}
            onClick={handleLogoClick}
            role={isLargeScreen ? "button" : undefined}
            tabIndex={isLargeScreen ? 0 : undefined}
            aria-label={isLargeScreen ? "Go to admin panel" : undefined}
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">BL</span>
            </div>
            <span className="font-bold text-xl text-primary">BuyLoom</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Categories */}
            <div className="flex items-center space-x-3">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onCategoryFilter(category)}
                  className="text-sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex relative flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setShowSearchHistory(true)}
                onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
                className="pr-10"
                aria-label="Search products"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                aria-label="Submit search"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>

            {/* Search History Dropdown */}
            {showSearchHistory && searchHistory.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50">
                <div className="p-2">
                  <p className="text-xs text-muted-foreground mb-2">Recent searches</p>
                  {searchHistory.map((query, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded"
                      onClick={() => handleSearch(query)}
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-3">
            {/* Wishlist */}
            <Link href="/wishlist">
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                aria-label={`Wishlist with ${wishlistCount} items`}
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => saveThemePreference(theme === "dark" ? "light" : "dark")}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">BL</span>
                    </div>
                    <span className="font-bold text-xl text-primary">BuyLoom</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} aria-label="Close menu">
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex flex-col space-y-6">
                  {/* Mobile Search */}
                  <div className="md:hidden">
                    <form onSubmit={handleSearchSubmit} className="relative">
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pr-10"
                      />
                      <Button type="submit" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0">
                        <Search className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>

                  {/* Mobile Categories */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground">Categories</h3>
                    <div className="space-y-1">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            onCategoryFilter(category)
                            setIsOpen(false)
                          }}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Links */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground">Pages</h3>
                    <div className="space-y-1">
                      <Link href="/" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          Home
                        </Button>
                      </Link>
                      <Link href="/wishlist" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                        </Button>
                      </Link>
                      <Link href="/admin" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          Admin Panel
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
