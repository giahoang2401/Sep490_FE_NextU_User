"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ThumbsUp, MessageCircle } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface ServiceDetailReviewsProps {
  service: {
    name: string
  }
}

export function ServiceDetailReviews({ service }: ServiceDetailReviewsProps) {
  const [showAllReviews, setShowAllReviews] = useState(false)

  const reviews = [
    {
      id: 1,
      name: "Sarah Chen",
      avatar: "/placeholder.svg?height=50&width=50",
      rating: 5,
      date: "2 weeks ago",
      text: "Absolutely love this space! The community is incredible and the facilities are top-notch. The staff is always helpful and the location is perfect for my needs.",
      helpful: 12,
      verified: true,
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      avatar: "/placeholder.svg?height=50&width=50",
      rating: 5,
      date: "1 month ago",
      text: "Great value for money. The amenities are excellent and the networking opportunities have been invaluable for my business growth.",
      helpful: 8,
      verified: true,
    },
    {
      id: 3,
      name: "Emily Watson",
      avatar: "/placeholder.svg?height=50&width=50",
      rating: 4,
      date: "1 month ago",
      text: "Really good experience overall. The space is clean, modern, and well-maintained. Only minor issue is that it can get a bit busy during peak hours.",
      helpful: 5,
      verified: true,
    },
    {
      id: 4,
      name: "David Kim",
      avatar: "/placeholder.svg?height=50&width=50",
      rating: 5,
      date: "2 months ago",
      text: "Exceeded my expectations! The community events are fantastic and I've made some great connections. Highly recommend to anyone looking for a professional co-living space.",
      helpful: 15,
      verified: true,
    },
  ]

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 2)

  return (
    <Card className="rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Reviews & Ratings</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-semibold text-slate-800">4.9</span>
            <span className="text-sm text-slate-600">(127 reviews)</span>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-slate-50 rounded-xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">4.9</div>
            <div className="text-sm text-slate-600">Overall</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">4.8</div>
            <div className="text-sm text-slate-600">Cleanliness</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">5.0</div>
            <div className="text-sm text-slate-600">Location</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">4.9</div>
            <div className="text-sm text-slate-600">Value</div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {displayedReviews.map((review) => (
            <div key={review.id} className="border-b border-slate-200 pb-6 last:border-b-0">
              <div className="flex items-start gap-4">
                <Image
                  src={review.avatar || "/placeholder.svg"}
                  alt={review.name}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-slate-800">{review.name}</h4>
                    {review.verified && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Verified</span>
                    )}
                    <span className="text-sm text-slate-500">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 leading-relaxed mb-3">{review.text}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <button className="flex items-center gap-1 hover:text-slate-700 transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      Helpful ({review.helpful})
                    </button>
                    <button className="flex items-center gap-1 hover:text-slate-700 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {!showAllReviews && reviews.length > 2 && (
          <div className="text-center mt-6">
            <Button variant="outline" onClick={() => setShowAllReviews(true)} className="rounded-full">
              Show All {reviews.length} Reviews
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
