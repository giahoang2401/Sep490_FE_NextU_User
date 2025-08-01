'use client'

import { useState } from 'react'
import { Calendar, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mockEvents, eventCategories } from '@/data/ecosystem/event-data'
import Link from 'next/link'

export default function EventSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const featuredEvents = mockEvents.filter(event => event.featured).slice(0, 6)
  
  const filteredEvents = selectedCategory === 'all' 
    ? featuredEvents 
    : featuredEvents.filter(event => event.category === selectedCategory)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
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

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Sự Kiện & Workshop</h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá đa dạng các sự kiện từ yoga, nấu ăn, nhiếp ảnh đến networking. 
            Kết nối, học hỏi và phát triển cùng cộng đồng.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Badge
            variant={selectedCategory === 'all' ? 'default' : 'secondary'}
            className="cursor-pointer hover:bg-blue-100"
            onClick={() => setSelectedCategory('all')}
          >
            Tất cả
          </Badge>
          {Object.entries(eventCategories).map(([key, category]) => (
            <Badge
              key={key}
              variant={selectedCategory === key ? 'default' : 'secondary'}
              className="cursor-pointer hover:bg-blue-100"
              onClick={() => setSelectedCategory(key)}
            >
              <category.icon className="h-3 w-3 mr-1" />
              {category.name}
            </Badge>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-0 bg-white">
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
                    {eventCategories[event.category].name}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-xs font-medium">{event.rating}</span>
                  </div>
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
                    <span className="text-sm font-medium text-blue-600">
                      {formatPrice(event.price)}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      Còn {event.capacity.available} chỗ
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="group-hover:bg-blue-500 group-hover:text-white transition-colors"
                  >
                    Xem chi tiết
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/ecosystem/events">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              Xem tất cả sự kiện
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
} 