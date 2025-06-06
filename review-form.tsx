"use client"

import type React from "react"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { addReview } from "@/lib/reviews"

interface ReviewFormProps {
  productId: string
  onReviewAdded: () => void
}

export function ReviewForm({ productId, onReviewAdded }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [name, setName] = useState("")
  const [comment, setComment] = useState("")
  const [verified, setVerified] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting your review.",
        variant: "destructive",
      })
      return
    }

    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name before submitting your review.",
        variant: "destructive",
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: "Review required",
        description: "Please enter your review before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      addReview({
        productId,
        userName: name.trim(),
        rating,
        comment: comment.trim(),
        verified,
      })

      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      })

      // Reset form
      setRating(0)
      setName("")
      setComment("")
      setVerified(false)

      // Notify parent component
      onReviewAdded()
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error submitting your review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="rating" className="block mb-2">
          Your Rating
        </Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  (hoverRating ? star <= hoverRating : star <= rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="name" className="block mb-2">
          Your Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          maxLength={50}
        />
      </div>

      <div>
        <Label htmlFor="comment" className="block mb-2">
          Your Review
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          maxLength={1000}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="verified" checked={verified} onCheckedChange={(checked) => setVerified(checked === true)} />
        <Label htmlFor="verified" className="text-sm">
          I purchased this product
        </Label>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  )
}
