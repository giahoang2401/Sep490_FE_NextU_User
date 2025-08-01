'use client'

import { Calendar, Clock, MapPin, Users, Star, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Event, eventCategories, eventTypes, eventLevels } from '@/data/ecosystem/event-data'
import Link from 'next/link'

interface EventEcosystemCardProps {
  event: Event
}

export default function EventEcosystemCard({ event }: EventEcosystemCardProps) {
  const category = eventCategories[event.category]
  const type = eventTypes[event.type]
  const level = eventLevels[event.requirements.level]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: event.currency,
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
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

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-0 bg-white">
      <div className="relative">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        {event.featured && (
          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
            Nổi bật
          </Badge>
        )}
        {event.earlyBirdDiscount && (
          <Badge className="absolute top-3 right-3 bg-red-500 text-white border-0">
            -{event.earlyBirdDiscount.percentage}%
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            <category.icon className="h-3 w-3 mr-1" />
            {category.name}
          </Badge>
          <Badge variant="outline" className={`text-xs ${level.color}`}>
            {level.name}
          </Badge>
        </div>

        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {event.shortDescription}
        </p>

        <div className="space-y-2 text-sm text-gray-500 mb-4">
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
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <span className={getAvailabilityColor()}>
              Còn {event.capacity.available} chỗ
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{event.rating}</span>
            <span className="text-sm text-gray-500">({event.reviewCount})</span>
          </div>
          <div className="text-right">
            {event.originalPrice && (
              <div className="text-sm text-gray-500 line-through">
                {formatPrice(event.originalPrice)}
              </div>
            )}
            <div className="text-lg font-bold text-blue-600">
              {formatPrice(event.price)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link href={`/ecosystem/events/${event.id}`}>
            <Button 
              size="sm" 
              variant="outline"
              className="group-hover:bg-blue-500 group-hover:text-white transition-colors"
            >
              Xem chi tiết
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            Đăng ký
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 