'use client'

import { useState } from 'react'
import { Calendar, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockEvents, eventCategories } from '@/data/ecosystem/event-data'
import EventEcosystemCard from './EventEcosystemCard'
import Link from 'next/link'

export default function EventEcosystemSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const featuredEvents = mockEvents.filter(event => event.featured).slice(0, 3)
  
  const filteredEvents = selectedCategory === 'all' 
    ? featuredEvents 
    : featuredEvents.filter(event => event.category === selectedCategory)

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Sự Kiện & Workshop</h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Khám phá đa dạng các sự kiện từ yoga, nấu ăn, nhiếp ảnh đến networking. 
            Kết nối, học hỏi và phát triển cùng cộng đồng.
          </p>
          
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
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredEvents.map((event) => (
            <EventEcosystemCard key={event.id} event={event} />
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">500+</div>
            <div className="text-sm text-gray-600">Sự kiện mỗi tháng</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">10K+</div>
            <div className="text-sm text-gray-600">Người tham gia</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">50+</div>
            <div className="text-sm text-gray-600">Địa điểm</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">4.8★</div>
            <div className="text-sm text-gray-600">Đánh giá trung bình</div>
          </div>
        </div>
      </div>
    </section>
  )
} 