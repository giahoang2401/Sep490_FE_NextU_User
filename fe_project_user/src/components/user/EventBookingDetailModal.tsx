'use client'

import { 
  Calendar, 
  Clock, 
  Ticket, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  X,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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

interface EventBookingDetailModalProps {
  booking: EventBooking | null
  isOpen: boolean
  onClose: () => void
  onPayment?: (booking: EventBooking) => Promise<void>
  processingPayment?: string | null
}

export default function EventBookingDetailModal({ 
  booking, 
  isOpen, 
  onClose,
  onPayment,
  processingPayment
}: EventBookingDetailModalProps) {
  if (!booking) return null

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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="h-4 w-4" />
      case 'Pending':
        return <AlertCircle className="h-4 w-4" />
      case 'Cancelled':
        return <XCircle className="h-4 w-4" />
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const handlePayNow = async () => {
    if (onPayment && booking) {
      await onPayment(booking)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Booking Details
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl text-gray-900 mb-2">
                    {booking.eventName}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Ticket className="h-4 w-4 mr-1" />
                      {booking.ticketTypeName}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(booking.createdAt)}
                    </div>
                  </div>
                </div>
                <Badge className={`${getStatusColor(booking.status)} border`}>
                  <div className="flex items-center">
                    {getStatusIcon(booking.status)}
                    <span className="ml-1">{booking.status}</span>
                  </div>
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Booking Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Booking Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ticket Type:</span>
                      <span className="font-medium">{booking.ticketTypeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{booking.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit Price:</span>
                      <span className="font-medium">{formatPrice(booking.unitPrice)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ticket Total:</span>
                      <span className="font-medium">{formatPrice(booking.unitPrice * booking.quantity)}</span>
                    </div>
                  </div>
                </div>

                {/* Add-ons */}
                {booking.addOns.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Add-ons</h4>
                    <div className="space-y-3">
                      {booking.addOns.map((addon) => (
                        <div key={addon.addOnId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{addon.name}</p>
                            <p className="text-xs text-gray-600">Qty: {addon.quantity}</p>
                          </div>
                          <span className="font-medium text-sm">{formatPrice(addon.unitPrice * addon.quantity)}</span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-600">Add-ons Total:</span>
                        <span className="font-medium">{formatPrice(booking.addOnAmount)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Total Amount */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">{formatPrice(booking.totalAmount)}</span>
                </div>
              </div>

              {/* Payment Information */}
              {booking.paymentMethod && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Payment Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Method: {booking.paymentMethod}</span>
                    </div>
                    {booking.paymentTransactionId && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Transaction ID: {booking.paymentTransactionId}</span>
                      </div>
                    )}
                    {booking.paidAt && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Paid: {formatDate(booking.paidAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  {booking.paymentProofUrl && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Receipt
                    </Button>
                  )}
                  {booking.status === 'Pending' && onPayment && (
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={handlePayNow}
                      disabled={processingPayment === booking.purchaseId}
                    >
                      {processingPayment === booking.purchaseId ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      {processingPayment === booking.purchaseId ? 'Processing...' : 'Pay Now'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
} 