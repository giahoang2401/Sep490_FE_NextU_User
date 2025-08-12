// API Interfaces based on backend response structure
export interface ApiEvent {
  id: string
  code: string
  title: string
  description: string
  notes: string | null
  agenda: string | null
  instructorName: string | null
  phoneNumber: string
  imageUrl: string
  categoryId: number
  categoryName: string
  levelId: number
  levelName: string
  isPublished: boolean
  schedules: ApiEventSchedule[]
  addOns: ApiAddOn[]
  locations: ApiLocation[]
}

export interface ApiEventSchedule {
  id: string
  startTime: string
  endTime: string
  ticketTypes: ApiTicketType[]
}

export interface ApiTicketType {
  id: string
  name: string
  price: number
  totalQuantity: number
  discountRateEarlyBird?: number | null
  discountRateCombo?: number | null
}

export interface ApiAddOn {
  id: string
  name: string
  description: string | null
  price: number
}

export interface ApiLocation {
  id: string
  name: string
  address: string
}

export interface ApiEventCategory {
  id: number
  name: string
  description: string
}

export interface ApiEventLevel {
  id: number
  name: string
  description: string
}

// Transformed interfaces for frontend use
export interface TransformedEvent {
  id: string
  code: string
  title: string
  description: string
  category: {
    id: number
    name: string
    description: string
  }
  level: {
    id: number
    name: string
    description: string
  }
  isPublished: boolean
  schedules: TransformedEventSchedule[]
  ticketTypes: TransformedTicketType[]
  addOns: TransformedAddOn[]
  locations: TransformedLocation[]
  // New API fields
  notes?: string | null
  agenda?: string | null
  instructorName?: string | null
  phoneNumber?: string
  // Mock data for fields not in API
  image: string
  images: string[]
  amenities: string[]
  capacity: {
    total: number
    available: number
    minParticipants: number
  }
  rating: number
  reviewCount: number
  reviews: any[]
  tags: string[]
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  featured: boolean
  // Discount fields are now handled per ticket type via discountRateEarlyBird and discountRateCombo
  // Computed fields
  price: number
  originalPrice?: number
  currency: string
  date: string
  time: string
  duration: string
  location: string
  address: string
  shortDescription: string
}

export interface TransformedEventSchedule {
  id: string
  startTime: string
  endTime: string
  ticketTypes: TransformedTicketType[]
  // Computed fields
  time: string
  activity: string
  description: string
  duration: number
}

export interface TransformedTicketType {
  id: string
  name: string
  price: number
  totalQuantity: number
  discountRateEarlyBird?: number | null
  discountRateCombo?: number | null
}

export interface TransformedAddOn {
  id: string
  name: string
  description: string | null
  price: number
  type: 'private' | 'meal' | 'transport' | 'equipment'
}

export interface TransformedLocation {
  id: string
  name: string
  address: string
}

export interface TransformedEventCategory {
  id: number
  name: string
  description: string
  // Frontend specific fields
  icon?: any
  color?: string
}

export interface TransformedEventLevel {
  id: number
  name: string
  description: string
  // Frontend specific fields
  color?: string
} 