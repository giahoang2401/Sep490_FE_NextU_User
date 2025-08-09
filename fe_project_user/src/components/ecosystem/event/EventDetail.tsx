'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  Heart, 
  Share2, 
  BookOpen,
  CheckCircle,
  AlertCircle,
  Info,
  Tag,
  ArrowLeft,
  ExternalLink,
  Ticket,
  Plus,
  Minus,
  Loader2,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { TransformedEvent, TransformedEventSchedule } from '@/data/ecosystem/event-api'
import api from '@/utils/axiosConfig'
import { Notify } from 'notiflix'
import PaymentSummaryModal from '@/components/payment/PaymentSummaryModal'

interface EventDetailProps {
  event: TransformedEvent
  onBackClick?: () => void
}

interface SelectedTicket {
  id: string
  name: string
  price: number
  quantity: number
  maxQuantity: number
}

interface SelectedAddOn {
  id: string
  name: string
  price: number
  quantity: number
  maxQuantity: number
}

interface BookingRequest {
  eventId: string
  scheduleId: string
  ticketTypeId: string
  quantity: number
  addOns: {
    addOnId: string
    quantity: number
  }[]
}

interface RecurringBookingRequest {
  eventId: string
  tickets: {
    scheduleId: string
    ticketTypeId: string
  }[]
  quantity: number
  addOns: {
    addOnId: string
    quantity: number
  }[]
}

interface SelectedRecurringTicket {
  scheduleId: string
  ticketTypeId: string
  scheduleName: string
  ticketName: string
  price: number
}

interface TicketAvailability {
  ticketTypeId: string
  scheduleId: string
  ticketName: string
  totalQuantity: number
  sold: number
  remaining: number
}

interface TicketQuota {
  ticketTypeId: string
  maxPerUser: number
  confirmedByUser: number
  pendingByUser: number
  remainingForUser: number
  earlyDay: string
}

