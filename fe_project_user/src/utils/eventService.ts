import api from './axiosConfig'
import { 
  ApiEvent, 
  ApiEventCategory, 
  ApiEventLevel, 
  TransformedEvent, 
  TransformedEventCategory, 
  TransformedEventLevel 
} from '@/data/ecosystem/event-api'

// Mock image data for events (as specified by user)
const mockImages = [
  '/images/events/yoga-morning.jpg',
  '/images/events/cooking-workshop.jpg',
  '/images/events/photography.jpg',
  '/images/events/meditation-retreat.jpg',
  '/images/events/startup-networking.jpg',
  '/images/events/art-workshop.jpg',
  '/images/events/music-class.jpg',
  '/images/events/fitness-class.jpg'
]

const mockInstructors = [
  {
    name: 'Sarah Johnson',
    avatar: '/images/instructors/sarah-johnson.jpg',
    bio: 'Professional instructor with 8 years of experience in wellness and fitness.',
    expertise: ['Yoga', 'Meditation', 'Fitness Training', 'Wellness Coaching']
  },
  {
    name: 'Michael Chen',
    avatar: '/images/instructors/michael-chen.jpg',
    bio: 'Expert chef with 15 years of culinary experience specializing in Asian cuisine.',
    expertise: ['Asian Cuisine', 'Culinary Arts', 'Food Safety', 'Recipe Development']
  },
  {
    name: 'Emma Davis',
    avatar: '/images/instructors/emma-davis.jpg',
    bio: 'Professional photographer with 20 years of experience in various photography styles.',
    expertise: ['Portrait Photography', 'Landscape', 'Street Photography', 'Photo Editing']
  },
  {
    name: 'David Wilson',
    avatar: '/images/instructors/david-wilson.jpg',
    bio: 'Business consultant and startup mentor with extensive experience in entrepreneurship.',
    expertise: ['Business Strategy', 'Startup Development', 'Networking', 'Mentoring']
  }
]

// Transform API event to frontend format
export function transformApiEvent(apiEvent: ApiEvent): TransformedEvent {
  const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)]
  const randomInstructor = mockInstructors[Math.floor(Math.random() * mockInstructors.length)]
  
  // Get the first schedule for date/time info
  const firstSchedule = apiEvent.schedules[0]
  const startDate = firstSchedule ? new Date(firstSchedule.startDate) : new Date()
  const endDate = firstSchedule ? new Date(firstSchedule.endDate) : new Date()
  
  // Calculate duration
  const durationMs = endDate.getTime() - startDate.getTime()
  const durationHours = Math.ceil(durationMs / (1000 * 60 * 60))
  
  // Get the first ticket type for pricing (lowest price)
  const sortedTickets = [...apiEvent.ticketTypes].sort((a, b) => a.price - b.price)
  const firstTicket = sortedTickets[0]
  const price = firstTicket ? firstTicket.price : 0
  
  // Get the first location
  const firstLocation = apiEvent.locations[0]
  
  return {
    id: apiEvent.id,
    code: apiEvent.code,
    title: apiEvent.title,
    description: apiEvent.description,
    category: {
      id: apiEvent.categoryId,
      name: apiEvent.categoryName,
      description: ''
    },
    level: {
      id: apiEvent.levelId,
      name: apiEvent.levelName,
      description: ''
    },
    isPublished: apiEvent.isPublished,
    schedules: apiEvent.schedules.map(schedule => ({
      id: schedule.id,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      repeatPattern: schedule.repeatPattern,
      time: new Date(schedule.startDate).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      activity: 'Session',
      description: 'Main event session',
      duration: Math.ceil((new Date(schedule.endDate).getTime() - new Date(schedule.startDate).getTime()) / (1000 * 60))
    })),
    ticketTypes: apiEvent.ticketTypes,
    addOns: apiEvent.addOns.map(addon => ({
      ...addon,
      type: 'equipment' as const
    })),
    locations: apiEvent.locations,
    // Mock data
    image: randomImage,
    images: [randomImage, randomImage, randomImage],
    instructor: randomInstructor,
    amenities: ['WiFi', 'Refreshments', 'Materials', 'Certificate'],
    requirements: {
      age: '16+',
      level: apiEvent.levelName,
      equipment: ['Comfortable clothing'],
      healthDeclaration: false
    },
    capacity: {
      total: 20,
      available: Math.floor(Math.random() * 15) + 5,
      minParticipants: 5
    },
    rating: 4.5 + Math.random() * 0.5,
    reviewCount: Math.floor(Math.random() * 100) + 10,
    reviews: [],
    tags: [apiEvent.categoryName.toLowerCase(), apiEvent.levelName.toLowerCase()],
    status: 'upcoming' as const,
    featured: Math.random() > 0.7,
    // Computed fields
    price,
    currency: 'VND',
    date: startDate.toISOString().split('T')[0],
    time: startDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    duration: `${durationHours} hours`,
    location: firstLocation?.name || 'TBD',
    address: firstLocation?.address || 'Address to be announced',
    shortDescription: apiEvent.description.length > 100 
      ? apiEvent.description.substring(0, 100) + '...' 
      : apiEvent.description
  }
}

