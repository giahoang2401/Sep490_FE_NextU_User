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
import { parseNotes, parseAgenda, parseInstructor } from '@/utils/safeParse'
import RequirementsChips from './RequirementsChips'
import AgendaTimeline from './AgendaTimeline'
import InstructorCard from './InstructorCard'

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
  console.log('EventDetail component - event data:', {
    eventId: event.id,
    title: event.title,
    schedules: event.schedules.map(s => ({
      id: s.id,
      startTime: s.startTime,
      ticketTypes: s.ticketTypes.map(t => ({
        id: t.id,
        name: t.name,
        price: t.price,
        discountRateEarlyBird: t.discountRateEarlyBird,
        discountRateCombo: t.discountRateCombo
      }))
    }))
  })

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
  
  // State for early bird countdown
  const [timeUntilEarlyBird, setTimeUntilEarlyBird] = useState<string>('')

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
  const initializeRecurringTickets = async () => {
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
    
    // Fetch quota data for all tickets
    if (initialTickets.length > 0) {
      const promises = initialTickets.map(ticket => 
        fetchTicketQuota(ticket.ticketTypeId)
      )
      await Promise.all(promises)
    }
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

  // Initialize recurring tickets when component mounts
  useEffect(() => {
    if (canBuyFullSchedule()) {
      initializeRecurringTickets()
    }
  }, [event])

  // Fetch quota for all tickets in the full schedule
  const fetchAllTicketQuotaForFullSchedule = async () => {
    if (selectedRecurringTickets.length === 0) return
    
    const promises = selectedRecurringTickets.map(ticket => 
      fetchTicketQuota(ticket.ticketTypeId)
    )
    
    await Promise.all(promises)
  }

  // Check if early bird discount is applicable for any ticket in the full schedule
  const isEarlyBirdDiscountApplicableForFullSchedule = () => {
    // Check if any ticket still has early bird discount available
    // Use the quota earlyDay field instead of schedule start time
    const hasAnyEarlyBirdDiscount = selectedRecurringTickets.some(ticket => {
      const quota = ticketQuota[ticket.ticketTypeId]
      if (!quota || !quota.earlyDay) return false
      
      const now = new Date()
      const earlyDay = new Date(quota.earlyDay)
      const isBeforeEarlyDay = now < earlyDay
      
      // Also check if the ticket has early bird discount rate
      const schedule = event.schedules.find(s => 
        s.ticketTypes.some(t => t.id === ticket.ticketTypeId)
      )
      if (!schedule) return false
      
      const ticketData = schedule.ticketTypes.find(t => t.id === ticket.ticketTypeId)
      const hasDiscountRate = ticketData?.discountRateEarlyBird && ticketData.discountRateEarlyBird > 0
      
      return isBeforeEarlyDay && hasDiscountRate
    })
    
    console.log('Early bird discount check for full schedule:', {
      selectedRecurringTickets: selectedRecurringTickets.map(t => ({ 
        id: t.ticketTypeId, 
        name: t.ticketName,
        quota: ticketQuota[t.ticketTypeId],
        hasEarlyBirdDiscount: isEarlyBirdDiscountApplicable(t.ticketTypeId)
      })),
      hasAnyEarlyBirdDiscount
    })
    
    return hasAnyEarlyBirdDiscount
  }

  // Check if early bird discount is applicable for a specific ticket
  const isEarlyBirdDiscountApplicable = (ticketTypeId: string) => {
    // Get quota data to check earlyDay
    const quota = ticketQuota[ticketTypeId]
    if (!quota || !quota.earlyDay) return false
    
    // Check if current time is before earlyDay
    const now = new Date()
    const earlyDay = new Date(quota.earlyDay)
    const isBeforeEarlyDay = now < earlyDay
    
    // Also check if the ticket has early bird discount rate
    const schedule = event.schedules.find(s => 
      s.ticketTypes.some(t => t.id === ticketTypeId)
    )
    if (!schedule) return false
    
    const ticket = schedule.ticketTypes.find(t => t.id === ticketTypeId)
    const hasDiscountRate = ticket?.discountRateEarlyBird && ticket.discountRateEarlyBird > 0
    
    console.log('Early bird discount check for ticket:', {
      ticketTypeId,
      ticketName: ticket?.name,
      earlyDay: quota.earlyDay,
      now: now.toISOString(),
      isBeforeEarlyDay,
      hasDiscountRate,
      discountRateEarlyBird: ticket?.discountRateEarlyBird,
      willApply: isBeforeEarlyDay && hasDiscountRate
    })
    
    return isBeforeEarlyDay && hasDiscountRate
  }

  // Get early bird discount rate for a ticket
  const getTicketEarlyBirdDiscountRate = (ticketTypeId: string) => {
    const schedule = event.schedules.find(s => 
      s.ticketTypes.some(t => t.id === ticketTypeId)
    )
    if (!schedule) return 0
    
    const ticket = schedule.ticketTypes.find(t => t.id === ticketTypeId)
    const discountRate = ticket?.discountRateEarlyBird || 0
    
    console.log('Getting early bird discount rate for ticket:', {
      ticketTypeId,
      ticketName: ticket?.name,
      discountRate,
      allTicketTypes: schedule.ticketTypes.map(t => ({ id: t.id, name: t.name, discountRateEarlyBird: t.discountRateEarlyBird }))
    })
    
    return discountRate
  }

  // Get combo discount rate for a ticket
  const getTicketComboDiscountRate = (ticketTypeId: string) => {
    const schedule = event.schedules.find(s => 
      s.ticketTypes.some(t => t.id === ticketTypeId)
    )
    if (!schedule) {
      console.log('No schedule found for ticket:', ticketTypeId)
      return 0
    }
    
    const ticket = schedule.ticketTypes.find(t => t.id === ticketTypeId)
    if (!ticket) {
      console.log('No ticket found for ticketId:', ticketTypeId, 'in schedule:', schedule.id)
      return 0
    }
    
    const discountRate = ticket?.discountRateCombo || 0
    
    console.log('Getting combo discount rate for ticket:', {
      ticketTypeId,
      ticketName: ticket?.name,
      scheduleId: schedule.id,
      discountRate,
      ticketData: ticket,
      allTicketTypes: schedule.ticketTypes.map(t => ({ 
        id: t.id, 
        name: t.name, 
        discountRateCombo: t.discountRateCombo,
        discountRateEarlyBird: t.discountRateEarlyBird
      }))
    })
    
    return discountRate
  }

  // Calculate discounted price for a ticket (early bird discount)
  const calculateDiscountedPrice = (ticketTypeId: string, originalPrice: number) => {
    if (!isEarlyBirdDiscountApplicable(ticketTypeId)) return originalPrice
    
    const discountRate = getTicketEarlyBirdDiscountRate(ticketTypeId)
    if (discountRate <= 0) return originalPrice
    
    return originalPrice * (1 - discountRate)
  }

  // Calculate combo discounted price for a ticket
  const calculateComboDiscountedPrice = (ticketTypeId: string, originalPrice: number) => {
    const discountRate = getTicketComboDiscountRate(ticketTypeId)
    if (discountRate <= 0) return originalPrice
    
    return originalPrice * (1 - discountRate)
  }

  // Calculate total price with early bird and combo discounts for full schedule
  const calculateFullScheduleTotalPrice = () => {
    // Check if we have selected tickets
    if (selectedRecurringTickets.length === 0) {
      return {
        originalTotal: 0,
        discountedTotal: 0,
        totalDiscount: 0,
        earlyBirdDiscount: 0,
        comboDiscount: 0,
        hasDiscount: false,
        hasEarlyBirdDiscount: false,
        hasComboDiscount: false,
        ticketBreakdown: [],
        addOnsTotal: 0,
        subtotalAfterEarlyBird: 0,
        subtotalAfterCombo: 0
      }
    }

    let totalOriginalPrice = 0
    let totalDiscountedPrice = 0
    let totalEarlyBirdDiscount = 0
    let totalComboDiscount = 0
    const ticketBreakdown: Array<{
      ticketName: string
      scheduleName: string
      originalPrice: number
      earlyBirdDiscountedPrice: number
      earlyBirdDiscount: number
      earlyBirdDiscountRate: number
      finalPrice: number
      comboDiscount: number
      comboDiscountRate: number
    }> = []

    // Calculate for each ticket using API discount rates
    selectedRecurringTickets.forEach(ticket => {
      const originalPrice = ticket.price
      
      // Get discount rates from API (with proper validation)
      const hasEarlyBirdDiscount = isEarlyBirdDiscountApplicable(ticket.ticketTypeId)
      const earlyBirdRate = hasEarlyBirdDiscount ? getTicketEarlyBirdDiscountRate(ticket.ticketTypeId) : 0
      const comboRate = getTicketComboDiscountRate(ticket.ticketTypeId) || 0 // Handle null case
      
      // Only apply discounts if they exist and are valid
      const validEarlyBirdRate = (earlyBirdRate && earlyBirdRate > 0) ? earlyBirdRate : 0
      const validComboRate = (comboRate && comboRate > 0) ? comboRate : 0
      
      // Calculate total discount rate: Early Bird + Combo
      const totalDiscountRate = validEarlyBirdRate + validComboRate
      
      // Calculate final price: originalPrice * (1 - totalDiscountRate)
      const finalPrice = originalPrice * (1 - totalDiscountRate)
      
      // Calculate individual discount amounts
      const earlyBirdDiscount = originalPrice * validEarlyBirdRate
      const comboDiscount = originalPrice * validComboRate
      
      totalOriginalPrice += originalPrice
      totalDiscountedPrice += finalPrice
      totalEarlyBirdDiscount += earlyBirdDiscount
      totalComboDiscount += comboDiscount

      // Store ticket breakdown for display
      ticketBreakdown.push({
        ticketName: ticket.ticketName,
        scheduleName: ticket.scheduleName,
        originalPrice,
        earlyBirdDiscountedPrice: originalPrice - earlyBirdDiscount,
        earlyBirdDiscount,
        earlyBirdDiscountRate: validEarlyBirdRate,
        finalPrice,
        comboDiscount,
        comboDiscountRate: validComboRate
      })
    })

    const subtotalAfterEarlyBird = totalOriginalPrice - totalEarlyBirdDiscount
    const subtotalAfterCombo = totalDiscountedPrice

    // Add add-ons (no discount for add-ons)
    const addOnsTotal = selectedAddOns.reduce((total, addon) => 
      total + (addon.price * addon.quantity), 0
    )

    const totalDiscount = totalEarlyBirdDiscount + totalComboDiscount

    const result = {
      originalTotal: totalOriginalPrice + addOnsTotal,
      discountedTotal: totalDiscountedPrice + addOnsTotal,
      totalDiscount: totalDiscount,
      earlyBirdDiscount: totalEarlyBirdDiscount,
      comboDiscount: totalComboDiscount,
      hasDiscount: totalDiscount > 0,
      hasEarlyBirdDiscount: totalEarlyBirdDiscount > 0,
      hasComboDiscount: totalComboDiscount > 0,
      ticketBreakdown,
      addOnsTotal,
      subtotalAfterEarlyBird,
      subtotalAfterCombo
    }

    return result
  }

  // Calculate time remaining until early bird deadline
  const calculateTimeUntilEarlyBird = () => {
    const now = new Date()
    
    // Use the earliest schedule start time as the early bird deadline
    const earliestSchedule = getAllSchedules().find(schedule => !isScheduleExpired(schedule))
    if (!earliestSchedule) return ''
    
    const earlyBirdDeadline = new Date(earliestSchedule.startTime)
    if (earlyBirdDeadline <= now) return ''
    
    const diffMs = earlyBirdDeadline.getTime() - now.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours} hour${diffHours > 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`
    } else {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`
    }
  }

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
    let ticketPrice = 0
    
    if (selectedTicket) {
      // Apply early bird discount if applicable
      const isEarlyBirdApplicable = isEarlyBirdDiscountApplicable(selectedTicket.id)
      const discountedPrice = isEarlyBirdApplicable 
        ? calculateDiscountedPrice(selectedTicket.id, selectedTicket.price)
        : selectedTicket.price
      
      ticketPrice = discountedPrice * selectedTicket.quantity
    }
    
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
  const handleOpenRecurringModal = async () => {
    console.log('Opening recurring modal - current state:', {
      canBuyFullSchedule: canBuyFullSchedule(),
      selectedRecurringTickets: selectedRecurringTickets,
      eventSchedules: event.schedules.map(s => ({
        id: s.id,
        startTime: s.startTime,
        ticketTypes: s.ticketTypes.map(t => ({
          id: t.id,
          name: t.name,
          discountRateCombo: t.discountRateCombo,
          discountRateEarlyBird: t.discountRateEarlyBird
        }))
      }))
    })
    
    if (!canBuyFullSchedule()) {
      Notify.warning('Full schedule booking is only available before the first schedule starts.')
      return
    }
    
    await initializeRecurringTickets()
    
    // Fetch quota data for all tickets to ensure early bird discount logic works
    if (selectedRecurringTickets.length > 0) {
      const promises = selectedRecurringTickets.map(ticket => 
        fetchTicketQuota(ticket.ticketTypeId)
      )
      await Promise.all(promises)
    }
    
    console.log('After initializeRecurringTickets and quota fetch:', {
      selectedRecurringTickets: selectedRecurringTickets,
      ticketQuota: ticketQuota
    })
    
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
      
      // Log discount information
      const priceCalculation = calculateFullScheduleTotalPrice()
      if (priceCalculation.hasDiscount) {
        console.log('Early Bird Discount Applied:', {
          originalTotal: priceCalculation.originalTotal,
          discountedTotal: priceCalculation.discountedTotal,
          totalDiscount: priceCalculation.totalDiscount,
          discountPercentage: Math.round((priceCalculation.totalDiscount / priceCalculation.originalTotal) * 100)
        })
      }

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
                {/* Early bird discount badge - now calculated from ticket types */}
                {(() => {
                  const hasEarlyBirdDiscount = event.schedules.some(schedule =>
                    schedule.ticketTypes.some(ticket => 
                      ticket.discountRateEarlyBird && ticket.discountRateEarlyBird > 0
                    )
                  )
                  
                  if (hasEarlyBirdDiscount) {
                    const maxEarlyBirdDiscount = Math.max(...event.schedules.flatMap(schedule =>
                      schedule.ticketTypes.map(ticket => ticket.discountRateEarlyBird || 0)
                    ))
                    
                    return (
                      <Badge className="bg-red-500 text-white border-0">
                        -{Math.round(maxEarlyBirdDiscount * 100)}%
                      </Badge>
                    )
                  }
                  return null
                })()}
                
                {/* Combo discount badge */}
                {(() => {
                  const hasComboDiscount = event.schedules.some(schedule =>
                    schedule.ticketTypes.some(ticket => 
                      ticket.discountRateCombo && ticket.discountRateCombo > 0
                    )
                  )
                  
                  if (hasComboDiscount) {
                    const maxComboDiscount = Math.max(...event.schedules.flatMap(schedule =>
                      schedule.ticketTypes.map(ticket => ticket.discountRateCombo || 0)
                    ))
                    
                    return (
                      <Badge className="bg-purple-500 text-white border-0">
                        Combo -{Math.round(maxComboDiscount * 100)}%
                      </Badge>
                    )
                  }
                  return null
                })()}
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
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
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
                      <RequirementsChips notes={parseNotes(event.notes)} />
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

            <TabsContent value="agenda" className="mt-6">
              <Card>
                <CardHeader className="border-b bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Event Agenda</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Detailed schedule and activities</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <AgendaTimeline agenda={parseAgenda(event.agenda)} />
                </CardContent>
              </Card>
            </TabsContent>



            <TabsContent value="instructor" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <InstructorCard instructor={parseInstructor(event.instructorName)} />
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

            {/* Early Bird Special Notice - Applies to both Single and Combo */}
            {selectedSchedule && !isScheduleExpired(selectedSchedule) && (() => {
              // Check if any ticket has early bird discount available
              const hasAnyEarlyBirdDiscount = selectedSchedule.ticketTypes.some(ticket => {
                const earlyBirdRate = getTicketEarlyBirdDiscountRate(ticket.id)
                return isEarlyBirdDiscountApplicable(ticket.id) && earlyBirdRate > 0
              })
              
              if (hasAnyEarlyBirdDiscount) {
                // Get the earliest earlyDay from quota data
                const earlyDays = selectedSchedule.ticketTypes
                  .map(ticket => ticketQuota[ticket.id]?.earlyDay)
                  .filter(Boolean)
                  .map(day => new Date(day))
                
                const earliestEarlyDay = earlyDays.length > 0 ? new Date(Math.min(...earlyDays.map(d => d.getTime()))) : null
                
                if (earliestEarlyDay) {
                  const formattedDate = earliestEarlyDay.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                  
                  const maxEarlyBirdDiscount = Math.max(...selectedSchedule.ticketTypes.map(ticket => 
                    getTicketEarlyBirdDiscountRate(ticket.id)
                  ))
                  
                  return (
                    <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <Clock className="w-4 h-4 text-orange-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-semibold text-orange-900">
                            🎯 Early Bird Special - Limited Time!
                          </p>
                          <p className="text-sm text-orange-700 mt-1">
                            Book before <span className="font-medium">{formattedDate}</span> and save up to <span className="font-bold">{Math.round(maxEarlyBirdDiscount * 100)}%</span> on both single tickets and combo packages!
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                }
              }
              return null
            })()}

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
                  
                  {/* Combo Discount Attraction Notice */}
                  {canBuyFullSchedule() && (() => {
                    // Check if any ticket has combo discount
                    const hasAnyComboDiscount = event.schedules.some(schedule =>
                      schedule.ticketTypes.some(ticket => 
                        ticket.discountRateCombo && ticket.discountRateCombo > 0
                      )
                    )
                    
                    if (hasAnyComboDiscount) {
                      const maxComboDiscount = Math.max(...event.schedules.flatMap(schedule =>
                        schedule.ticketTypes.map(ticket => ticket.discountRateCombo || 0)
                      ))
                      
                      return (
                        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="flex-shrink-0">
                              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                <Tag className="w-3 h-3 text-purple-600" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-purple-900">
                                💎 Combo Deal Alert!
                              </p>
                              <p className="text-xs text-purple-700">
                                Get an exclusive {Math.round(maxComboDiscount * 100)}% combo discount when you book the complete schedule package!
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  })()}
                  
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
                                <div className="text-right space-y-1">
                                  {(() => {
                                    // Single ticket only shows Early Bird discount
                                    const isEarlyBirdApplicable = isEarlyBirdDiscountApplicable(ticket.id)
                                    const earlyBirdRate = getTicketEarlyBirdDiscountRate(ticket.id)
                                    
                                    const hasEarlyBird = isEarlyBirdApplicable && earlyBirdRate > 0
                                    
                                    if (hasEarlyBird) {
                                      const finalPrice = ticket.price * (1 - earlyBirdRate)
                                      const discountPercentage = Math.round(earlyBirdRate * 100)
                                      
                                      return (
                                        <>
                                          {/* Original price (crossed out) */}
                                          <p className="text-sm text-gray-500 line-through">
                                            {formatPrice(ticket.price)}
                                          </p>
                                          
                                          {/* Early Bird discount badge */}
                                          <div className="flex items-center justify-end">
                                            <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                                              -{discountPercentage}% Early Bird
                                            </span>
                                          </div>
                                          
                                          {/* Final discounted price */}
                                          <p className="font-semibold text-orange-600">
                                            {formatPrice(finalPrice)}
                                          </p>
                                        </>
                                      )
                                    } else {
                                      // No early bird discount
                                      return (
                                        <p className="font-semibold text-blue-600">{formatPrice(ticket.price)}</p>
                                      )
                                    }
                                  })()}
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
                        <div className="text-right space-y-1">
                          {(() => {
                            const isEarlyBirdApplicable = isEarlyBirdDiscountApplicable(selectedTicket.id)
                            const earlyBirdRate = getTicketEarlyBirdDiscountRate(selectedTicket.id)
                            const hasEarlyBird = isEarlyBirdApplicable && earlyBirdRate > 0
                            
                            if (hasEarlyBird) {
                              const originalTotal = selectedTicket.price * selectedTicket.quantity
                              const discountedPrice = calculateDiscountedPrice(selectedTicket.id, selectedTicket.price)
                              const discountedTotal = discountedPrice * selectedTicket.quantity
                              const discountPercentage = Math.round(earlyBirdRate * 100)
                              
                              return (
                                <>
                                  {/* Original price (crossed out) */}
                                  <p className="text-sm text-gray-500 line-through">
                                    {formatPrice(originalTotal)}
                                  </p>
                                  
                                  {/* Early Bird discount badge */}
                                  <div className="flex items-center justify-end">
                                    <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                                      -{discountPercentage}% Early Bird
                                    </span>
                                  </div>
                                  
                                  {/* Final discounted price */}
                                  <p className="font-semibold text-orange-600">
                                    {formatPrice(discountedTotal)}
                                  </p>
                                </>
                              )
                            } else {
                              // No early bird discount
                              return (
                                <p className="font-semibold">{formatPrice(selectedTicket.price * selectedTicket.quantity)}</p>
                              )
                            }
                          })()}
                        </div>
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
                      {(() => {
                        const isEarlyBirdApplicable = isEarlyBirdDiscountApplicable(selectedTicket.id)
                        const hasEarlyBird = isEarlyBirdApplicable && getTicketEarlyBirdDiscountRate(selectedTicket.id) > 0
                        
                        if (hasEarlyBird) {
                          const originalTicketTotal = selectedTicket.price * selectedTicket.quantity
                          const addOnsTotal = selectedAddOns.reduce((total, addon) => total + (addon.price * addon.quantity), 0)
                          const originalTotal = originalTicketTotal + addOnsTotal
                          const discountedTotal = calculateTotalPrice()
                          const totalSavings = originalTotal - discountedTotal
                          
                          return (
                            <div className="space-y-3">
                              {/* Original total (crossed out) */}
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Original Price</span>
                                <span className="text-lg text-gray-500 line-through">
                                  {formatPrice(originalTotal)}
                                </span>
                              </div>
                              
                              {/* Savings */}
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-green-600 font-medium">Early Bird Savings</span>
                                <span className="text-lg text-green-600 font-medium">
                                  -{formatPrice(totalSavings)}
                                </span>
                              </div>
                              
                              {/* Final total */}
                              <div className="flex justify-between items-center pt-2 border-t">
                                <span className="text-lg font-semibold">Total</span>
                                <span className="text-2xl font-bold text-orange-600">
                                  {formatPrice(discountedTotal)}
                                </span>
                              </div>
                            </div>
                          )
                        } else {
                          // No discount
                          return (
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-semibold">Total</span>
                              <span className="text-2xl font-bold text-blue-600">
                                {formatPrice(calculateTotalPrice())}
                              </span>
                            </div>
                          )
                        }
                      })()}
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
            {/* Discount Info */}
            {(() => {
              const priceCalculation = calculateFullScheduleTotalPrice()
              const hasEarlyBirdDiscount = priceCalculation.hasEarlyBirdDiscount
              const hasComboDiscount = priceCalculation.hasComboDiscount
              
              // Show discount info if either early bird or combo discount exists
              if (hasEarlyBirdDiscount || hasComboDiscount) {
                return (
                  <div className="space-y-3">
                    {/* Early Bird Discount Info */}
                    {hasEarlyBirdDiscount && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="font-medium text-green-900">Early Bird Discount Available</p>
                        <p className="text-sm text-green-700 mt-1">
                          Save {formatPrice(priceCalculation.earlyBirdDiscount)} ({Math.round((priceCalculation.earlyBirdDiscount / priceCalculation.originalTotal) * 100)}% off) when booking before the deadline.
                        </p>
                      </div>
                    )}

                    {/* Combo Discount Info */}
                    {hasComboDiscount && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="font-medium text-purple-900">Combo Discount Available</p>
                        <p className="text-sm text-purple-700 mt-1">
                          Additional {formatPrice(priceCalculation.comboDiscount)} savings when purchasing the full schedule package.
                        </p>
                      </div>
                    )}
                  </div>
                )
              }
              return null
            })()}
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900">Full Schedule Booking</p>
              <p className="text-sm text-blue-700 mt-1">
                Select ticket types for each schedule. Quantity will be set to 1 for all tickets.
              </p>
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
                                    {(() => {
                                      const isEarlyBirdApplicable = isEarlyBirdDiscountApplicable(ticket.id)
                                      const earlyBirdRate = getTicketEarlyBirdDiscountRate(ticket.id)
                                      const comboRate = getTicketComboDiscountRate(ticket.id)
                                      
                                      // Calculate combined discount
                                      const hasEarlyBird = isEarlyBirdApplicable && earlyBirdRate > 0
                                      const hasCombo = comboRate > 0
                                      const hasAnyDiscount = hasEarlyBird || hasCombo
                                      
                                      if (hasAnyDiscount) {
                                        // Calculate total discount rate from API data
                                        let totalDiscountRate = 0
                                        let discountDetails: string[] = []
                                        
                                        // Check Early Bird discount (with earlyDay validation)
                                        if (hasEarlyBird && earlyBirdRate > 0) {
                                          totalDiscountRate += earlyBirdRate
                                          discountDetails.push(`${Math.round(earlyBirdRate * 100)}% Early Bird`)
                                        }
                                        
                                        // Check Combo discount
                                        if (hasCombo && comboRate > 0) {
                                          totalDiscountRate += comboRate
                                          discountDetails.push(`${Math.round(comboRate * 100)}% Combo`)
                                        }
                                        
                                        // Calculate final price: originalPrice * (1 - totalDiscountRate)
                                        const finalPrice = ticket.price * (1 - totalDiscountRate)
                                        const discountPercentage = Math.round(totalDiscountRate * 100)
                                        
                                        return (
                                          <div className="text-right space-y-1">
                                            {/* Original price (crossed out) */}
                                            <p className="text-sm text-gray-500 line-through">
                                              {formatPrice(ticket.price)}
                                            </p>
                                            
                                            {/* Discount percentage with details */}
                                            <div className="flex items-center justify-end">
                                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                                                -{discountPercentage}% OFF
                                                {discountDetails.length > 0 && (
                                                  <span className="text-gray-600 ml-1">
                                                    ({discountDetails.join(' + ')})
                                                  </span>
                                                )}
                                              </span>
                                            </div>
                                            
                                            {/* Final discounted price */}
                                            <p className="font-semibold text-green-600 text-lg">
                                              {formatPrice(finalPrice)}
                                            </p>
                                          </div>
                                        )
                                      } else {
                                        // No discounts available
                                        return (
                                          <div className="text-right space-y-1">
                                            <p className="font-semibold text-blue-600">
                                              {formatPrice(ticket.price)}
                                            </p>
                                          </div>
                                        )
                                      }
                                    })()}
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
                {(() => {
                  const priceCalculation = calculateFullScheduleTotalPrice()
                  return (
                    <div className="space-y-4">
                      {/* Ticket Breakdown */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800 text-lg mb-3">
                          Ticket Breakdown
                        </h4>
                        {priceCalculation.ticketBreakdown.map((ticket, index) => (
                          <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-gray-800">
                                  {ticket.ticketName} <span className="text-sm text-gray-500">(Qty: 1)</span>
                                </p>
                                <p className="text-sm text-gray-600">{ticket.scheduleName}</p>
                              </div>
                              <div className="text-right space-y-1">
                                {/* Original price (crossed out) */}
                                <p className="text-sm text-gray-500 line-through">
                                  {formatPrice(ticket.originalPrice)}
                                </p>
                                
                                {/* Discount percentage if applicable */}
                                {(ticket.earlyBirdDiscount > 0 || ticket.comboDiscount > 0) && (
                                  <div className="flex items-center justify-end">
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                                      -{Math.round(((ticket.originalPrice - ticket.finalPrice) / ticket.originalPrice) * 100)}% OFF
                                      {(() => {
                                        const discountDetails: string[] = []
                                        if (ticket.earlyBirdDiscount > 0) {
                                          discountDetails.push(`${Math.round(ticket.earlyBirdDiscountRate * 100)}% Early Bird`)
                                        }
                                        if (ticket.comboDiscount > 0) {
                                          discountDetails.push(`${Math.round(ticket.comboDiscountRate * 100)}% Combo`)
                                        }
                                        return discountDetails.length > 0 ? (
                                          <span className="text-gray-600 ml-1">
                                            ({discountDetails.join(' + ')})
                                          </span>
                                        ) : null
                                      })()}
                                    </span>
                                  </div>
                                )}
                                
                                {/* Final price */}
                                <p className="font-semibold text-green-600 text-lg">
                                  {formatPrice(ticket.finalPrice)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add-ons */}
                      {priceCalculation.addOnsTotal > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-800 text-lg mb-3">
                            Add-ons
                          </h4>
                          {selectedAddOns.map((addon) => (
                            <div key={addon.id} className="bg-white p-3 rounded-lg border border-gray-200">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {addon.name} <span className="text-sm text-gray-500">(Qty: {addon.quantity})</span>
                                  </p>
                                </div>
                                <p className="font-semibold text-blue-600">
                                  {formatPrice(addon.price * addon.quantity)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Final Price */}
                      <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
                        <span className="text-xl font-bold text-gray-800">
                          Final Price:
                        </span>
                        <span className={`text-3xl font-bold ${priceCalculation.hasDiscount ? 'text-green-600' : 'text-blue-600'}`}>
                          {formatPrice(priceCalculation.discountedTotal)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-4 text-center">
                        Quantity: 1 ticket per schedule ({selectedRecurringTickets.length} schedules)
                        {selectedAddOns.length > 0 && (
                          <span> • {selectedAddOns.length} add-on(s) selected</span>
                        )}
                      </p>
                    </div>
                  )
                })()}
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