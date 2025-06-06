import type { Product } from "./types"

export const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    description:
      "High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
    ],
    affiliateUrl: "https://amazon.com/example-headphones",
    rating: 4.8,
    tags: ["Top", "Hot"],
    category: "Electronics",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Smart Fitness Tracker",
    description:
      "Advanced fitness tracker with heart rate monitoring, GPS, and waterproof design. Track your health goals effectively.",
    images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
    affiliateUrl: "https://amazon.com/example-fitness-tracker",
    rating: 4.6,
    tags: ["New", "Hot"],
    category: "Health & Fitness",
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "3",
    name: "Ergonomic Office Chair",
    description:
      "Comfortable ergonomic office chair with lumbar support and adjustable height. Perfect for long work sessions.",
    images: ["/placeholder.svg?height=400&width=400"],
    affiliateUrl: "https://amazon.com/example-office-chair",
    rating: 4.7,
    tags: ["Top"],
    category: "Furniture",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "4",
    name: "Portable Bluetooth Speaker",
    description:
      "Compact wireless speaker with powerful sound and 12-hour battery. Great for outdoor activities and parties.",
    images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
    affiliateUrl: "https://amazon.com/example-speaker",
    rating: 4.5,
    tags: ["Hot"],
    category: "Electronics",
    createdAt: new Date("2024-01-25"),
  },
  {
    id: "5",
    name: "Organic Skincare Set",
    description:
      "Complete organic skincare routine with cleanser, toner, and moisturizer. Natural ingredients for healthy skin.",
    images: ["/placeholder.svg?height=400&width=400"],
    affiliateUrl: "https://amazon.com/example-skincare",
    rating: 4.9,
    tags: ["New", "Top"],
    category: "Beauty",
    createdAt: new Date("2024-01-30"),
  },
]

export const categories = ["All", "Electronics", "Health & Fitness", "Furniture", "Beauty", "Home & Garden"]
