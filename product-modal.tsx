"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Star,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"
import { ProductReviews } from "./reviews/product-reviews"
import { generateGoLink } from "@/lib/url-utils"
import { trackProductClick } from "@/lib/analytics"

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Reset state when product changes
    if (product) {
      setCurrentImageIndex(0)
      setIsImageLoaded(false)
    }
  }, [product])

  if (!product) return null

  const nextImage = () => {
    if (product.images.length <= 1) return
    setIsImageLoaded(false)
    setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    if (product.images.length <= 1) return
    setIsImageLoaded(false)
    setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
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

  const getAffiliateSiteName = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return domain.replace("www.", "").split(".")[0]
    } catch {
      return "Affiliate Site"
    }
  }

  const handleAffiliateClick = () => {
    trackProductClick(product.id, "modal-affiliate-button")
  }

  // Generate affiliate go link
  const goLink = generateGoLink(product.id, product.affiliateUrl)

  // Share functionality
  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/product/${product.id}` : `/product/${product.id}`

  const shareText = `Check out ${product.name} on BuyLoom!`

  const handleShare = async (platform: string) => {
    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")
        break
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          "_blank",
        )
        break
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank")
        break
      case "copy":
        try {
          await navigator.clipboard.writeText(shareUrl)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
          toast({
            title: "Link copied",
            description: "Product link copied to clipboard",
          })
        } catch (err) {
          toast({
            title: "Failed to copy",
            description: "Please try again or copy the URL manually",
            variant: "destructive",
          })
        }
        break
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{product.name}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Carousel */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {!isImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
                  <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                </div>
              )}

              <Image
                src={product.images[currentImageIndex] || "/placeholder.svg"}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                fill
                className={`object-cover ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
                sizes="(max-width: 768px) 100vw, 50vw"
                onLoad={() => setIsImageLoaded(true)}
                onError={() => setIsImageLoaded(true)}
              />

              {product.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-background/80 hover:bg-background"
                    onClick={prevImage}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-background/80 hover:bg-background"
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Image Indicators */}
              {product.images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentImageIndex(index)
                        setIsImageLoaded(false)
                      }}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? "border-primary" : "border-transparent"
                    }`}
                    onClick={() => {
                      setCurrentImageIndex(index)
                      setIsImageLoaded(false)
                    }}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant={tag === "Hot" ? "destructive" : tag === "New" ? "default" : "secondary"}>
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex" aria-label={`Rating: ${product.rating} out of 5 stars`}>
                {renderStars(product.rating)}
              </div>
              <span className="text-sm text-muted-foreground">({product.rating} stars)</span>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Category */}
            <div>
              <span className="text-sm text-muted-foreground">Category: </span>
              <span className="text-sm font-medium">{product.category}</span>
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Share:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleShare("facebook")}>
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("twitter")}>
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("linkedin")}>
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("copy")}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* BuyLoom Branding */}
            <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">BL</span>
              </div>
              <div>
                <p className="font-semibold text-sm">Recommended by BuyLoom</p>
                <p className="text-xs text-muted-foreground">Trusted affiliate partner</p>
              </div>
            </div>

            {/* CTA Button */}
            <a
              href={goLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleAffiliateClick}
              className="block w-full"
            >
              <Button className="w-full" size="lg">
                <ExternalLink className="h-4 w-4 mr-2" />
                Go to {getAffiliateSiteName(product.affiliateUrl)}
              </Button>
            </a>
          </div>
        </div>
        {/* Reviews Section */}
        <div className="col-span-full mt-8">
          <ProductReviews productId={product.id} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
