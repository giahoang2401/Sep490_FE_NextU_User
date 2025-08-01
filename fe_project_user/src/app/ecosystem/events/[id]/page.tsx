import EventDetail from '@/components/ecosystem/event/EventDetail'
import { mockEvents } from '@/data/ecosystem/event-data'
import { notFound } from 'next/navigation'

interface EventDetailPageProps {
  params: {
    id: string
  }
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const event = mockEvents.find(e => e.id === params.id)
  
  if (!event) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EventDetail event={event} />
    </div>
  )
} 