// Transform API category to frontend format
export function transformApiCategory(apiCategory: ApiEventCategory): TransformedEventCategory {
  return {
    id: apiCategory.id,
    name: apiCategory.name,
    description: apiCategory.description,
    color: getCategoryColor(apiCategory.name)
  }
}

// Transform API level to frontend format
export function transformApiLevel(apiLevel: ApiEventLevel): TransformedEventLevel {
  return {
    id: apiLevel.id,
    name: apiLevel.name,
    description: apiLevel.description,
    color: getLevelColor(apiLevel.name)
  }
}

// Helper function to get category color
function getCategoryColor(categoryName: string): string {
  const colorMap: Record<string, string> = {
    'Wellnesss': 'bg-red-500',
    'Creative': 'bg-purple-500',
    'Culture': 'bg-blue-500'
  }
  return colorMap[categoryName] || 'bg-gray-500'
}

// Helper function to get level color
function getLevelColor(levelName: string): string {
  const colorMap: Record<string, string> = {
    'Beginner': 'bg-green-100 text-green-800',
    'Intermediate': 'bg-yellow-100 text-yellow-800',
    'Advanced': 'bg-red-100 text-red-800'
  }
  return colorMap[levelName] || 'bg-blue-100 text-blue-800'
}

// API service functions
export const eventService = {
  // Get all events
  async getEvents(): Promise<TransformedEvent[]> {
    try {
      const response = await api.get('/api/Event')
      const apiEvents: ApiEvent[] = response.data
      return apiEvents.map(transformApiEvent)
    } catch (error) {
      console.error('Error fetching events:', error)
      return []
    }
  },

  // Get event categories
  async getEventCategories(): Promise<TransformedEventCategory[]> {
    try {
      const response = await api.get('/api/EventCategories')
      const apiCategories: ApiEventCategory[] = response.data
      return apiCategories.map(transformApiCategory)
    } catch (error) {
      console.error('Error fetching event categories:', error)
      return []
    }
  },

  // Get event levels
  async getEventLevels(): Promise<TransformedEventLevel[]> {
    try {
      const response = await api.get('/api/EventLevels')
      const apiLevels: ApiEventLevel[] = response.data
      return apiLevels.map(transformApiLevel)
    } catch (error) {
      console.error('Error fetching event levels:', error)
      return []
    }
  },

  // Get event by ID
  async getEventById(id: string): Promise<TransformedEvent | null> {
    try {
      console.log('Calling API for event ID:', id)
      const response = await api.get(`/api/Event/${id}`)
      console.log('API response:', response.data)
      const apiEvent: ApiEvent = response.data
      const transformedEvent = transformApiEvent(apiEvent)
      console.log('Transformed event:', transformedEvent)
      return transformedEvent
    } catch (error) {
      console.error('Error fetching event by ID:', error)
      return null
    }
  }
} 