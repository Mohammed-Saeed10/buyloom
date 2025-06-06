"use client"

import { useState } from "react"
import { Star, ThumbsUp, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import type { Review } from "@/lib/types"
import { markReviewAsHelpful } from "@/lib/reviews"

interface ReviewListProps {
  reviews: Review[]
  showAll?: boolean
}

export function ReviewList({ reviews, showAll = false }: ReviewListProps) {
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({})
  const [helpfulClicked, setHelpfulClicked] = useState<Record<string, boolean>>({})

  const displayReviews = showAll ? reviews : reviews.slice(0, 3)

  const handleExpandReview = (reviewId: string) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }))
  }

  const handleMarkHelpful = (reviewId: string) => {
    if (helpfulClicked[reviewId]) return

    markReviewAsHelpful(reviewId)
    setHelpfulClicked((prev) => ({
      ...prev,
      [reviewId]: true,
    }))

    toast({
      title: "Thank you!",
      description: "You marked this review as helpful.",
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {displayReviews.map((review) => (
        <div key={review.id} className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <h4 className="font-medium">{review.userName}</h4>
                {review.verified && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified Purchase
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{formatDate(review.date)}</p>
            </div>
          </div>

          <div>
            <p className={`text-sm ${expandedReviews[review.id] ? "" : "line-clamp-3"}`}>{review.comment}</p>
            {review.comment.length > 150 && (
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-xs mt-1"
                onClick={() => handleExpandReview(review.id)}
              >
                {expandedReviews[review.id] ? "Show less" : "Read more"}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => handleMarkHelpful(review.id)}
              disabled={helpfulClicked[review.id]}
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              Helpful {review.helpful > 0 && `(${review.helpful})`}
            </Button>
          </div>

          <Separator />
        </div>
      ))}
    </div>
  )
}
