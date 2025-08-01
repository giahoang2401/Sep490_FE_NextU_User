'use client'

import { useState } from 'react'
import { Calendar, Search, Filter, MapPin, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { eventCategories, eventTypes, eventLevels } from '@/data/ecosystem/event-data'
import Link from 'next/link'

export default function EventNavigation() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center mb-6">
          <Link href="/ecosystem" className="text-gray-500 hover:text-gray-700">
            Ecosystem
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900 font-medium">Sự kiện & Workshop</span>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center mb-2">
              <Calendar className="h-6 w-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Sự Kiện & Workshop</h1>
            </div>
            <p className="text-gray-600">
              Khám phá đa dạng các sự kiện từ yoga, nấu ăn, nhiếp ảnh đến networking
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc nâng cao
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Calendar className="h-4 w-4 mr-2" />
              Lịch sự kiện
            </Button>
          </div>
        </div>

        {/* Search and Quick Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Tìm kiếm sự kiện, workshop, địa điểm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-blue-500"
              />
            </div>

            {/* Quick Filters */}
            <div className="space-y-4">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Danh mục</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(eventCategories).map(([key, category]) => (
                    <Badge
                      key={key}
                      variant={selectedCategory === key ? "default" : "secondary"}
                      className={`cursor-pointer hover:bg-blue-100 transition-colors ${
                        selectedCategory === key ? 'bg-blue-500 text-white' : ''
                      }`}
                      onClick={() => setSelectedCategory(selectedCategory === key ? '' : key)}
                    >
                      <category.icon className="h-3 w-3 mr-1" />
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Event Types */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Loại sự kiện</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(eventTypes).map(([key, type]) => (
                    <Badge
                      key={key}
                      variant={selectedType === key ? "default" : "outline"}
                      className="cursor-pointer hover:bg-blue-50"
                      onClick={() => setSelectedType(selectedType === key ? '' : key)}
                    >
                      <type.icon className="h-3 w-3 mr-1" />
                      {type.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Levels */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Trình độ</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(eventLevels).map(([key, level]) => (
                    <Badge
                      key={key}
                      variant={selectedLevel === key ? "default" : "outline"}
                      className={`cursor-pointer ${level.color}`}
                      onClick={() => setSelectedLevel(selectedLevel === key ? '' : key)}
                    >
                      {level.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button 
                size="lg" 
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Search className="h-4 w-4 mr-2" />
                Tìm kiếm
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="flex-1"
              >
                <Filter className="h-4 w-4 mr-2" />
                Xóa bộ lọc
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">500+</div>
            <div className="text-sm text-gray-600">Sự kiện mỗi tháng</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">10K+</div>
            <div className="text-sm text-gray-600">Người tham gia</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">50+</div>
            <div className="text-sm text-gray-600">Địa điểm</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">4.8★</div>
            <div className="text-sm text-gray-600">Đánh giá trung bình</div>
          </div>
        </div>
      </div>
    </div>
  )
} 