export default function EventDetail({ event, onBackClick }: EventDetailProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedSchedule, setSelectedSchedule] = useState<TransformedEventSchedule | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<SelectedTicket | null>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOn[]>([])
  const [isBooking, setIsBooking] = useState(false)
  
  // States for Buy Full Schedule feature
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [selectedRecurringTickets, setSelectedRecurringTickets] = useState<SelectedRecurringTicket[]>([])
  const [isRecurringBooking, setIsRecurringBooking] = useState(false)
  
  // States for Payment Summary Modal
  const [showPaymentSummary, setShowPaymentSummary] = useState(false)
  const [bookingPurchaseId, setBookingPurchaseId] = useState<string>('')
  
  // State for ticket availability
  const [ticketAvailability, setTicketAvailability] = useState<Record<string, TicketAvailability>>({})
  const [loadingAvailability, setLoadingAvailability] = useState<Record<string, boolean>>({})
  
  // State for ticket quota
  const [ticketQuota, setTicketQuota] = useState<Record<string, TicketQuota>>({})
  const [loadingQuota, setLoadingQuota] = useState<Record<string, boolean>>({})
  const [quotaWarning, setQuotaWarning] = useState<string>('')
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [pendingTicketName, setPendingTicketName] = useState<string>('')

  // Tìm lịch gần nhất sắp tới
  const getUpcomingSchedules = () => {
    const now = new Date()
    return event.schedules
      .filter(schedule => new Date(schedule.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }

  // Lấy tất cả lịch theo thứ tự thời gian (sớm nhất đến muộn nhất)
  const getAllSchedules = () => {
    return event.schedules.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }

  // Kiểm tra lịch đã qua
  const isScheduleExpired = (schedule: TransformedEventSchedule) => {
    const now = new Date()
    return new Date(schedule.startTime) < now
  }

  // Kiểm tra xem có thể mua full schedule không (chỉ khi lịch đầu tiên chưa bắt đầu)
  const canBuyFullSchedule = () => {
    const allSchedules = getAllSchedules()
    if (allSchedules.length === 0) return false
    
    const firstSchedule = allSchedules[0]
    const now = new Date()
    return new Date(firstSchedule.startTime) > now
  }

  // Lấy lịch đầu tiên
  const getFirstSchedule = () => {
    const allSchedules = getAllSchedules()
    return allSchedules.length > 0 ? allSchedules[0] : null
  }

  // Khởi tạo selectedRecurringTickets với ticket đầu tiên của mỗi schedule
  const initializeRecurringTickets = () => {
    const allSchedules = getAllSchedules()
    const nonExpiredSchedules = allSchedules.filter(schedule => !isScheduleExpired(schedule))
    const initialTickets: SelectedRecurringTicket[] = nonExpiredSchedules.map(schedule => {
      const firstTicket = schedule.ticketTypes[0]
      return {
        scheduleId: schedule.id,
        ticketTypeId: firstTicket?.id || '',
        scheduleName: `${formatDate(schedule.startTime)} - ${formatScheduleTime(schedule.startTime, schedule.endTime)}`,
        ticketName: firstTicket?.name || 'No tickets available',
        price: firstTicket?.price || 0
      }
    })
    setSelectedRecurringTickets(initialTickets)
  }

  // Khởi tạo lịch được chọn là lịch gần nhất
  useEffect(() => {
    const upcomingSchedules = getUpcomingSchedules()
    if (upcomingSchedules.length > 0) {
      setSelectedSchedule(upcomingSchedules[0])
    } else if (event.schedules.length > 0) {
      // Nếu không có lịch sắp tới, chọn lịch gần nhất (có thể đã qua)
      const allSchedules = getAllSchedules()
      setSelectedSchedule(allSchedules[allSchedules.length - 1])
    }
  }, [event])

  // Fetch ticket availability and quota when schedule changes
  useEffect(() => {
    if (selectedSchedule && !isScheduleExpired(selectedSchedule)) {
      fetchAllTicketAvailability()
      fetchAllTicketQuota()
    }
  }, [selectedSchedule])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: event.currency,
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatScheduleTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const startTimeStr = start.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    const endTimeStr = end.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    return `${startTimeStr} - ${endTimeStr}`
  }

  const getAvailabilityColor = () => {
    const percentage = (event.capacity.available / event.capacity.total) * 100
    if (percentage <= 20) return 'text-red-600'
    if (percentage <= 50) return 'text-orange-600'
    return 'text-green-600'
  }

  // Mock reviews data
  const mockReviews = [
    {
      id: 1,
      user: {
        name: "Sarah Johnson",
        avatar: "/avatars/sarah.jpg"
      },
      rating: 5,
      date: "2024-01-15",
      comment: "Amazing workshop! The instructor was very knowledgeable and the content was exactly what I needed."
    },
    {
      id: 2,
      user: {
        name: "Mike Chen",
        avatar: "/avatars/mike.jpg"
      },
      rating: 4,
      date: "2024-01-10",
      comment: "Great experience overall. Would definitely recommend to others interested in this field."
    },
    {
      id: 3,
      user: {
        name: "Emily Davis",
        avatar: "/avatars/emily.jpg"
      },
      rating: 5,
      date: "2024-01-08",
      comment: "The workshop exceeded my expectations. Very practical and hands-on approach."
    }
  ]

  const handleTicketSelect = async (ticketId: string) => {
    if (!selectedSchedule) return
    
    // Clear any previous warnings
    setQuotaWarning('')
    
    const ticket = selectedSchedule.ticketTypes.find(t => t.id === ticketId)
    const availability = ticketAvailability[ticketId]
    
    if (ticket) {
      // Fetch quota data if not already loaded
      if (!ticketQuota[ticketId]) {
        await fetchTicketQuota(ticketId)
      }
      
      // Check quota restrictions
      const quotaCheck = checkQuotaRestrictions(ticketId)
      
      if (quotaCheck.showPopup) {
        // Show detailed popup for pending requests
        setPendingTicketName(ticket.name)
        setShowPendingModal(true)
        return
      }
      
      if (!quotaCheck.canSelect) {
        return
      }
      
      // Use API availability data if available, otherwise fall back to event data
      const availableQuantity = availability ? availability.remaining : ticket.totalQuantity
      const quota = ticketQuota[ticketId]
      
      // Determine max quantity considering both availability and quota
      let maxQuantity = availableQuantity
      if (quota && quota.remainingForUser < availableQuantity) {
        maxQuantity = quota.remainingForUser
      }
      
      if (maxQuantity > 0) {
        setSelectedTicket({
          id: ticket.id,
          name: ticket.name,
          price: ticket.price,
          quantity: 1,
          maxQuantity: maxQuantity
        })
      }
    }
  }

  const handleTicketQuantityChange = (quantity: number) => {
    if (selectedTicket) {
      // Clear previous warning
      setQuotaWarning('')
      
      let newQuantity = quantity
      
      // Validate against quota first
      const quotaValidation = validateQuantityAgainstQuota(selectedTicket.id, quantity)
      
      if (!quotaValidation.isValid) {
        setQuotaWarning(quotaValidation.message)
        newQuantity = quotaValidation.maxAllowed
      } else {
        // Validate quantity against availability
        if (newQuantity <= 0) {
          newQuantity = 1
        } else if (newQuantity > selectedTicket.maxQuantity) {
          newQuantity = selectedTicket.maxQuantity
        }
      }
      
      setSelectedTicket({
        ...selectedTicket,
        quantity: newQuantity
      })
    }
  }

  const handleTicketQuantityInput = (value: string) => {
    if (selectedTicket) {
      const quantity = parseInt(value) || 0
      handleTicketQuantityChange(quantity)
    }
  }

  const handleScheduleChange = (scheduleId: string) => {
    const schedule = event.schedules.find(s => s.id === scheduleId)
    if (schedule) {
      // Kiểm tra nếu lịch đã qua
      if (isScheduleExpired(schedule)) {
        Notify.warning('This schedule has already expired and cannot be selected.')
        return
      }
      
      setSelectedSchedule(schedule)
      // Reset selected ticket when changing schedule
      setSelectedTicket(null)
      setSelectedAddOns([])
    }
  }

  const handleAddOnToggle = (addonId: string, checked: boolean) => {
    const addon = event.addOns.find(a => a.id === addonId)
    if (!addon) return

    if (checked) {
      setSelectedAddOns(prev => [...prev, {
        id: addon.id,
        name: addon.name,
        price: addon.price,
        quantity: 1,
        maxQuantity: 999 // Default to high number since addons don't have quantity limits
      }])
    } else {
      setSelectedAddOns(prev => prev.filter(a => a.id !== addonId))
    }
  }

  const handleAddOnQuantityChange = (addonId: string, quantity: number) => {
    setSelectedAddOns(prev => prev.map(addon => {
      if (addon.id === addonId) {
        let newQuantity = quantity
        
        // Validate quantity
        if (newQuantity <= 0) {
          newQuantity = 1
        } else if (newQuantity > addon.maxQuantity) {
          newQuantity = addon.maxQuantity
        }
        
        return { ...addon, quantity: newQuantity }
      }
      return addon
    }))
  }

  const handleAddOnQuantityInput = (addonId: string, value: string) => {
    const quantity = parseInt(value) || 0
    let newQuantity = quantity
    
    // Validate quantity
    if (newQuantity <= 0) {
      newQuantity = 1
    } else if (newQuantity > 999) { // Max for addons
      newQuantity = 999
    }
    
    handleAddOnQuantityChange(addonId, newQuantity)
  }

  const calculateTotalPrice = () => {
    const ticketPrice = selectedTicket ? selectedTicket.price * selectedTicket.quantity : 0
    const addOnsPrice = selectedAddOns.reduce((total, addon) => total + (addon.price * addon.quantity), 0)
    return ticketPrice + addOnsPrice
  }

  // Function to fetch ticket availability
  const fetchTicketAvailability = async (ticketTypeId: string) => {
    try {
      setLoadingAvailability(prev => ({ ...prev, [ticketTypeId]: true }))
      
      const response = await api.get(`/api/bookings/tickets/${ticketTypeId}/availability`)
      
      if (response.status === 200) {
        const availabilityData: TicketAvailability = response.data
        setTicketAvailability(prev => ({
          ...prev,
          [ticketTypeId]: availabilityData
        }))
      }
    } catch (error: any) {
      console.error('Error fetching ticket availability:', error)
      // Don't show error notification for availability fetch failures
      // as this is non-critical functionality
    } finally {
      setLoadingAvailability(prev => ({ ...prev, [ticketTypeId]: false }))
    }
  }

  // Function to fetch availability for all tickets in current schedule
  const fetchAllTicketAvailability = async () => {
    if (!selectedSchedule) return
    
    const promises = selectedSchedule.ticketTypes.map(ticket => 
      fetchTicketAvailability(ticket.id)
    )
    
    await Promise.all(promises)
  }

  // Function to fetch ticket quota for a specific ticket
  const fetchTicketQuota = async (ticketTypeId: string) => {
    try {
      setLoadingQuota(prev => ({ ...prev, [ticketTypeId]: true }))
      
      const response = await api.get(`/api/user/event/quota/${ticketTypeId}`)
      
      if (response.status === 200) {
        const quotaData: TicketQuota = response.data
        setTicketQuota(prev => ({
          ...prev,
          [ticketTypeId]: quotaData
        }))
        return quotaData
      }
    } catch (error: any) {
      console.error('Error fetching ticket quota:', error)
      // Don't show error notification for quota fetch failures
      // as this is non-critical functionality
    } finally {
      setLoadingQuota(prev => ({ ...prev, [ticketTypeId]: false }))
    }
    return null
  }

  // Function to fetch quota for all tickets in current schedule
  const fetchAllTicketQuota = async () => {
    if (!selectedSchedule) return
    
    const promises = selectedSchedule.ticketTypes.map(ticket => 
      fetchTicketQuota(ticket.id)
    )
    
    await Promise.all(promises)
  }

  // Calculate total available spots from ticket availability API
  const calculateAvailableSpots = () => {
    if (!selectedSchedule) return { available: 0, total: 0 }
    
    let totalAvailable = 0
    let totalCapacity = 0
    
    selectedSchedule.ticketTypes.forEach(ticket => {
      const availability = ticketAvailability[ticket.id]
      if (availability) {
        totalAvailable += availability.remaining
        totalCapacity += availability.totalQuantity
      } else {
        // Fallback to event data if availability not loaded
        totalAvailable += ticket.totalQuantity
        totalCapacity += ticket.totalQuantity
      }
    })
    
    return { available: totalAvailable, total: totalCapacity }
  }

  // Quota validation functions
  const checkQuotaRestrictions = (ticketTypeId: string) => {
    const quota = ticketQuota[ticketTypeId]
    if (!quota) return { canSelect: true, message: '', canSelectWithWarning: true }

    // Check if user has reached max limit
    if (quota.confirmedByUser >= quota.maxPerUser) {
      return { 
        canSelect: false, 
        canSelectWithWarning: false,
        message: 'You have reached the maximum limit for this ticket' 
      }
    }

    // Check if user has pending purchases - allow selection but show warning
    if (quota.pendingByUser > 0) {
      return { 
        canSelect: true,
        canSelectWithWarning: true,
        message: 'You have pending requests for this ticket',
        showPopup: true 
      }
    }

    return { canSelect: true, canSelectWithWarning: true, message: '' }
  }

  const validateQuantityAgainstQuota = (ticketTypeId: string, requestedQuantity: number) => {
    const quota = ticketQuota[ticketTypeId]
    if (!quota) return { isValid: true, message: '', maxAllowed: 999 }

    const maxAllowed = quota.remainingForUser
    
    if (requestedQuantity > maxAllowed) {
      const message = maxAllowed === 1 
        ? 'You can only purchase 1 more ticket'
        : `You can only purchase ${maxAllowed} more tickets`
      
      return { 
        isValid: false, 
        message: message,
        maxAllowed: maxAllowed 
      }
    }

    return { isValid: true, message: '', maxAllowed: maxAllowed }
  }

  const handleRegisterNow = async () => {
    if (!selectedSchedule) {
      Notify.failure('Please select a schedule first')
      return
    }

    if (isScheduleExpired(selectedSchedule)) {
      Notify.failure('Cannot book an expired schedule')
      return
    }

    if (!selectedTicket) {
      Notify.failure('Please select a ticket first')
      return
    }

    setIsBooking(true)

    try {
      const bookingRequest: BookingRequest = {
        eventId: event.id,
        scheduleId: selectedSchedule.id,
        ticketTypeId: selectedTicket.id,
        quantity: selectedTicket.quantity,
        addOns: selectedAddOns.map(addon => ({
          addOnId: addon.id,
          quantity: addon.quantity
        }))
      }

      const response = await api.post('/api/user/event', bookingRequest)
      
      if (response.status === 200 || response.status === 201) {
        const responseData = response.data
        
        if (responseData.success && responseData.data?.id) {
          // Show payment summary modal with the purchase ID
          setBookingPurchaseId(responseData.data.id)
          setShowPaymentSummary(true)
          
          // Refresh ticket availability to reflect updated remaining tickets
          if (selectedTicket) {
            fetchTicketAvailability(selectedTicket.id)
          }
          
          // Clear selected items
          setSelectedTicket(null)
          setSelectedAddOns([])
        } else {
          Notify.failure('Booking failed. Please try again.')
        }
      }
    } catch (error: any) {
      console.error('Booking error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to book event. Please try again.'
      Notify.failure(errorMessage)
    } finally {
      setIsBooking(false)
    }
  }

  // Handler for opening recurring booking modal
  const handleOpenRecurringModal = () => {
    if (!canBuyFullSchedule()) {
      Notify.warning('Full schedule booking is only available before the first schedule starts.')
      return
    }
    initializeRecurringTickets()
    setShowRecurringModal(true)
  }

  // Handler for closing recurring booking modal
  const handleCloseRecurringModal = () => {
    setShowRecurringModal(false)
    setSelectedRecurringTickets([])
    setSelectedAddOns([])
  }

  // Handler for changing ticket type in recurring booking
  const handleRecurringTicketChange = (scheduleId: string, ticketTypeId: string) => {
    const schedule = event.schedules.find(s => s.id === scheduleId)
    const ticket = schedule?.ticketTypes.find(t => t.id === ticketTypeId)
    
    if (schedule && ticket) {
      setSelectedRecurringTickets(prev => prev.map(item => {
        if (item.scheduleId === scheduleId) {
          return {
            ...item,
            ticketTypeId: ticket.id,
            ticketName: ticket.name,
            price: ticket.price
          }
        }
        return item
      }))
    }
  }

  // Handler for booking full schedule
  const handleBookFullSchedule = async () => {
    const nonExpiredSchedules = getAllSchedules().filter(schedule => !isScheduleExpired(schedule))
    
    if (selectedRecurringTickets.length === 0 || selectedRecurringTickets.length < nonExpiredSchedules.length) {
      Notify.failure('Please select tickets for all schedules')
      return
    }

    // Validate that all non-expired schedules have tickets selected
    const missingSchedules = nonExpiredSchedules.filter(schedule => 
      !selectedRecurringTickets.some(ticket => ticket.scheduleId === schedule.id)
    )

    if (missingSchedules.length > 0) {
      Notify.failure('Please select tickets for all schedules')
      return
    }

    setIsRecurringBooking(true)

    try {
      const recurringBookingRequest: RecurringBookingRequest = {
        eventId: event.id,
        tickets: selectedRecurringTickets.map(ticket => ({
          scheduleId: ticket.scheduleId,
          ticketTypeId: ticket.ticketTypeId
        })),
        quantity: 1, // Hardcoded to 1 as per requirement
        addOns: selectedAddOns.length > 0 ? selectedAddOns.map(addon => ({
          addOnId: addon.id,
          quantity: addon.quantity
        })) : []
      }

      console.log('Recurring booking request:', recurringBookingRequest) // Debug log

      const response = await api.post('/api/user/event/recurring', recurringBookingRequest)
      
      if (response.status === 200 || response.status === 201) {
        const responseData = response.data
        
        if (responseData.success && responseData.data?.id) {
          // Show payment summary modal with the purchase ID
          setBookingPurchaseId(responseData.data.id)
          setShowPaymentSummary(true)
          
          // Refresh availability for all selected tickets
          selectedRecurringTickets.forEach(ticket => {
            fetchTicketAvailability(ticket.ticketTypeId)
          })
          
          handleCloseRecurringModal()
        } else {
          Notify.failure('Booking failed. Please try again.')
        }
      }
    } catch (error: any) {
      console.error('Recurring booking error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to book full schedule. Please try again.'
      Notify.failure(errorMessage)
    } finally {
      setIsRecurringBooking(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      {/* Breadcrumb */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2" onClick={onBackClick}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600 ml-2">{event.category.name}</span>
        <span className="text-gray-400 ml-2">/</span>
        <span className="text-gray-900 ml-2">{event.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Event Images */}
          <div className="mb-8">
            <div className="relative">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-96 object-cover rounded-lg"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                {event.featured && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    Featured
                  </Badge>
                )}
                {event.earlyBirdDiscount && (
                  <Badge className="bg-red-500 text-white border-0">
                    -{event.earlyBirdDiscount.percentage}%
                  </Badge>
                )}
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-white/80 hover:bg-white"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-white/80 hover:bg-white"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Event Info */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {event.category.name}
                </Badge>
                <Badge variant="outline">
                  {event.level.name}
                </Badge>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
         
            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="font-medium">
                    {selectedSchedule ? formatDate(selectedSchedule.startTime) : 'Schedule TBD'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedSchedule ? formatScheduleTime(selectedSchedule.startTime, selectedSchedule.endTime) : 'Time to be announced'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="font-medium">{event.duration}</p>
                  <p className="text-sm text-gray-500">Duration</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="font-medium">{event.location}</p>
                  <p className="text-sm text-gray-500">{event.address}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  {(() => {
                    const spots = calculateAvailableSpots()
                    const percentage = spots.total > 0 ? (spots.available / spots.total) * 100 : 0
                    const spotColor = percentage <= 20 ? 'text-red-600' : percentage <= 50 ? 'text-orange-600' : 'text-green-600'
                    
                    return (
                      <>
                        <p className="font-medium">{spots.available}/{spots.total} spots</p>
                        <p className={`text-sm ${spotColor}`}>
                          {spots.available} spots available
                        </p>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader className="border-b bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Event Overview</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Everything you need to know</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Event Description */}
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">About This Event</h4>
                      <p className="text-gray-700 leading-relaxed">{event.description}</p>
                    </div>

                    {/* What you'll learn
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-3">What You'll Learn</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-700">{event.description}</span>
                        </div>
                      </div>
                    </div> */}

                    {/* Requirements */}
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">Age: {event.requirements.age}</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">Level: {event.requirements.level}</span>
                        </div>
                        {event.requirements.equipment && event.requirements.equipment.map((item, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* What's included */}
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-3">What's Included</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {event.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0" />
                            <span className="text-gray-700">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Event Highlights */}
                    <div className="border-l-4 border-indigo-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Event Highlights</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-900">Small Group</p>
                          <p className="text-xs text-gray-600">Personal attention</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-900">Certificate</p>
                          <p className="text-xs text-gray-600">Upon completion</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Clock className="h-4 w-4 text-purple-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-900">Flexible</p>
                          <p className="text-xs text-gray-600">Duration options</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getAllSchedules().map((schedule, index) => {
                      const isExpired = isScheduleExpired(schedule)
                      return (
                        <div key={schedule.id} className={`flex items-start space-x-4 p-4 border rounded-lg ${
                          isExpired ? 'opacity-50 bg-gray-50' : ''
                        }`}>
                          <div className="flex-shrink-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              isExpired ? 'bg-gray-200' : selectedSchedule?.id === schedule.id ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <span className={`font-semibold ${
                                isExpired ? 'text-gray-400' : selectedSchedule?.id === schedule.id ? 'text-blue-600' : 'text-gray-600'
                              }`}>{index + 1}</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{schedule.activity}</h4>
                            <p className="text-gray-600">{schedule.description}</p>
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(schedule.startTime)}
                            </div>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatScheduleTime(schedule.startTime, schedule.endTime)} • {schedule.duration} minutes
                            </div>
                          </div>
                          {isExpired ? (
                            <Badge variant="destructive" className="bg-red-100 text-red-800">
                              Expired
                            </Badge>
                          ) : selectedSchedule?.id === schedule.id ? (
                            <Badge className="bg-blue-100 text-blue-800">
                              Selected
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleScheduleChange(schedule.id)}
                              disabled={isExpired}
                            >
                              Select
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructor" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={event.instructor.avatar} />
                      <AvatarFallback>{event.instructor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{event.instructor.name}</h3>
                      <p className="text-gray-600 mb-3">{event.instructor.bio}</p>
                      <div>
                        <h4 className="font-semibold mb-2">Expertise</h4>
                        <div className="flex flex-wrap gap-2">
                          {event.instructor.expertise.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feedback" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reviews & Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {mockReviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.user.avatar} />
                            <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{review.user.name}</h4>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600 mb-2">{review.comment}</p>
                            <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString('en-US')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            {/* Schedule Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Select Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedSchedule?.id || ''} 
                  onValueChange={handleScheduleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllSchedules().map((schedule) => {
                      const isExpired = isScheduleExpired(schedule)
                      return (
                        <SelectItem 
                          key={schedule.id} 
                          value={schedule.id}
                          disabled={isExpired}
                          className={isExpired ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {formatDate(schedule.startTime)}
                              </span>
                              {isExpired && (
                                <Badge variant="destructive" className="text-xs">
                                  Expired
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatScheduleTime(schedule.startTime, schedule.endTime)}
                            </span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                
                {selectedSchedule && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    isScheduleExpired(selectedSchedule) ? 'bg-red-50' : 'bg-blue-50'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <Calendar className={`h-4 w-4 ${
                        isScheduleExpired(selectedSchedule) ? 'text-red-600' : 'text-blue-600'
                      }`} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className={`font-medium ${
                            isScheduleExpired(selectedSchedule) ? 'text-red-900' : 'text-blue-900'
                          }`}>
                            {formatDate(selectedSchedule.startTime)}
                          </p>
                          {isScheduleExpired(selectedSchedule) && (
                            <Badge variant="destructive" className="text-xs">
                              Expired
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm ${
                          isScheduleExpired(selectedSchedule) ? 'text-red-700' : 'text-blue-700'
                        }`}>
                          {formatScheduleTime(selectedSchedule.startTime, selectedSchedule.endTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Buy Full Schedule Button */}
            <Card className={`mb-6 ${!canBuyFullSchedule() ? 'opacity-50' : ''}`}>
              <CardHeader>
                <CardTitle>Buy Full Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {canBuyFullSchedule() ? (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">Available for Full Schedule Booking</p>
                          <p className="text-sm text-green-700">
                            Book all schedules at once (quantity: 1 per schedule)
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-700">Full Schedule Booking Unavailable</p>
                          <p className="text-sm text-gray-600">
                            Only available when the first schedule hasn't started yet
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <Button 
                    className={`w-full ${
                      canBuyFullSchedule() 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' 
                        : 'bg-gray-300 text-gray-500 hover:bg-gray-300 cursor-not-allowed'
                    }`}
                    onClick={canBuyFullSchedule() ? handleOpenRecurringModal : undefined}
                    disabled={!canBuyFullSchedule()}
                  >
                    <Calendar className={`mr-2 h-4 w-4 ${!canBuyFullSchedule() ? 'text-gray-400' : ''}`} />
                    Buy Full Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ticket Selection */}
            {selectedSchedule && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Select Your Ticket</CardTitle>
                </CardHeader>
                <CardContent>
                  {isScheduleExpired(selectedSchedule) ? (
                    <div className="text-center text-red-500 py-4">
                      <p>This schedule has expired and tickets are no longer available</p>
                    </div>
                  ) : selectedSchedule.ticketTypes.length > 0 ? (
                    <>
                      <RadioGroup value={selectedTicket?.id || ''} onValueChange={handleTicketSelect}>
                        <div className="space-y-3">
                          {selectedSchedule.ticketTypes.map((ticket) => {
                            const availability = ticketAvailability[ticket.id]
                            const quota = ticketQuota[ticket.id]
                            const isLoadingThisTicket = loadingAvailability[ticket.id] || loadingQuota[ticket.id]
                            
                            // Use API data if available, otherwise fall back to event data
                            const remaining = availability ? availability.remaining : ticket.totalQuantity
                            const totalQuantity = availability ? availability.totalQuantity : ticket.totalQuantity
                            
                            // Check quota restrictions
                            const quotaCheck = checkQuotaRestrictions(ticket.id)
                            const isSoldOut = remaining <= 0 || !quotaCheck.canSelectWithWarning
                            
                            return (
                              <div key={ticket.id} className={`flex items-center space-x-3 p-3 border rounded-lg transition-all ${isSoldOut ? 'opacity-50 bg-gray-50' : 'hover:shadow-sm'}`}>
                                <RadioGroupItem 
                                  value={ticket.id} 
                                  id={ticket.id} 
                                  disabled={isSoldOut || isLoadingThisTicket}
                                />
                                <div className="flex-1">
                                  <Label 
                                    htmlFor={ticket.id} 
                                    className={`font-medium ${isSoldOut ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer'}`}
                                  >
                                    {ticket.name}
                                  </Label>
                                  
                                  {isLoadingThisTicket ? (
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      <span className="text-xs text-gray-500">Loading...</span>
                                    </div>
                                  ) : (
                                    <div className="space-y-1 mt-1">
                                      <p className={`text-sm ${remaining > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        <span className="font-medium">{remaining}/{totalQuantity}</span>
                                      </p>
                                      
                                      {/* Quota restriction message for max reached */}
                                      {!quotaCheck.canSelectWithWarning && (
                                        <p className="text-xs text-red-500 font-medium">
                                          🚫 {quotaCheck.message}
                                        </p>
                                      )}
                                      
                                      {/* Pending request warning */}
                                      {quotaCheck.showPopup && (
                                        <p className="text-xs text-orange-600 font-medium">
                                          ⚠️ You have pending requests
                                        </p>
                                      )}
                                      
                                      {/* Quota info for valid tickets */}
                                      {quotaCheck.canSelectWithWarning && quota && !quotaCheck.showPopup && (
                                        <p className="text-xs text-blue-600">
                                          Max per user: {quota.remainingForUser}/{quota.maxPerUser}
                                        </p>
                                      )}
                                      
                                      {remaining > 0 && remaining <= 5 && quotaCheck.canSelectWithWarning && (
                                        <p className="text-xs text-orange-600 font-medium">
                                          ⚠️ Only {remaining} tickets left!
                                        </p>
                                      )}
                                      
                                      {remaining <= 0 && (
                                        <p className="text-sm text-red-500 font-medium">🚫 Sold out</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-blue-600">{formatPrice(ticket.price)}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </RadioGroup>

                      {/* Quantity selector for selected ticket */}
                      {selectedTicket && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{selectedTicket.name}</span>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTicketQuantityChange(selectedTicket.quantity - 1)}
                                disabled={selectedTicket.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                value={selectedTicket.quantity}
                                onChange={(e) => handleTicketQuantityInput(e.target.value)}
                                className="w-12 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                min="1"
                                max={selectedTicket.maxQuantity}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTicketQuantityChange(selectedTicket.quantity + 1)}
                                disabled={selectedTicket.quantity >= selectedTicket.maxQuantity}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Quota warning display */}
                          {quotaWarning && (
                            <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                              ⚠️ {quotaWarning}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      <p>No tickets available for this schedule</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Add-ons Selection */}
            {event.addOns.length > 0 && selectedSchedule && !isScheduleExpired(selectedSchedule) && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Add-ons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {event.addOns.map((addon) => {
                      const isSelected = selectedAddOns.some(a => a.id === addon.id)
                      const selectedAddon = selectedAddOns.find(a => a.id === addon.id)
                      
                      return (
                        <div key={addon.id} className="border rounded-lg p-4">
                          <div className="flex items-start space-x-3 mb-3">
                            <Checkbox 
                              id={`addon-${addon.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => handleAddOnToggle(addon.id, checked as boolean)}
                            />
                            <div className="flex-1">
                              <Label htmlFor={`addon-${addon.id}`} className="font-medium cursor-pointer">
                                {addon.name}
                              </Label>
                              <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-blue-600">{formatPrice(addon.price)}</p>
                            </div>
                          </div>
                          
                          {isSelected && selectedAddon && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAddOnQuantityChange(addon.id, selectedAddon.quantity - 1)}
                                    disabled={selectedAddon.quantity <= 1}
                                    className="w-8 h-8 p-0"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <Input
                                    type="number"
                                    value={selectedAddon.quantity}
                                    onChange={(e) => handleAddOnQuantityInput(addon.id, e.target.value)}
                                    className="w-16 text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    min="1"
                                    max={selectedAddon.maxQuantity}
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAddOnQuantityChange(addon.id, selectedAddon.quantity + 1)}
                                    disabled={selectedAddon.quantity >= selectedAddon.maxQuantity}
                                    className="w-8 h-8 p-0"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Booking Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Book This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Selected Schedule */}
                  {selectedSchedule && (
                    <div className={`p-3 rounded-lg ${
                      isScheduleExpired(selectedSchedule) ? 'bg-red-50' : 'bg-purple-50'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <Calendar className={`h-4 w-4 ${
                          isScheduleExpired(selectedSchedule) ? 'text-red-600' : 'text-purple-600'
                        }`} />
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className={`font-medium ${
                              isScheduleExpired(selectedSchedule) ? 'text-red-900' : 'text-purple-900'
                            }`}>Selected Schedule</p>
                            {isScheduleExpired(selectedSchedule) && (
                              <Badge variant="destructive" className="text-xs">
                                Expired
                              </Badge>
                            )}
                          </div>
                          <p className={`text-sm ${
                            isScheduleExpired(selectedSchedule) ? 'text-red-700' : 'text-purple-700'
                          }`}>
                            {formatDate(selectedSchedule.startTime)} • {formatScheduleTime(selectedSchedule.startTime, selectedSchedule.endTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selected Items Summary */}
                  {selectedTicket && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{selectedTicket.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {selectedTicket.quantity}</p>
                        </div>
                        <p className="font-semibold">{formatPrice(selectedTicket.price * selectedTicket.quantity)}</p>
                      </div>
                    </div>
                  )}

                  {selectedAddOns.map((addon) => (
                    <div key={addon.id} className="p-3 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{addon.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {addon.quantity}</p>
                        </div>
                        <p className="font-semibold">{formatPrice(addon.price * addon.quantity)}</p>
                      </div>
                    </div>
                  ))}

                  {!selectedSchedule && (
                    <div className="text-center text-gray-500 py-4">
                      <p>Please select a schedule to continue</p>
                    </div>
                  )}

                  {selectedSchedule && isScheduleExpired(selectedSchedule) && (
                    <div className="text-center text-red-500 py-4">
                      <p>This schedule has expired and cannot be booked</p>
                    </div>
                  )}

                  {selectedSchedule && !isScheduleExpired(selectedSchedule) && !selectedTicket && selectedAddOns.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      <p>Please select a ticket to continue</p>
                    </div>
                  )}

                  {/* Total Price */}
                  {selectedTicket && selectedSchedule && !isScheduleExpired(selectedSchedule) && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatPrice(calculateTotalPrice())}
                        </span>
                      </div>
                    </>
                  )}

                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    disabled={!selectedSchedule || (selectedSchedule && isScheduleExpired(selectedSchedule)) || !selectedTicket || isBooking}
                    onClick={handleRegisterNow}
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      'Register Now'
                    )}
                  </Button>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Available spots</span>
                    {(() => {
                      const spots = calculateAvailableSpots()
                      const percentage = spots.total > 0 ? (spots.available / spots.total) * 100 : 0
                      const spotColor = percentage <= 20 ? 'text-red-600' : percentage <= 50 ? 'text-orange-600' : 'text-green-600'
                      
                      return (
                        <span className={`font-medium ${spotColor}`}>
                          {spots.available} left
                        </span>
                      )
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            {event.locations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {event.locations.map((location) => (
                      <div key={location.id} className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                        <div>
                          <p className="font-medium">{location.name}</p>
                          <p className="text-sm text-gray-600">{location.address}</p>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Map
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Recurring Booking Modal */}
      <Dialog open={showRecurringModal} onOpenChange={setShowRecurringModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buy Full Schedule</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Full Schedule Booking</p>
                  <p className="text-sm text-blue-700">
                    Select ticket types for each schedule. Quantity will be set to 1 for all tickets.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {getAllSchedules().filter(schedule => !isScheduleExpired(schedule)).map((schedule, index) => {
                const selectedTicket = selectedRecurringTickets.find(t => t.scheduleId === schedule.id)
                return (
                  <Card key={schedule.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Schedule {index + 1}: {formatDate(schedule.startTime)}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {formatScheduleTime(schedule.startTime, schedule.endTime)}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Select Ticket Type:</Label>
                        <RadioGroup 
                          value={selectedTicket?.ticketTypeId || ''} 
                          onValueChange={(value) => handleRecurringTicketChange(schedule.id, value)}
                        >
                          <div className="space-y-2">
                            {schedule.ticketTypes.map((ticket) => {
                              const availability = ticketAvailability[ticket.id]
                              const isLoadingThisTicket = loadingAvailability[ticket.id]
                              
                              // Use API data if available, otherwise fall back to event data
                              const remaining = availability ? availability.remaining : ticket.totalQuantity
                              const totalQuantity = availability ? availability.totalQuantity : ticket.totalQuantity
                              const sold = availability ? availability.sold : 0
                              
                              const isSoldOut = remaining <= 0
                              
                              return (
                                <div key={ticket.id} className={`flex items-center space-x-3 p-3 border rounded-lg transition-all ${isSoldOut ? 'opacity-50 bg-gray-50' : 'hover:shadow-sm'}`}>
                                  <RadioGroupItem 
                                    value={ticket.id} 
                                    id={`recurring-${schedule.id}-${ticket.id}`} 
                                    disabled={isSoldOut || isLoadingThisTicket}
                                  />
                                  <div className="flex-1">
                                    <Label 
                                      htmlFor={`recurring-${schedule.id}-${ticket.id}`} 
                                      className={`font-medium ${isSoldOut ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer'}`}
                                    >
                                      {ticket.name}
                                    </Label>
                                    
                                    {isLoadingThisTicket ? (
                                      <div className="flex items-center space-x-2 mt-1">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        <span className="text-xs text-gray-500">Loading...</span>
                                      </div>
                                    ) : (
                                      <div className="space-y-1 mt-1">
                                        <p className={`text-sm ${remaining > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                          <span className="font-medium">{remaining}/{totalQuantity}</span>
                                        </p>
                                        
                                        {remaining > 0 && remaining <= 5 && (
                                          <p className="text-xs text-orange-600 font-medium">
                                            ⚠️ Only {remaining} left!
                                          </p>
                                        )}
                                        
                                        {isSoldOut && (
                                          <p className="text-sm text-red-500 font-medium">🚫 Sold out</p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-blue-600">{formatPrice(ticket.price)}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </RadioGroup>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Add-ons Selection */}
            {event.addOns.length > 0 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Add-ons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {event.addOns.map((addon) => {
                        const isSelected = selectedAddOns.some(a => a.id === addon.id)
                        const selectedAddon = selectedAddOns.find(a => a.id === addon.id)
                        
                        return (
                          <div key={addon.id} className="border rounded-lg p-4">
                            <div className="flex items-start space-x-3 mb-3">
                              <Checkbox 
                                id={`recurring-addon-${addon.id}`}
                                checked={isSelected}
                                onCheckedChange={(checked) => handleAddOnToggle(addon.id, checked as boolean)}
                              />
                              <div className="flex-1">
                                <Label htmlFor={`recurring-addon-${addon.id}`} className="font-medium cursor-pointer">
                                  {addon.name}
                                </Label>
                                <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-blue-600">{formatPrice(addon.price)}</p>
                              </div>
                            </div>
                            
                            {isSelected && selectedAddon && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleAddOnQuantityChange(addon.id, selectedAddon.quantity - 1)}
                                      disabled={selectedAddon.quantity <= 1}
                                      className="w-8 h-8 p-0"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <Input
                                      type="number"
                                      value={selectedAddon.quantity}
                                      onChange={(e) => handleAddOnQuantityInput(addon.id, e.target.value)}
                                      className="w-16 text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      min="1"
                                      max={selectedAddon.maxQuantity}
                                    />
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleAddOnQuantityChange(addon.id, selectedAddon.quantity + 1)}
                                      disabled={selectedAddon.quantity >= selectedAddon.maxQuantity}
                                      className="w-8 h-8 p-0"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Total Price */}
            {selectedRecurringTickets.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Price:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(
                      selectedRecurringTickets.reduce((total, ticket) => total + ticket.price, 0) +
                      selectedAddOns.reduce((total, addon) => total + (addon.price * addon.quantity), 0)
                    )}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Quantity: 1 ticket per schedule ({selectedRecurringTickets.length} schedules)
                  {selectedAddOns.length > 0 && (
                    <span> • {selectedAddOns.length} add-on(s) selected</span>
                  )}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseRecurringModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleBookFullSchedule}
              disabled={selectedRecurringTickets.length === 0 || selectedRecurringTickets.length < getAllSchedules().filter(schedule => !isScheduleExpired(schedule)).length || isRecurringBooking}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {isRecurringBooking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                'Book Full Schedule'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pending Request Modal */}
      <Dialog open={showPendingModal} onOpenChange={setShowPendingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pending Request Found</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-900 mb-2">
                    You have pending requests for "{pendingTicketName}"
                  </h4>
                  <p className="text-sm text-orange-800 mb-3">
                    Please visit My Bookings to cancel or complete your pending request to continue purchasing.
                  </p>
                  <Button 
                    size="sm"
                    onClick={() => {
                      setShowPendingModal(false)
                      router.push('/my-bookings')
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Go to My Bookings
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowPendingModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Summary Modal */}
      <PaymentSummaryModal
        isOpen={showPaymentSummary}
        onClose={() => setShowPaymentSummary(false)}
        purchaseId={bookingPurchaseId}
      />
    </div>
  )
} 