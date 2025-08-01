'use client'

import { useState } from 'react'
import { Calendar, Clock, MapPin, Users, Star, Heart, Tag } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Event, eventCategories, eventTypes, eventLevels } from '@/data/ecosystem/event-data'

interface EventCardProps {
  event: Event
  variant?: 'default' | 'featured' | 'compact'
}

export default function EventCard({ event, variant = 'default' }: EventCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

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
              Nổi bật
            </Badge>
          )}
          {event.earlyBirdDiscount && (
            <Badge className="absolute top-3 right-3 bg-red-500 text-white border-0">
              -{event.earlyBirdDiscount.percentage}%
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
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{event.rating}</span>
              <span className="text-sm text-gray-500">({event.reviewCount})</span>
            </div>
            <div className={`text-sm font-medium ${getAvailabilityColor()}`}>
              Còn {event.capacity.available} chỗ
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="flex items-center justify-between w-full">
            <div>
              {event.originalPrice && (
                <span className="text-sm text-gray-500 line-through mr-2">
                  {formatPrice(event.originalPrice)}
                </span>
              )}
              <span className="text-lg font-bold text-blue-600">
                {formatPrice(event.price)}
              </span>
            </div>
            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              Đăng ký
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
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
            Nổi bật
          </Badge>
        )}
        {event.earlyBirdDiscount && (
          <Badge className="absolute top-4 right-4 bg-red-500 text-white border-0">
            -{event.earlyBirdDiscount.percentage}%
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
              <category.icon className="h-3 w-3 mr-1" />
              {category.name}
            </Badge>
            <Badge variant="outline">
              <type.icon className="h-3 w-3 mr-1" />
              {type.name}
            </Badge>
          </div>
          <Badge variant="outline" className={level.color}>
            {level.name}
          </Badge>
        </div>

        <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-3">
          {event.description}
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
              Còn {event.capacity.available}/{event.capacity.total} chỗ
            </span>
          </div>
        </div>

        {/* Instructor */}
        <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={event.instructor.avatar} />
            <AvatarFallback>{event.instructor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{event.instructor.name}</p>
            <p className="text-xs text-gray-500">{event.instructor.expertise[0]}</p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="font-medium">{event.rating}</span>
            <span className="text-gray-500">({event.reviewCount} đánh giá)</span>
          </div>
          <div className="flex gap-1">
            {event.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <div className="flex items-center justify-between w-full">
          <div>
            {event.originalPrice && (
              <span className="text-sm text-gray-500 line-through mr-2">
                {formatPrice(event.originalPrice)}
              </span>
            )}
            <span className="text-xl font-bold text-blue-600">
              {formatPrice(event.price)}
            </span>
          </div>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            Đăng ký ngay
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 