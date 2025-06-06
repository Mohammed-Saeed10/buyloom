import { Star } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface RatingSummaryProps {
  averageRating: number
  totalReviews: number
  distribution: Record<number, number>
}

export function RatingSummary({ averageRating, totalReviews, distribution }: RatingSummaryProps) {
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
      />
    ))
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="text-center md:text-left">
        <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
        <div className="flex justify-center md:justify-start mt-2">{renderStars(averageRating)}</div>
        <div className="text-sm text-muted-foreground mt-1">
          {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] || 0
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

          return (
            <div key={star} className="flex items-center gap-2">
              <div className="flex items-center w-12">
                <span className="text-sm">{star}</span>
                <Star className="h-4 w-4 ml-1 fill-yellow-400 text-yellow-400" />
              </div>
              <Progress value={percentage} className="h-2 flex-1" />
              <div className="text-xs text-muted-foreground w-10 text-right">{count}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
