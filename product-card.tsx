"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Star, Heart, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"
import { addToWishlist, getWishlist, removeFromWishlist } from "@/lib/utils"
import { getAverageRating } from "@/lib/reviews"
import { generateGoLink } from "@/lib/url-utils"
import { trackProductClick } from "@/lib/analytics"

interface ProductCardProps {
  product: Product
  onClick: () => void
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsInWishlist(getWishlist().includes(product.id))
    }
  }, [product.id])

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (isInWishlist) {
      removeFromWishlist(product.id)
      setIsInWishlist(false)
      toast({
        title: "Removed from Wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      })
    } else {
      addToWishlist(product.id)
      setIsInWishlist(true)
      toast({
        title: "Added to Wishlist",
        description: `${product.name} has been added to your wishlist.`,
      })
    }

    // Dispatch custom event for wishlist count update
    window.dispatchEvent(new CustomEvent("wishlistUpdated"))
  }

  const handleCardClick = () => {
    trackProductClick(product.id, "product-card")
    onClick()
  }

  const handleAffiliateClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    trackProductClick(product.id, "card-affiliate-button")
  }

  const renderStars = (productId: string, staticRating: number) => {
    // Try to get the dynamic rating first, fall back to static rating
    const rating = typeof window !== "undefined" ? getAverageRating(productId) || staticRating : staticRating

    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
              ? "fill-yellow-400/50 text-yellow-400"
              : "text-gray-300"
        }`}
        aria-hidden="true"
      />
    ))
  }

  // Generate affiliate go link
  const goLink = generateGoLink(product.id, product.affiliateUrl)

  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        {/* Product Image with Skeleton */}
        <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-muted">
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
          )}
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-110 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
            loading="lazy"
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setIsImageLoaded(true)}
          />

          {/* Tags */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {product.tags.map((tag) => (
              <Badge
                key={tag}
                variant={tag === "Hot" ? "destructive" : tag === "New" ? "default" : "secondary"}
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/80 hover:bg-background"
            onClick={handleWishlistClick}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex" aria-label={`Rating: ${product.rating} out of 5 stars`}>
              {renderStars(product.id, product.rating)}
            </div>
            <span className="text-xs text-muted-foreground">
              ({typeof window !== "undefined" ? getAverageRating(product.id) || product.rating : product.rating})
            </span>
          </div>

          {/* Category */}
          <div className="text-xs text-muted-foreground">{product.category}</div>

          {/* Go to affiliate link button */}
          <a
            href={goLink}
            className="block mt-3 w-full"
            onClick={handleAffiliateClick}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="w-full text-xs flex items-center justify-center gap-1">
              <ExternalLink className="h-3 w-3" />
              Visit Site
            </Button>
          </a>

          {/* BuyLoom Brand */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-medium text-primary">BuyLoom</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
