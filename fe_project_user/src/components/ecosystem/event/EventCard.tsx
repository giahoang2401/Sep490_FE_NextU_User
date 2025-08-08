'use client'

import { useState } from 'react'
import { Calendar, Clock, MapPin, Users, Heart, Tag } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TransformedEvent } from '@/data/ecosystem/event-api'
import Link from 'next/link'

interface EventCardProps {
  event: TransformedEvent
  variant?: 'default' | 'featured' | 'compact'
}

export default function EventCard({ event, variant = 'default' }: EventCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getAvailabilityColor = () => {
    const percentage = (event.capacity.available / event.capacity.total) * 100
    if (percentage <= 20) return 'text-red-600'
    if (percentage <= 50) return 'text-orange-600'
    return 'text-green-600'
  }

  if (variant === 'compact') {
    return (
      <Link href={`/ecosystem/events/${event.id}`}>
        <Card 
          className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-0 bg-white"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            {event.featured && (
              <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                Featured
              </Badge>
            )}
            <Button
              size="sm"
              variant="ghost"
              className={`absolute top-3 right-3 p-2 h-8 w-8 rounded-full transition-all ${
                isLiked ? 'text-red-500' : 'text-white hover:text-red-500'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                setIsLiked(!isLiked)
              }}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
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

            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {event.title}
            </h3>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {event.shortDescription}
            </p>

            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(event.date)} • {event.time}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {event.location}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {event.duration}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium">{event.capacity.available} spots left</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-4 pt-0">
            <div className="flex items-center justify-between w-full">
              <div>
                <span className="text-lg font-bold text-blue-600">
                  {formatPrice(event.price)}
                </span>
              </div>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                View Details
              </Button>
            </div>
          </CardFooter>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/ecosystem/events/${event.id}`}>
      <Card 
        className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 bg-white"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-64 object-cover rounded-t-lg"
          />
          {event.featured && (
            <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
              Featured
            </Badge>
          )}
          <Button
            size="sm"
            variant="ghost"
            className={`absolute top-4 right-4 p-2 h-8 w-8 rounded-full transition-all ${
              isLiked ? 'text-red-500' : 'text-white hover:text-red-500'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              setIsLiked(!isLiked)
            }}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex gap-2">
              <Badge variant="secondary">
                {event.category.name}
              </Badge>
            </div>
            <Badge variant="outline">
              {event.level.name}
            </Badge>
          </div>

          <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {event.title}
          </h3>

          <p className="text-gray-600 mb-4 line-clamp-3">
            {event.shortDescription}
          </p>

          <div className="space-y-3 text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-3" />
              {formatDate(event.date)} • {event.time}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-3" />
              {event.location}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-3" />
              {event.duration}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-3" />
              <span className={getAvailabilityColor()}>
                {event.capacity.available}/{event.capacity.total} spots available
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-1 mb-4">
            {event.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <div className="flex items-center justify-between w-full">
            <div>
              <span className="text-xl font-bold text-blue-600">
                {formatPrice(event.price)}
              </span>
            </div>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              View Details
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
} 