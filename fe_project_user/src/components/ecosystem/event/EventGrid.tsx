'use client'

import { useState } from 'react'
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import EventCard from './EventCard'
import { Event, eventCategories, eventTypes, eventLevels } from '@/data/ecosystem/event-data'

interface EventGridProps {
  events: Event[]
  title?: string
  subtitle?: string
  showFilters?: boolean
  layout?: 'grid' | 'list'
}

export default function EventGrid({ 
  events, 
  title = "Sự kiện nổi bật", 
  subtitle = "Khám phá các sự kiện và workshop đa dạng",
  showFilters = true,
  layout = 'grid'
}: EventGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(layout)
  const [sortBy, setSortBy] = useState('date')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')

  const filteredEvents = events.filter(event => {
    if (selectedCategory !== 'all' && event.category !== selectedCategory) return false
    if (selectedType !== 'all' && event.type !== selectedType) return false
    if (selectedLevel !== 'all' && event.requirements.level !== selectedLevel) return false
    return true
  })

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return b.rating - a.rating
      case 'popularity':
        return b.reviewCount - a.reviewCount
      default:
        return 0
    }
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-6 lg:mb-0">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">{subtitle}</p>
        </div>

        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
                className="h-8 px-3"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="h-8 px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Ngày gần nhất</SelectItem>
                <SelectItem value="price-low">Giá thấp nhất</SelectItem>
                <SelectItem value="price-high">Giá cao nhất</SelectItem>
                <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                <SelectItem value="popularity">Phổ biến nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <SlidersHorizontal className="h-5 w-5 mr-2 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {Object.entries(eventCategories).map(([key, category]) => (
                      <SelectItem key={key} value={key}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại sự kiện
                </label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    {Object.entries(eventTypes).map(([key, type]) => (
                      <SelectItem key={key} value={key}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trình độ
                </label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả trình độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trình độ</SelectItem>
                    {Object.entries(eventLevels).map(([key, level]) => (
                      <SelectItem key={key} value={key}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategory !== 'all' || selectedType !== 'all' || selectedLevel !== 'all') && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-gray-600">Bộ lọc đang áp dụng:</span>
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    {eventCategories[selectedCategory as keyof typeof eventCategories]?.name}
                  </Badge>
                )}
                {selectedType !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    {eventTypes[selectedType as keyof typeof eventTypes]?.name}
                  </Badge>
                )}
                {selectedLevel !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    {eventLevels[selectedLevel as keyof typeof eventLevels]?.name}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedType('all')
                    setSelectedLevel('all')
                  }}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Xóa tất cả
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          Hiển thị {sortedEvents.length} sự kiện
          {filteredEvents.length !== events.length && ` (đã lọc từ ${events.length} sự kiện)`}
        </p>
      </div>

      {/* Events Grid/List */}
      {sortedEvents.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-6'
        }>
          {sortedEvents.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              variant={viewMode === 'list' ? 'compact' : 'default'}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy sự kiện
          </h3>
          <p className="text-gray-600 mb-6">
            Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategory('all')
              setSelectedType('all')
              setSelectedLevel('all')
            }}
          >
            Xóa bộ lọc
          </Button>
        </div>
      )}

      {/* Load More */}
      {sortedEvents.length > 0 && (
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Xem thêm sự kiện
          </Button>
        </div>
      )}
    </div>
  )
} 