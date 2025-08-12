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
      currency: event.currency || 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getEventPrice = () => {
    if (event.price) return event.price
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      // Get the lowest price from available ticket types
      const prices = event.ticketTypes.map(ticket => ticket.price).filter(price => price > 0)
      return prices.length > 0 ? Math.min(...prices) : 0
    }
    return 0
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

  // Helper functions to get time and duration from schedules
  const getEventTime = () => {
    if (event.time) return event.time
    if (event.schedules && event.schedules.length > 0) {
      const firstSchedule = event.schedules[0]
      return `${firstSchedule.startTime} - ${firstSchedule.endTime}`
    }
    return 'TBD'
  }

  const getEventDuration = () => {
    if (event.duration) return event.duration
    if (event.schedules && event.schedules.length > 0) {
      const firstSchedule = event.schedules[0]
      if (firstSchedule.duration) {
        const hours = Math.floor(firstSchedule.duration / 60)
        const minutes = firstSchedule.duration % 60
        if (hours > 0 && minutes > 0) {
          return `${hours}h ${minutes}m`
        } else if (hours > 0) {
          return `${hours}h`
        } else {
          return `${minutes}m`
        }
      }
    }
    return 'TBD'
  }

  const getEventLocation = () => {
    if (event.location) return event.location
    if (event.locations && event.locations.length > 0) {
      return event.locations[0].name
    }
    return 'TBD'
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
          {/* {event.earlyBirdDiscount && (
            <Badge className="absolute top-2 right-2 bg-red-500 text-white border-0 text-xs">
              -{event.earlyBirdDiscount.percentage}%
            </Badge>
          )} */}
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
            {event.shortDescription || event.description.substring(0, 100) + '...'}
          </p>

          <div className="space-y-1 text-xs text-gray-500 mb-3">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(event.date)} • {getEventTime()}
            </div>
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {getEventLocation()}
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {getEventDuration()}
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
                {formatPrice(getEventPrice())}
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