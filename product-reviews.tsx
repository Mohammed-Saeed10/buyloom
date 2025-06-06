"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RatingSummary } from "./rating-summary"
import { ReviewList } from "./review-list"
import { ReviewForm } from "./review-form"
import { getProductReviews, getAverageRating, getRatingDistribution } from "@/lib/reviews"
import type { Review } from "@/lib/types"

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [distribution, setDistribution] = useState<Record<number, number>>({})
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [activeTab, setActiveTab] = useState("reviews")

  const loadReviews = () => {
    const productReviews = getProductReviews(productId)
    setReviews(productReviews)
    setAverageRating(getAverageRating(productId))
    setDistribution(getRatingDistribution(productId))
  }

  useEffect(() => {
    loadReviews()
  }, [productId])

  const handleReviewAdded = () => {
    loadReviews()
    setActiveTab("reviews")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <RatingSummary averageRating={averageRating} totalReviews={reviews.length} distribution={distribution} />

        <Separator className="my-6" />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="write">Write a Review</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="pt-4">
            <ReviewList reviews={showAllReviews ? reviews : reviews.slice(0, 3)} />

            {reviews.length > 3 && !showAllReviews && (
              <div className="text-center mt-4">
                <Button variant="outline" onClick={() => setShowAllReviews(true)}>
                  Show All Reviews ({reviews.length})
                </Button>
              </div>
            )}

            {reviews.length > 3 && showAllReviews && (
              <div className="text-center mt-4">
                <Button variant="outline" onClick={() => setShowAllReviews(false)}>
                  Show Less
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="write" className="pt-4">
            <ReviewForm productId={productId} onReviewAdded={handleReviewAdded} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
