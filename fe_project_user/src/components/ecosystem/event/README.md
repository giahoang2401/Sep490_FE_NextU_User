# Event Components

Bộ components cho hệ thống Events & Workshops trong Ecosystem.

## Cấu trúc

```
src/components/ecosystem/event/
├── EventHero.tsx              # Hero section cho trang events chính
├── EventCard.tsx              # Card hiển thị thông tin event
├── EventGrid.tsx              # Grid hiển thị danh sách events
├── EventDetail.tsx            # Trang chi tiết event
├── EventBooking.tsx           # Modal booking event
├── EventNavigation.tsx        # Navigation cho trang events
├── EventSection.tsx           # Section hiển thị events
├── EventEcosystemCard.tsx     # Card event trong ecosystem
├── EventEcosystemSection.tsx  # Section events trong ecosystem
└── index.ts                   # Export tất cả components
```

## Components

### EventHero
Hero section với search và filter nhanh cho trang events chính.

```tsx
import { EventHero } from '@/components/ecosystem/event'

<EventHero />
```

### EventCard
Card hiển thị thông tin event với các variant khác nhau.

```tsx
import { EventCard } from '@/components/ecosystem/event'

<EventCard 
  event={event} 
  variant="default" // 'default' | 'featured' | 'compact'
/>
```

### EventGrid
Grid hiển thị danh sách events với filter và sort.

```tsx
import { EventGrid } from '@/components/ecosystem/event'

<EventGrid 
  events={events}
  title="Sự kiện nổi bật"
  subtitle="Các sự kiện được yêu thích nhất"
  showFilters={true}
  layout="grid" // 'grid' | 'list'
/>
```

### EventDetail
Trang chi tiết event với tabs và booking sidebar.

```tsx
import { EventDetail } from '@/components/ecosystem/event'

<EventDetail event={event} />
```

### EventBooking
Modal booking event với multi-step form.

```tsx
import { EventBooking } from '@/components/ecosystem/event'

<EventBooking 
  event={event}
  onClose={() => setShowBooking(false)}
/>
```

### EventNavigation
Navigation cho trang events với search và filter.

```tsx
import { EventNavigation } from '@/components/ecosystem/event'

<EventNavigation />
```

### EventSection
Section hiển thị events với category filter.

```tsx
import { EventSection } from '@/components/ecosystem/event'

<EventSection />
```

### EventEcosystemCard
Card event được tối ưu cho ecosystem chính.

```tsx
import { EventEcosystemCard } from '@/components/ecosystem/event'

<EventEcosystemCard event={event} />
```

### EventEcosystemSection
Section events trong ecosystem chính.

```tsx
import { EventEcosystemSection } from '@/components/ecosystem/event'

<EventEcosystemSection />
```

## Data Structure

### Event Interface
```tsx
interface Event {
  id: string
  title: string
  category: EventCategory
  type: EventType
  description: string
  shortDescription: string
  date: string
  time: string
  duration: string
  location: string
  address: string
  price: number
  originalPrice?: number
  currency: string
  image: string
  images: string[]
  instructor: {
    name: string
    avatar: string
    bio: string
    expertise: string[]
  }
  schedule: EventSchedule[]
  amenities: string[]
  requirements: {
    age: string
    level: EventLevel
    equipment?: string[]
    healthDeclaration?: boolean
  }
  capacity: {
    total: number
    available: number
    minParticipants: number
  }
  rating: number
  reviewCount: number
  reviews: EventReview[]
  addOns: EventAddOn[]
  tags: string[]
  status: EventStatus
  featured: boolean
  earlyBirdDiscount?: {
    percentage: number
    validUntil: string
  }
  groupDiscount?: {
    minPeople: number
    percentage: number
  }
}
```

## Features

- ✅ Responsive design
- ✅ Search và filter nâng cao
- ✅ Multi-step booking process
- ✅ Real-time availability tracking
- ✅ Discount và promotion support
- ✅ Review và rating system
- ✅ Instructor profiles
- ✅ Add-ons và upgrades
- ✅ Payment integration ready
- ✅ Calendar integration
- ✅ Social sharing
- ✅ Mobile optimized

## Usage Examples

### Trang Events chính
```tsx
import { EventNavigation, EventGrid } from '@/components/ecosystem/event'

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <EventNavigation />
      <EventGrid 
        events={events}
        title="Tất cả sự kiện"
        showFilters={true}
      />
    </div>
  )
}
```

### Trang chi tiết Event
```tsx
import { EventDetail } from '@/components/ecosystem/event'

export default function EventDetailPage({ params }) {
  const event = getEvent(params.id)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <EventDetail event={event} />
    </div>
  )
}
```

### Section trong Ecosystem
```tsx
import { EventEcosystemSection } from '@/components/ecosystem/event'

export default function EcosystemPage() {
  return (
    <div>
      {/* Other sections */}
      <EventEcosystemSection />
      {/* Other sections */}
    </div>
  )
}
```

## Styling

Tất cả components sử dụng Tailwind CSS và shadcn/ui components. Có thể customize thông qua:

- CSS variables trong globals.css
- Tailwind config
- Component props

## Dependencies

- React 18+
- Next.js 13+
- Tailwind CSS
- shadcn/ui components
- Lucide React icons
- date-fns (recommended for date handling) 