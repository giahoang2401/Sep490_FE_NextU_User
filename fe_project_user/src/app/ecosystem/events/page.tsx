import EventNavigation from '@/components/ecosystem/event/EventNavigation'
import EventGrid from '@/components/ecosystem/event/EventGrid'
import { mockEvents, popularEvents, upcomingEvents } from '@/data/ecosystem/event-data'

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <EventNavigation />
      
      {/* Featured Events */}
      <EventGrid 
        events={popularEvents}
        title="Sự kiện nổi bật"
        subtitle="Các sự kiện được yêu thích nhất"
        showFilters={false}
      />

      {/* All Events */}
      <EventGrid 
        events={mockEvents}
        title="Tất cả sự kiện"
        subtitle="Khám phá đa dạng các sự kiện và workshop"
        showFilters={true}
      />
    </div>
  )
} 