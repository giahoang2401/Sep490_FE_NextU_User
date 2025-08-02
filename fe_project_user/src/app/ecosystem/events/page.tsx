'use client'

import { useState, useEffect } from 'react'
import EventNavigation from '@/components/ecosystem/event/EventNavigation'
import EventGrid from '@/components/ecosystem/event/EventGrid'
import { TransformedEvent } from '@/data/ecosystem/event-api'
import { eventService } from '@/utils/eventService'

export default function EventsPage() {
  const [events, setEvents] = useState<TransformedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true)
        const eventsData = await eventService.getEvents()
        console.log('Loaded events:', eventsData.length)
        console.log('Events with featured flag:', eventsData.filter(e => e.featured).length)
        console.log('Featured events details:', eventsData.filter(e => e.featured).map(e => ({ id: e.id, title: e.title, featured: e.featured })))
        setEvents(eventsData)
      } catch (err) {
        console.error('Error loading events:', err)
        setError('Failed to load events. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  // Improved featured events logic
  const featuredEvents = events.filter(event => {
    // Check if featured property exists and is true
    if (event.featured === true) {
      return true
    }
    // Fallback: if no featured events, show first 2 events as featured
    return false
  })

  // Fallback: if no featured events, show first 2 events as featured
  const fallbackFeaturedEvents = featuredEvents.length === 0 && events.length > 0 
    ? events.slice(0, 2) 
    : featuredEvents

  const upcomingEvents = events.filter(event => event.status === 'upcoming')

  console.log('Final featured events count:', fallbackFeaturedEvents.length)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EventNavigation />
      
      {/* Featured Events */}
      {fallbackFeaturedEvents.length > 0 && (
        <EventGrid 
          events={fallbackFeaturedEvents}
          title="Featured Events"
          subtitle="Most popular and highly-rated events"
          showFilters={false}
        />
      )}

      {/* All Events */}
      <EventGrid 
        events={events}
        title="All Events"
        subtitle="Discover diverse events and workshops"
        showFilters={true}
      />
    </div>
  )
} 