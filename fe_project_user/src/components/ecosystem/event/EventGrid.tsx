'use client'

import { useState, useEffect } from 'react'
import { Filter, Grid, List, SlidersHorizontal, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import EventCard from './EventCard'
import { TransformedEvent, TransformedEventCategory, TransformedEventLevel } from '@/data/ecosystem/event-api'
import { eventService } from '@/utils/eventService'

interface EventGridProps {
  events: TransformedEvent[]
  title?: string
  subtitle?: string
  showFilters?: boolean
  layout?: 'grid' | 'list'
}

export default function EventGrid({ 
  events, 
  title = "Featured Events", 
  subtitle = "Discover diverse events and workshops",
  showFilters = true,
  layout = 'grid'
}: EventGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(layout)
  const [sortBy, setSortBy] = useState('date')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // API data state
  const [categories, setCategories] = useState<TransformedEventCategory[]>([])
  const [levels, setLevels] = useState<TransformedEventLevel[]>([])
  const [loading, setLoading] = useState(false)

  // Load categories and levels from API
  useEffect(() => {
    const loadFilterData = async () => {
      setLoading(true)
      try {
        const [categoriesData, levelsData] = await Promise.all([
          eventService.getEventCategories(),
          eventService.getEventLevels()
        ])
        setCategories(categoriesData)
        setLevels(levelsData)
      } catch (error) {
        console.error('Error loading filter data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (showFilters) {
      loadFilterData()
    }
  }, [showFilters])

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const searchableText = [
        event.title,
        event.description,
        event.shortDescription,
        event.location,
        event.category.name,
        event.level.name
      ].join(' ').toLowerCase()
      
      if (!searchableText.includes(query)) {
        return false
      }
    }
    
    // Category filter
    if (selectedCategory !== 'all' && event.category.id !== parseInt(selectedCategory)) return false
    
    // Level filter
    if (selectedLevel !== 'all' && event.level.id !== parseInt(selectedLevel)) return false
    
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
      case 'name':
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedLevel('all')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <Card className="mb-8">
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search events, workshops, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-blue-500"
              />
            </div>

            {/* View Mode and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('grid')}
                  className="px-3"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('list')}
                  className="px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Latest Date</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick Filters */}
            <div className="space-y-4">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedCategory === 'all' ? "default" : "secondary"}
                    className={`cursor-pointer hover:bg-blue-100 transition-colors ${
                      selectedCategory === 'all' ? 'bg-blue-500 text-white' : ''
                    }`}
                    onClick={() => setSelectedCategory('all')}
                  >
                    All Categories
                  </Badge>
                  {categories.map((category) => (
                    <Badge
                      key={category.id}
                      variant={selectedCategory === category.id.toString() ? "default" : "secondary"}
                      className={`cursor-pointer hover:bg-blue-100 transition-colors ${
                        selectedCategory === category.id.toString() ? 'bg-blue-500 text-white' : ''
                      }`}
                      onClick={() => setSelectedCategory(category.id.toString())}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Levels */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Levels</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedLevel === 'all' ? "default" : "outline"}
                    className={`cursor-pointer ${selectedLevel === 'all' ? 'bg-blue-500 text-white' : ''}`}
                    onClick={() => setSelectedLevel('all')}
                  >
                    All Levels
                  </Badge>
                  {levels.map((level) => (
                    <Badge
                      key={level.id}
                      variant={selectedLevel === level.id.toString() ? "default" : "outline"}
                      className={`cursor-pointer ${level.color}`}
                      onClick={() => setSelectedLevel(level.id.toString())}
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
                variant="outline" 
                size="lg"
                className="flex-1"
                onClick={handleClearFilters}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          Showing {sortedEvents.length} events
          {filteredEvents.length !== events.length && ` (filtered from ${events.length} events)`}
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
            No events found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters or search with different keywords
          </p>
          <Button
            variant="outline"
            onClick={handleClearFilters}
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Load More */}
      {sortedEvents.length > 0 && (
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View more events
          </Button>
        </div>
      )}
    </div>
  )
} 