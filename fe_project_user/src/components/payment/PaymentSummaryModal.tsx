'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Clock, 
  Ticket, 
  CreditCard, 
  CheckCircle, 
  Loader2,
  X,
  Package,
  Receipt
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
import api from '@/utils/axiosConfig'
import { Notify } from 'notiflix'

interface UsageDetail {
  scheduleId: string
  useDate: string
  ticketTypeId: string
  ticketTypeName: string
  unitPrice: number
  originalUnitPrice: number
  discountPercent: number
}

interface AddOn {
  addOnId: string
  name: string
  unitPrice: number
  quantity: number
}

interface BookingSummary {
  purchaseId: string
  accountId: string
  status: string
  eventName: string
  isCombo: boolean
  quantity: number
  usageDetails: UsageDetail[]
  addOns: AddOn[]
  ticketAmount: number
  addOnAmount: number
  totalAmount: number
  currency: string
  ticketName: string
  unitPrice: number
  ticketTypeId: string
  useDate: string
}

interface PaymentRequest {
  RequestId: string
  PaymentMethod: string
  ReturnUrl: string
  IsDirectMembership: boolean
  IsEventTicket: boolean
}

interface PaymentSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  purchaseId: string
  initialData?: BookingSummary | null
}

export default function PaymentSummaryModal({ 
  isOpen, 
  onClose, 
  purchaseId,
  initialData 
}: PaymentSummaryModalProps) {
  const [summary, setSummary] = useState<BookingSummary | null>(initialData || null)
  const [loading, setLoading] = useState(!initialData)
  const [processingPayment, setProcessingPayment] = useState(false)

  // Fetch summary data when modal opens
  const fetchSummary = async () => {
    if (!purchaseId || initialData) return

    try {
      setLoading(true)
      const response = await api.get(`/api/user/event/summary-direct/${purchaseId}`)
      setSummary(response.data)
    } catch (error: any) {
      console.error('Error fetching summary:', error)
      const errorMessage = error.response?.data?.message || 'Failed to load booking summary'
      Notify.failure(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Load summary when modal opens
  React.useEffect(() => {
    if (isOpen && purchaseId && !initialData) {
      fetchSummary()
    }
  }, [isOpen, purchaseId, initialData])

  const formatPrice = (price: number, currency: string = 'VND') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePayNow = async () => {
    if (!summary) return

    try {
      setProcessingPayment(true)
      
      const paymentRequest: PaymentRequest = {
        RequestId: summary.purchaseId,
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
      setProcessingPayment(false)
    }
  }

  const handleClose = () => {
    if (!processingPayment) {
      setSummary(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center">
              <Receipt className="h-5 w-5 mr-2 text-blue-600" />
              Booking Summary
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={processingPayment}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading booking summary...</span>
          </div>
        ) : summary ? (
          <div className="space-y-6">
            {/* Event Info */}
            <Card>
              <CardHeader className="bg-blue-50 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-gray-900 mb-2">
                      {summary.eventName}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Ticket className="h-4 w-4 mr-1" />
                        {summary.isCombo ? 'Combo Package' : 'Single Ticket'}
                      </div>
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        Quantity: {summary.quantity}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    {summary.status}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Usage Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {summary.isCombo ? 'Schedule Details' : 'Ticket Details'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summary.usageDetails.map((usage, index) => (
                    <div key={usage.scheduleId} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {summary.isCombo ? `Session ${index + 1}` : 'Single Session'}
                            </Badge>
                            <span className="text-sm font-medium text-gray-900">
                              {usage.ticketTypeName}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(usage.useDate)}
                          </div>
                          {usage.discountPercent > 0 && (
                            <div className="flex items-center text-xs text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {usage.discountPercent}% discount applied
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          {usage.discountPercent > 0 ? (
                            <div>
                              <span className="text-xs text-gray-500 line-through">
                                {formatPrice(usage.originalUnitPrice, summary.currency)}
                              </span>
                              <span className="font-medium text-green-600 block">
                                {formatPrice(usage.unitPrice, summary.currency)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-medium text-gray-900">
                              {formatPrice(usage.unitPrice, summary.currency)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Add-ons */}
            {summary.addOns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add-ons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {summary.addOns.map((addon) => (
                      <div key={addon.addOnId} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{addon.name}</p>
                          <p className="text-xs text-gray-600">Quantity: {addon.quantity}</p>
                        </div>
                        <span className="font-medium text-sm">
                          {formatPrice(addon.unitPrice * addon.quantity, summary.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Price Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Price Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ticket Total:</span>
                    <span className="font-medium">{formatPrice(summary.ticketAmount, summary.currency)}</span>
                  </div>
                  
                  {summary.addOnAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Add-ons Total:</span>
                      <span className="font-medium">{formatPrice(summary.addOnAmount, summary.currency)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(summary.totalAmount, summary.currency)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 space-y-1">
                <div>Purchase ID: <span className="font-mono text-xs">{summary.purchaseId}</span></div>
                <div>Created: {formatDateTime(summary.useDate)}</div>
                <div>Status: <span className="font-medium">{summary.status}</span></div>
              </div>
            </div>

            {/* Payment Button */}
            <div className="flex flex-col space-y-3">
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 h-12"
                onClick={handlePayNow}
                disabled={processingPayment || summary.status !== 'Pending'}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay Now - {formatPrice(summary.totalAmount, summary.currency)}
                  </>
                )}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                You will be redirected to VNPAY payment gateway to complete your payment securely.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <X className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Summary</h3>
            <p className="text-gray-600">Please try again or contact support if the problem persists.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
