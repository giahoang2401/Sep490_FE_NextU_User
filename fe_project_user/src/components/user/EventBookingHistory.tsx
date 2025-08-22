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
  Plus,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import api from '@/utils/axiosConfig'
import { Notify } from 'notiflix'
import EventBookingDetailModal from './EventBookingDetailModal'

interface EventAddOn {
  addOnId: string
  name: string
  unitPrice: number
  quantity: number
}

interface UsageDetail {
  scheduleId: string
  useDate: string
  ticketTypeId: string
  ticketTypeName: string
  originalUnitPrice: number
  earlyBirdDiscountAmount: number
  earlyBirdDiscountPercent: number
  comboDiscountAmount: number
  comboDiscountPercent: number
  totalDiscountAmount: number
  finalUnitPrice: number
  unitPrice: number
  appliedRule: string
  lockedUnitPrice: number
}

interface EventBooking {
  purchaseId: string
  status: 'Pending' | 'Paid' | 'Cancelled' | 'Completed'
  createdAt: string
  paidAt: string | null
  eventName: string
  isCombo: boolean
  quantity: number
  usageDetails: UsageDetail[]
  addOns: EventAddOn[]
  ticketAmount: number
  addOnAmount: number
  totalAmount: number
  currency: string
}

interface PaymentRequest {
  RequestId: string
  PaymentMethod: string
  ReturnUrl: string
  IsDirectMembership: boolean
  IsEventTicket: boolean
  IsExtend: boolean
  MembershipId: string
  Amount: number
  PackageId: string
  PackageType: string
}

export default function EventBookingHistory() {
  const [bookings, setBookings] = useState<EventBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<EventBooking | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)
  const [cancelBooking, setCancelBooking] = useState<EventBooking | null>(null)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [processingCancel, setProcessingCancel] = useState<string | null>(null)

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
        IsEventTicket: true,
        IsExtend: false,
        MembershipId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        Amount: 0,
        PackageId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        PackageType: ""
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

  const handleCancelClick = (e: React.MouseEvent, booking: EventBooking) => {
    e.stopPropagation() // Prevent modal from opening
    setCancelBooking(booking)
    setIsCancelModalOpen(true)
  }

  const handleCancelBooking = async () => {
    if (!cancelBooking) return

    try {
      setProcessingCancel(cancelBooking.purchaseId)
      
      const response = await api.delete(`/api/user/event/${cancelBooking.purchaseId}`)
      
      if (response.status === 200 || response.status === 204) {
        Notify.success('Booking cancelled successfully')
        // Refresh the bookings list
        await fetchEventBookings()
        // Close the modal
        setIsCancelModalOpen(false)
        setCancelBooking(null)
      }
    } catch (error: any) {
      console.error('Cancel booking error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to cancel booking. Please try again.'
      Notify.failure(errorMessage)
    } finally {
      setProcessingCancel(null)
    }
  }

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false)
    setCancelBooking(null)
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
                    <span className="truncate">{booking.isCombo ? 'Combo Ticket' : 'Single Ticket'}</span>
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
                {booking.paidAt && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Paid at:</span>
                    <span>{formatDate(booking.paidAt)}</span>
                  </div>
                )}
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
                <div className="flex space-x-2">
                  {booking.status === 'Pending' && (
                    <>
                      <Button 
                        variant="outline"
                        size="sm" 
                        className="text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => handleCancelClick(e, booking)}
                        disabled={processingCancel === booking.purchaseId}
                      >
                        {processingCancel === booking.purchaseId ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3 mr-1" />
                        )}
                        Cancel
                      </Button>
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
                    </>
                  )}
                </div>
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
        onCancel={handleCancelClick}
        processingPayment={processingPayment}
        processingCancel={processingCancel}
      />

      {/* Cancel Confirmation Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={handleCloseCancelModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {cancelBooking && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">{cancelBooking.eventName}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Type: {cancelBooking.isCombo ? 'Combo Ticket' : 'Single Ticket'}</div>
                <div>Total Amount: {formatPrice(cancelBooking.totalAmount)}</div>
                <div>Created: {formatDate(cancelBooking.createdAt)}</div>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseCancelModal}
              disabled={processingCancel !== null}
            >
              No, Keep Booking
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={processingCancel !== null}
            >
              {processingCancel ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Yes, Cancel Booking
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 