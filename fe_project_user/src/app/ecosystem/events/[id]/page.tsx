'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { useRouter } from 'next/navigation'
import EventDetail from '@/components/ecosystem/event/EventDetail'
import { TransformedEvent } from '@/data/ecosystem/event-api'
import { eventService } from '@/api/eventService'

interface EventDetailPageProps {
  params: {
    id: string
  }
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const [event, setEvent] = useState<TransformedEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadEvent = async () => {
      try {
        console.log('Loading event with ID:', params.id)
        setLoading(true)
        const eventData = await eventService.getEventById(params.id)
        console.log('Event data received:', eventData)
        if (!eventData) {
          console.log('No event data found, showing 404')
          notFound()
        }
        setEvent(eventData)
      } catch (err) {
        console.error('Error loading event:', err)
        setError('Failed to load event. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadEvent()
    }
  }, [params.id])

  const handleBackClick = () => {
    router.push('/ecosystem/events')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
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

  if (!event) {
    notFound()
  }

  return <EventDetail event={event} onBackClick={handleBackClick} />
} 