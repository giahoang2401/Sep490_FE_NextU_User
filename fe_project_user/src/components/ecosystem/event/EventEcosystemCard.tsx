'use client'

import { Calendar, Clock, MapPin, Users, Star, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TransformedEvent } from '@/data/ecosystem/event-api'
import Link from 'next/link'

interface EventEcosystemCardProps {
  event: TransformedEvent
}

export default function EventEcosystemCard({ event }: EventEcosystemCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: event.currency,
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getAvailabilityColor = () => {
    const percentage = (event.capacity.available / event.capacity.total) * 100
    if (percentage <= 20) return 'text-red-600'
    if (percentage <= 50) return 'text-orange-600'
    return 'text-green-600'
  }

  const formatRating = (rating: number) => {
    return rating.toFixed(1)
  }

  return (
    <Link href={`/ecosystem/events/${event.id}`}>
      <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-0 bg-white">
        <div className="relative">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-40 object-cover rounded-t-lg"
          />
          {event.featured && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs">
              Featured
            </Badge>
          )}
          {event.earlyBirdDiscount && (
            <Badge className="absolute top-2 right-2 bg-red-500 text-white border-0 text-xs">
              -{event.earlyBirdDiscount.percentage}%
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              {event.category.name}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {event.level.name}
            </Badge>
          </div>

          <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {event.title}
          </h3>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {event.shortDescription}
          </p>

          <div className="space-y-1 text-xs text-gray-500 mb-3">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(event.date)} • {event.time}
            </div>
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {event.location}
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {event.duration}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className={`text-xs font-medium ${getAvailabilityColor()}`}>
              {event.capacity.available} spots
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div>
              <span className="text-sm font-bold text-blue-600">
                {formatPrice(event.price)}
              </span>
            </div>
            <Button size="sm" className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}