'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Users, Heart, Tag } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TransformedEvent } from '@/data/ecosystem/event-api'
import Link from 'next/link'
import api from '@/utils/axiosConfig'

interface TicketAvailability {
  ticketTypeId: string
  scheduleId: string
  ticketName: string
  totalQuantity: number
  sold: number
  remaining: number
}

interface EventCardProps {
  event: TransformedEvent
  variant?: 'default' | 'featured' | 'compact'
}

export default function EventCard({ event, variant = 'default' }: EventCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [ticketAvailability, setTicketAvailability] = useState<Record<string, TicketAvailability>>({})
  const [loadingAvailability, setLoadingAvailability] = useState<Record<string, boolean>>({})



  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Get the next upcoming schedule (not expired)
  const getNextUpcomingSchedule = () => {
    if (!event.schedules || event.schedules.length === 0) return null
    
    const now = new Date()
    const upcomingSchedules = event.schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startTime)
      return scheduleDate > now
    })
    
    if (upcomingSchedules.length === 0) return null
    
    // Sort by start time and return the earliest upcoming schedule
    return upcomingSchedules.sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )[0]
  }

  // Get the display schedule (next upcoming or fallback to first)
  const getDisplaySchedule = () => {
    const nextSchedule = getNextUpcomingSchedule()
    return nextSchedule || event.schedules[0]
  }

  // Format time from schedule
  const formatScheduleTime = (schedule: any) => {
    if (!schedule) return event.time
    
    const startTime = new Date(schedule.startTime)
    const endTime = new Date(schedule.endTime)
    
    const startTimeStr = startTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    
    const endTimeStr = endTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    
    return `${startTimeStr} - ${endTimeStr}`
  }

  // Calculate duration from schedule
  const calculateDuration = (schedule: any) => {
    if (!schedule) return event.duration
    
    const startTime = new Date(schedule.startTime)
    const endTime = new Date(schedule.endTime)
    const diffMs = endTime.getTime() - startTime.getTime()
    const diffHours = Math.round(diffMs / (1000 * 60 * 60))
    
    return `${diffHours} hours`
  }

  // Fetch ticket availability for a specific ticket type
  const fetchTicketAvailability = async (ticketTypeId: string) => {
    if (loadingAvailability[ticketTypeId]) return
    
    setLoadingAvailability(prev => ({ ...prev, [ticketTypeId]: true }))
    
    try {
      const response = await api.get(`/api/bookings/tickets/${ticketTypeId}/availability`)
      setTicketAvailability(prev => ({ 
        ...prev, 
        [ticketTypeId]: response.data 
      }))
    } catch (error) {
      console.error('Error fetching ticket availability:', error)
    } finally {
      setLoadingAvailability(prev => ({ ...prev, [ticketTypeId]: false }))
    }
  }

  // Fetch availability for all tickets in the display schedule
  const fetchAllTicketAvailability = async () => {
    if (!event.schedules || event.schedules.length === 0) return
    
    const displaySchedule = getDisplaySchedule()
    if (!displaySchedule || !displaySchedule.ticketTypes) return
    
    // Fetch availability for all tickets in the display schedule
    for (const ticket of displaySchedule.ticketTypes) {
      await fetchTicketAvailability(ticket.id)
    }
  }

  // Calculate total available spots from ticket availability API
  const calculateAvailableSpots = () => {
    if (Object.keys(ticketAvailability).length === 0) {
      // Fallback to event capacity if no API data
      return {
        available: event.capacity.available,
        total: event.capacity.total
      }
    }

    let totalAvailable = 0
    let totalCapacity = 0

    Object.values(ticketAvailability).forEach(availability => {
      totalAvailable += availability.remaining
      totalCapacity += availability.totalQuantity
    })
    
    return { available: totalAvailable, total: totalCapacity }
  }

  // Load ticket availability when component mounts
  useEffect(() => {
    fetchAllTicketAvailability()
  }, [event.id, event.schedules])

  const getAvailabilityColor = () => {
    const { available, total } = calculateAvailableSpots()
    const percentage = (available / total) * 100
    if (percentage <= 20) return 'text-red-600'
    if (percentage <= 50) return 'text-orange-600'
    return 'text-green-600'
  }

  if (variant === 'compact') {
    return (
      <Link href={`/ecosystem/events/${event.id}`}>
        <Card 
          className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-0 bg-white h-full flex flex-col"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            {event.featured && (
              <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                Featured
              </Badge>
            )}
            <Button
              size="sm"
              variant="ghost"
              className={`absolute top-3 right-3 p-2 h-8 w-8 rounded-full transition-all ${
                isLiked ? 'text-red-500' : 'text-white hover:text-red-500'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                setIsLiked(!isLiked)
              }}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          </div>

          <CardContent className="p-4 flex-1">
            <div className="flex items-start justify-between mb-2">
              <Badge variant="secondary" className="text-xs">
                {event.category.name}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {event.level.name}
              </Badge>
            </div>

            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3rem]">
              {event.title}
            </h3>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[3rem]">
              {event.shortDescription}
            </p>

            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <div className="flex items-center gap-2">
                  {(() => {
                    const displaySchedule = getDisplaySchedule()
                    return displaySchedule ? 
                      `${formatDate(displaySchedule.startTime)} • ${formatScheduleTime(displaySchedule)}` :
                      `${formatDate(event.date)} • ${event.time}`
                  })()}
                  {getNextUpcomingSchedule() && getNextUpcomingSchedule() !== event.schedules[0] && (
                    <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                      Next Schedule
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {event.location}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {(() => {
                  const displaySchedule = getDisplaySchedule()
                  return displaySchedule ? 
                    calculateDuration(displaySchedule) :
                    event.duration
                })()}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-1">
                {Object.keys(ticketAvailability).length > 0 ? (
                  <span className="text-sm font-medium">
                    {calculateAvailableSpots().available} spots left
                  </span>
                ) : (
                  <span className="text-sm font-medium">
                    {Object.keys(loadingAvailability).some(key => loadingAvailability[key]) ? (
                      <span className="text-gray-400">Loading spots...</span>
                    ) : (
                      `${event.capacity.available} spots left`
                    )}
                  </span>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-4 pt-0 mt-auto">
            <div className="flex items-center justify-center w-full">
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 w-full">
                View Details
              </Button>
            </div>
          </CardFooter>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/ecosystem/events/${event.id}`}>
      <Card 
        className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 bg-white h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-64 object-cover rounded-t-lg"
          />
          {event.featured && (
            <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
              Featured
            </Badge>
          )}
          <Button
            size="sm"
            variant="ghost"
            className={`absolute top-4 right-4 p-2 h-8 w-8 rounded-full transition-all ${
              isLiked ? 'text-red-500' : 'text-white hover:text-red-500'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              setIsLiked(!isLiked)
            }}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <CardContent className="p-6 flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex gap-2">
              <Badge variant="secondary">
                {event.category.name}
              </Badge>
            </div>
            <Badge variant="outline">
              {event.level.name}
            </Badge>
          </div>

          <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
            {event.title}
          </h3>

          <p className="text-gray-600 mb-4 line-clamp-3 min-h-[4.5rem]">
            {event.shortDescription}
          </p>

          <div className="space-y-3 text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-3" />
              <div className="flex items-center gap-2">
                {(() => {
                  const displaySchedule = getDisplaySchedule()
                  return displaySchedule ? 
                    `${formatDate(displaySchedule.startTime)} • ${formatScheduleTime(displaySchedule)}` :
                    `${formatDate(event.date)} • ${event.time}`
                })()}
                {getNextUpcomingSchedule() && getNextUpcomingSchedule() !== event.schedules[0] && (
                  <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                    Next Schedule
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-3" />
              {event.location}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-3" />
              {(() => {
                const displaySchedule = getDisplaySchedule()
                return displaySchedule ? 
                  calculateDuration(displaySchedule) :
                  event.duration
              })()}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-3" />
              <span className={getAvailabilityColor()}>
                {Object.keys(ticketAvailability).length > 0 ? (
                  `${calculateAvailableSpots().available}/${calculateAvailableSpots().total} spots available`
                ) : (
                  Object.keys(loadingAvailability).some(key => loadingAvailability[key]) ? (
                    <span className="text-gray-400">Loading spots...</span>
                  ) : (
                    `${event.capacity.available}/${event.capacity.total} spots available`
                  )
                )}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-1 mb-4 min-h-[2rem]">
            {event.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0 mt-auto">
          <div className="flex items-center justify-center w-full">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 w-full"
            >
              View Details
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
} 