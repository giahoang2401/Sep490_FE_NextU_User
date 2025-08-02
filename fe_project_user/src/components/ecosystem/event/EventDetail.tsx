'use client'

import { useState } from 'react'
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
  Loader2
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
import { TransformedEvent } from '@/data/ecosystem/event-api'
import api from '@/utils/axiosConfig'
import { Notify } from 'notiflix'

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
  ticketTypeId: string
  quantity: number
  addOns: {
    addOnId: string
    quantity: number
  }[]
}

export default function EventDetail({ event, onBackClick }: EventDetailProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTicket, setSelectedTicket] = useState<SelectedTicket | null>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOn[]>([])
  const [isBooking, setIsBooking] = useState(false)

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

  const handleTicketSelect = (ticketId: string) => {
    const ticket = event.ticketTypes.find(t => t.id === ticketId)
    if (ticket && ticket.totalQuantity > 0) {
      setSelectedTicket({
        id: ticket.id,
        name: ticket.name,
        price: ticket.price,
        quantity: 1,
        maxQuantity: ticket.totalQuantity
      })
    }
  }

  const handleTicketQuantityChange = (quantity: number) => {
    if (selectedTicket) {
      let newQuantity = quantity
      
      // Validate quantity
      if (newQuantity <= 0) {
        newQuantity = 1
      } else if (newQuantity > selectedTicket.maxQuantity) {
        newQuantity = selectedTicket.maxQuantity
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
      let newQuantity = quantity
      
      // Validate quantity
      if (newQuantity <= 0) {
        newQuantity = 1
      } else if (newQuantity > selectedTicket.maxQuantity) {
        newQuantity = selectedTicket.maxQuantity
      }
      
      setSelectedTicket({
        ...selectedTicket,
        quantity: newQuantity
      })
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

  const handleRegisterNow = async () => {
    if (!selectedTicket) {
      Notify.failure('Please select a ticket first')
      return
    }

    setIsBooking(true)

    try {
      const bookingRequest: BookingRequest = {
        eventId: event.id,
        ticketTypeId: selectedTicket.id,
        quantity: selectedTicket.quantity,
        addOns: selectedAddOns.map(addon => ({
          addOnId: addon.id,
          quantity: addon.quantity
        }))
      }

      const response = await api.post('/api/user/event', bookingRequest)
      
      if (response.status === 200 || response.status === 201) {
        Notify.success('Event booked successfully!')
        // You can redirect to booking confirmation page here
        // router.push('/my-bookings')
      }
    } catch (error: any) {
      console.error('Booking error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to book event. Please try again.'
      Notify.failure(errorMessage)
    } finally {
      setIsBooking(false)
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
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {event.category.name}
                </Badge>
                <Badge variant="outline">
                  {event.level.name}
                </Badge>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="font-medium">{event.rating}</span>
                <span className="text-gray-500">({event.reviewCount} reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
         

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="font-medium">{formatDate(event.date)}</p>
                  <p className="text-sm text-gray-500">{event.time}</p>
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
                  <p className="font-medium">{event.capacity.available}/{event.capacity.total} spots</p>
                  <p className={`text-sm ${getAvailabilityColor()}`}>
                    {event.capacity.available} spots available
                  </p>
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
                    {event.schedules.map((schedule, index) => (
                      <div key={schedule.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">{index + 1}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{schedule.activity}</h4>
                          <p className="text-gray-600">{schedule.description}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {schedule.time} • {schedule.duration} minutes
                          </div>
                        </div>
                      </div>
                    ))}
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
            {/* Ticket Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Select Your Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedTicket?.id || ''} onValueChange={handleTicketSelect}>
                  <div className="space-y-3">
                    {event.ticketTypes.map((ticket) => {
                      const isSoldOut = ticket.totalQuantity <= 0
                      return (
                        <div key={ticket.id} className={`flex items-center space-x-3 p-3 border rounded-lg ${isSoldOut ? 'opacity-50 bg-gray-50' : ''}`}>
                          <RadioGroupItem 
                            value={ticket.id} 
                            id={ticket.id} 
                            disabled={isSoldOut}
                          />
                          <div className="flex-1">
                            <Label 
                              htmlFor={ticket.id} 
                              className={`font-medium ${isSoldOut ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer'}`}
                            >
                              {ticket.name}
                            </Label>
                            <p className="text-sm text-gray-600">
                              Quantity: {ticket.totalQuantity > 0 ? ticket.totalQuantity : '0'}
                            </p>
                            {isSoldOut && (
                              <p className="text-sm text-red-500 mt-1">Vé đã bán hết</p>
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
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add-ons Selection */}
            {event.addOns.length > 0 && (
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

                  {!selectedTicket && selectedAddOns.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      <p>Please select a ticket to continue</p>
                    </div>
                  )}

                  {/* Total Price */}
                  {selectedTicket && (
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
                    disabled={!selectedTicket || isBooking}
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
                    <span className={`font-medium ${getAvailabilityColor()}`}>
                      {event.capacity.available} left
                    </span>
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
    </div>
  )
} 