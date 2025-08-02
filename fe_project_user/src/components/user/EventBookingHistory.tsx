'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Clock, 
  Ticket, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Eye,
  Loader2,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import api from '@/utils/axiosConfig'
import { Notify } from 'notiflix'
import EventBookingDetailModal from './EventBookingDetailModal'

interface EventAddOn {
  addOnId: string
  name: string
  unitPrice: number
  quantity: number
}

interface EventBooking {
  purchaseId: string
  eventName: string
  ticketTypeName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  addOnAmount: number
  status: 'Pending' | 'Paid' | 'Cancelled' | 'Completed'
  createdAt: string
  paidAt: string | null
  fullName: string | null
  paymentMethod: string | null
  paymentTransactionId: string | null
  paymentNote: string | null
  paymentProofUrl: string | null
  addOns: EventAddOn[]
}

interface PaymentRequest {
  RequestId: string
  PaymentMethod: string
  ReturnUrl: string
  IsDirectMembership: boolean
  IsEventTicket: boolean
}

export default function EventBookingHistory() {
  const [bookings, setBookings] = useState<EventBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<EventBooking | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)

  useEffect(() => {
    fetchEventBookings()
  }, [])

  const fetchEventBookings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/user/event/myticket')
      setBookings(response.data)
    } catch (error: any) {
      console.error('Error fetching event bookings:', error)
      setError('Failed to load event bookings')
      Notify.failure('Failed to load event bookings')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (booking: EventBooking) => {
    try {
      setProcessingPayment(booking.purchaseId)
      
      const paymentRequest: PaymentRequest = {
        RequestId: booking.purchaseId,
        PaymentMethod: "VNPAY",
        ReturnUrl: "",
        IsDirectMembership: true,
        IsEventTicket: true
      }

      console.log('Payment Request:', paymentRequest)

      const response = await api.post('/api/payments/create', paymentRequest)
      
      if (response.status === 200 || response.status === 201) {
        const responseData = response.data
        
        if (responseData.Success && responseData.Data?.redirectUrl) {
          Notify.success('Redirecting to payment gateway...')
          
          // Redirect to VNPAY payment gateway
          window.location.href = responseData.Data.redirectUrl
        } else {
          Notify.failure('Payment initialization failed. Please try again.')
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to initiate payment. Please try again.'
      Notify.failure(errorMessage)
    } finally {
      setProcessingPayment(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      case 'Completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="h-3 w-3" />
      case 'Pending':
        return <AlertCircle className="h-3 w-3" />
      case 'Cancelled':
        return <XCircle className="h-3 w-3" />
      case 'Completed':
        return <CheckCircle className="h-3 w-3" />
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  const handleViewDetails = (booking: EventBooking) => {
    setSelectedBooking(booking)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBooking(null)
  }

  const handlePayNow = (e: React.MouseEvent, booking: EventBooking) => {
    e.stopPropagation() // Prevent modal from opening
    handlePayment(booking)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading event bookings...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Bookings</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchEventBookings} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Event Bookings</h3>
        <p className="text-gray-600">You haven't booked any events yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.map((booking) => (
          <Card key={booking.purchaseId} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewDetails(booking)}>
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate mb-1">
                    {booking.eventName}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Ticket className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{booking.ticketTypeName}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                    {formatDate(booking.createdAt)}
                  </div>
                </div>
                <Badge className={`${getStatusColor(booking.status)} text-xs px-2 py-1 ml-2 flex-shrink-0`}>
                  <div className="flex items-center">
                    {getStatusIcon(booking.status)}
                    <span className="ml-1">{booking.status}</span>
                  </div>
                </Badge>
              </div>

              {/* Quick Info */}
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{booking.quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold text-blue-600">{formatPrice(booking.totalAmount)}</span>
                </div>
                {booking.addOns.length > 0 && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Add-ons:</span>
                    <span>{booking.addOns.length} item(s)</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-2 border-t">
                <Button variant="outline" size="sm" className="text-xs h-7">
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </Button>
                {booking.status === 'Pending' && (
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-xs h-7"
                    onClick={(e) => handlePayNow(e, booking)}
                    disabled={processingPayment === booking.purchaseId}
                  >
                    {processingPayment === booking.purchaseId ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <CreditCard className="h-3 w-3 mr-1" />
                    )}
                    {processingPayment === booking.purchaseId ? 'Processing...' : 'Pay'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      <EventBookingDetailModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPayment={handlePayment}
        processingPayment={processingPayment}
      />
    </>
  )
} 