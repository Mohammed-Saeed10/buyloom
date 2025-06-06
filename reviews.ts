import type { Review } from "./types"

// Sample reviews data
export const sampleReviews: Review[] = [
  {
    id: "r1",
    productId: "1",
    userName: "John D.",
    rating: 5,
    comment:
      "These headphones are amazing! The noise cancellation is top-notch and the battery life is impressive. I use them daily for work calls and music.",
    date: new Date("2024-05-15"),
    helpful: 12,
    verified: true,
  },
  {
    id: "r2",
    productId: "1",
    userName: "Sarah M.",
    rating: 4,
    comment:
      "Great sound quality and comfortable to wear for long periods. The only downside is they're a bit bulky for travel.",
    date: new Date("2024-05-10"),
    helpful: 8,
    verified: true,
  },
  {
    id: "r3",
    productId: "1",
    userName: "Mike T.",
    rating: 3,
    comment:
      "Decent headphones but I expected better noise cancellation at this price point. Battery life is good though.",
    date: new Date("2024-04-28"),
    helpful: 5,
    verified: false,
  },
  {
    id: "r4",
    productId: "2",
    userName: "Emily R.",
    rating: 5,
    comment:
      "This fitness tracker has changed my workout routine! The heart rate monitoring is accurate and the app is intuitive.",
    date: new Date("2024-05-12"),
    helpful: 15,
    verified: true,
  },
  {
    id: "r5",
    productId: "2",
    userName: "David K.",
    rating: 4,
    comment:
      "Great tracker with lots of features. The battery could last longer but overall I'm satisfied with my purchase.",
    date: new Date("2024-05-05"),
    helpful: 7,
    verified: true,
  },
]

// Get reviews for a specific product
export function getProductReviews(productId: string): Review[] {
  // First check localStorage
  const storedReviews = getStoredReviews()
  const productReviews = storedReviews.filter((review) => review.productId === productId)

  // Then check sample reviews
  const sampleProductReviews = sampleReviews.filter((review) => review.productId === productId)

  // Combine and sort by date (newest first)
  return [...productReviews, ...sampleProductReviews].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}

// Calculate average rating for a product
export function getAverageRating(productId: string): number {
  const reviews = getProductReviews(productId)
  if (reviews.length === 0) return 0

  const sum = reviews.reduce((total, review) => total + review.rating, 0)
  return Number.parseFloat((sum / reviews.length).toFixed(1))
}

// Get rating distribution for a product
export function getRatingDistribution(productId: string): Record<number, number> {
  const reviews = getProductReviews(productId)
  const distribution: Record<number, number> = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  }

  reviews.forEach((review) => {
    distribution[review.rating]++
  })

  return distribution
}

// Store reviews in localStorage
export function getStoredReviews(): Review[] {
  if (typeof window === "undefined") return []
  const reviews = localStorage.getItem("buyloom-reviews")
  return reviews ? JSON.parse(reviews) : []
}

// Add a new review
export function addReview(review: Omit<Review, "id" | "date" | "helpful">): Review {
  const newReview: Review = {
    ...review,
    id: `r${Date.now()}`,
    date: new Date(),
    helpful: 0,
  }

  const reviews = getStoredReviews()
  const updatedReviews = [newReview, ...reviews]

  if (typeof window !== "undefined") {
    localStorage.setItem("buyloom-reviews", JSON.stringify(updatedReviews))
  }

  return newReview
}

// Mark a review as helpful
export function markReviewAsHelpful(reviewId: string): void {
  const reviews = getStoredReviews()
  const updatedReviews = reviews.map((review) => {
    if (review.id === reviewId) {
      return { ...review, helpful: review.helpful + 1 }
    }
    return review
  })

  if (typeof window !== "undefined") {
    localStorage.setItem("buyloom-reviews", JSON.stringify(updatedReviews))
  }
}
