export interface Product {
  id: string
  name: string
  description: string
  images: string[]
  affiliateUrl: string
  rating: number
  tags: string[]
  category: string
  createdAt: Date
}

export interface SearchHistory {
  query: string
  timestamp: Date
}

export interface WishlistItem {
  productId: string
  addedAt: Date
}

export interface Review {
  id: string
  productId: string
  userName: string
  rating: number
  comment: string
  date: Date
  helpful: number
  verified: boolean
}
