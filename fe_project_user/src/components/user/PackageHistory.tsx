"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Package, MapPin, Clock, CheckCircle, CreditCard, XCircle, User, Calendar, DollarSign, FileText, Home, X, Loader2, Plus } from "lucide-react"
import { PaymentModal } from "@/components/payment-modal"
import api from '@/utils/axiosConfig'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog as ConfirmDialog, DialogContent as ConfirmDialogContent, DialogHeader as ConfirmDialogHeader, DialogTitle as ConfirmDialogTitle, DialogDescription as ConfirmDialogDescription } from "@/components/ui/dialog"

interface PackageHistory {
  requestId: string;
  fullName: string;
  originalPrice: number;
  requestedPackageName: string;
  packageType: string;
  finalPrice: number;
  expireAt?: string;
  startDate?: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentTime?: string;
  staffNote?: string;
  approvedAt?: string;
  packageId: string;
  createdAt: string;
  locationName: string;
  discountRate?: number;
  discountAmount?: number;
  roomInstanceId?: string;
  addOnsFee?: number;
  messageToStaff?: string;
  requireBooking?: boolean;
}

interface BasicPlanDetail {
  id: string;
  basicPlanTypeCode: string;
  entitlements: any[];
  planDurations: Array<{
    planDurationDescription: string;
  }>;
  planSource: string;
}

interface RoomDetail {
  id: string;
  roomCode: string;
  roomName: string;
  descriptionDetails: string;
  status: string;
  areaInSquareMeters: number;
  roomSizeName: string;
  roomViewName: string;
  roomFloorName: string;
  bedTypeName: string;
  numberOfBeds: number;
  roomTypeName: string;
  medias: Array<{
    id: string;
    url: string;
    type: string;
    description: string;
  }>;
}

interface EntitlementRule {
  id: string;
  entittlementRuleName: string;
  nextUServiceId: string;
  nextUServiceName: string;
  price: number;
  creditAmount: number;
  period: number;
  limitPerPeriod: number;
  note: string;
}

export default function PackageList() {
  const [packageRequests, setPackageRequests] = useState<PackageHistory[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<PackageHistory | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Single detail modal state
  const [showDetail, setShowDetail] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<PackageHistory | null>(null)
  const [basicPlanDetail, setBasicPlanDetail] = useState<BasicPlanDetail | null>(null)
  const [roomDetail, setRoomDetail] = useState<RoomDetail | null>(null)
  const [entitlementDetails, setEntitlementDetails] = useState<EntitlementRule[]>([])
  
  const [tab, setTab] = useState('all')
  const [detailLoading, setDetailLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [cancelSuccess, setCancelSuccess] = useState(false)
  const [cancelRequestId, setCancelRequestId] = useState<string | null>(null)
  
  // Renewal state
  const [showRenewalDialog, setShowRenewalDialog] = useState(false)
  const [selectedRenewalRequest, setSelectedRenewalRequest] = useState<PackageHistory | null>(null)
  const [processingRenewal, setProcessingRenewal] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true)
      try {
        const res = await api.get('/api/user/memberships/history')
        setPackageRequests(res.data || [])
      } catch (err) {
        setPackageRequests([])
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-500"
      case "pendingpayment":
        return "bg-orange-500"
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "cancelled":
        return "bg-red-600"
      case "completed":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "pendingpayment":
        return <CreditCard className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handlePayment = (packageRequest: PackageHistory) => {
    setSelectedPackage(packageRequest)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    setSelectedPackage(null)
    // Refetch history after payment
    setLoading(true)
    api.get('/api/user/memberships/history').then(res => {
      setPackageRequests(res.data || [])
      setLoading(false)
    })
  }

  const handleInitPayment = async (request: PackageHistory) => {
    try {
      const res = await api.post('/api/payments/create', {
        RequestId: request.requestId,
        PaymentMethod: 'VNPAY',
        ReturnUrl: '',
        IsDirectMembership: false,
        IsEventTicket: false,
        IsExtend: false,
        MembershipId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        Amount: 0,
        PackageId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        PackageType: ""
      });
      const redirectUrl = res.data?.Data?.redirectUrl;
      if (redirectUrl) {
        if (typeof window !== 'undefined') {
          window.location.href = redirectUrl;
        }
      } else {
        alert('Không lấy được link thanh toán!');
      }
    } catch (err) {
      alert('Khởi tạo thanh toán thất bại!');
    }
  }

  // Single detail modal handler
  const handleShowDetail = async (request: PackageHistory) => {
    setSelectedRequest(request)
    setShowDetail(true)
    setDetailLoading(true)
    setBasicPlanDetail(null)
    setRoomDetail(null)
    setEntitlementDetails([])
    
    try {
      // Fetch package details
      if (request.packageId) {
        const packageRes = await api.get(`/api/membership/BasicPlans/${request.packageId}`)
        setBasicPlanDetail(packageRes.data)
        
        // Fetch entitlement details if basic plan has entitlements
        if (packageRes.data?.entitlements && packageRes.data.entitlements.length > 0) {
          const entitlementPromises = packageRes.data.entitlements.map(async (entitlement: any) => {
            try {
              const entitlementRes = await api.get(`/api/EntitlementRule/${entitlement.entitlementId}`)
              return entitlementRes.data
            } catch (e) {
              console.error('Error fetching entitlement:', e)
              return null
            }
          })
          
          const entitlements = await Promise.all(entitlementPromises)
          setEntitlementDetails(entitlements.filter(Boolean))
        }
      }
      
      // Fetch room details if requireBooking is true
      if (request.requireBooking && request.roomInstanceId) {
        const roomRes = await api.get(`/api/membership/RoomInstances/${request.roomInstanceId}`)
        setRoomDetail(roomRes.data)
      }
    } catch (e) {
      console.error('Error fetching details:', e)
    } finally {
      setDetailLoading(false)
    }
  }

  const filterPackages = (list: PackageHistory[]) => {
    switch(tab) {
      case 'basic': return list.filter(p => p.packageType?.toLowerCase() === 'basic')
      case 'combo': return list.filter(p => p.packageType?.toLowerCase() === 'combo')
      case 'pending': return list.filter(p => p.status?.toLowerCase() === 'pending')
      case 'pendingpayment': return list.filter(p => p.status?.toLowerCase() === 'pendingpayment')
      case 'completed': return list.filter(p => p.status?.toLowerCase() === 'completed')
      case 'cancelled': return list.filter(p => p.status?.toLowerCase() === 'cancelled')
      default: return list
    }
  }

  const handleCancelRequest = (requestId: string) => {
    setCancelRequestId(requestId)
    setShowCancelDialog(true)
  }

  const confirmCancelRequest = async () => {
    if (!cancelRequestId) return
    setCanceling(true)
    try {
      await api.delete(`/api/user/memberships/${cancelRequestId}`)
      setCancelSuccess(true)
      // Refetch history after cancel
      setLoading(true)
      const res = await api.get('/api/user/memberships/history')
      setPackageRequests(res.data || [])
      setLoading(false)
    } catch (err) {
      alert('Cancel failed!')
    } finally {
      setCanceling(false)
      setShowCancelDialog(false)
      setCancelRequestId(null)
    }
  }

  const handleRenewalClick = (request: PackageHistory) => {
    setSelectedRenewalRequest(request)
    setShowRenewalDialog(true)
  }



  const confirmRenewal = async () => {
    if (!selectedRenewalRequest) return
    
    try {
      setProcessingRenewal(selectedRenewalRequest.requestId)
      
      const renewalRequest = {
        paymentMethod: "VNPAY",
        redirectUrl: ""
      }

      const response = await api.post(`/api/user/memberships/${selectedRenewalRequest.requestId}/extend-init`, renewalRequest)
      
      if (response.status === 200 || response.status === 201) {
        const responseData = response.data
        
        if (responseData.paymentUrl?.redirectUrl) {
          alert('Redirecting to payment gateway for renewal...')
          
          // Redirect to VNPAY payment gateway
          window.location.href = responseData.paymentUrl.redirectUrl
        } else {
          alert('Renewal initialization failed. Please try again.')
        }
      }
    } catch (error: any) {
      console.error('Renewal error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to initiate renewal. Please try again.'
      alert(errorMessage)
    } finally {
      setProcessingRenewal(null)
      setShowRenewalDialog(false)
      setSelectedRenewalRequest(null)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading...</div>
  }

  // Tính toán thống kê
  const totalPackages = packageRequests.length;
  const pendingPayment = packageRequests.filter(p => p.status?.toLowerCase() === 'pendingpayment').length;
  const completed = packageRequests.filter(p => p.status?.toLowerCase() === 'completed').length;
  const processing = packageRequests.filter(p => p.status?.toLowerCase() === 'pending' || p.status?.toLowerCase() === 'approved').length;
  const cancelled = packageRequests.filter(p => p.status?.toLowerCase() === 'cancelled').length;

  return (
    <div className="space-y-6 w-full max-w-full px-0 md:px-2">
      {/* Dashboard thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex flex-col items-center justify-center py-6 shadow">
          <span className="text-4xl mb-2">📦</span>
          <span className="text-3xl font-bold">{totalPackages}</span>
          <span className="text-base mt-1">Total Packages</span>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-orange-300 to-orange-500 text-white flex flex-col items-center justify-center py-6 shadow">
          <span className="text-4xl mb-2">⏳</span>
          <span className="text-3xl font-bold">{pendingPayment}</span>
          <span className="text-base mt-1">Pending Payment</span>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-green-400 to-green-600 text-white flex flex-col items-center justify-center py-6 shadow">
          <span className="text-4xl mb-2">✅</span>
          <span className="text-3xl font-bold">{completed}</span>
          <span className="text-base mt-1">Completed</span>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 text-white flex flex-col items-center justify-center py-6 shadow">
          <span className="text-4xl mb-2">🔄</span>
          <span className="text-3xl font-bold">{processing}</span>
          <span className="text-base mt-1">Processing</span>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-red-400 to-red-600 text-white flex flex-col items-center justify-center py-6 shadow">
          <span className="text-4xl mb-2">❌</span>
          <span className="text-3xl font-bold">{cancelled}</span>
          <span className="text-base mt-1">Cancelled</span>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="combo">Combo</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="pendingpayment">Pending Payment</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {filterPackages(packageRequests).length === 0 ? (
        <Card className="rounded-2xl border-0 shadow-lg w-full">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Packages</h3>
            <p className="text-slate-600 mb-6">You haven't purchased any packages yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filterPackages(packageRequests).map((request) => (
            <Card key={request.requestId} className="w-full h-full flex flex-col justify-between rounded-2xl border-0 shadow-lg cursor-pointer transition hover:shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50" onClick={() => handleShowDetail(request)}>
              <CardHeader className="p-6 pb-2">
                {/* Status Badge */}
                <div className="flex justify-end w-full mb-3">
                  <Badge className={`${getStatusColor(request.status)} text-white text-xs px-3 py-1`}>
                    {getStatusIcon(request.status)}
                    <span className="ml-1 capitalize">{request.status}</span>
                  </Badge>
                </div>

                {/* Package Header */}
                <div className="flex items-center gap-3 w-full mb-3">
                  <Package className="h-8 w-8 text-blue-500" />
                  <Badge className="text-xs px-3 py-1 bg-blue-500 text-white">
                    {request.packageType?.toUpperCase()}
                  </Badge>
                  <CardTitle className="text-lg font-bold break-words flex-1">
                    {request.requestedPackageName}
                  </CardTitle>
                </div>

                {/* Location */}
                <p className="text-slate-600 text-sm flex items-center gap-1 mb-3">
                  <MapPin className="h-4 w-4" />
                  {request.locationName}
                </p>

                {/* User Info */}
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">{request.fullName}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0 flex-1">
                {/* Pricing Information */}
                <div className="bg-white rounded-lg p-3 border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-500">Original Price</span>
                    <span className="text-sm font-semibold text-slate-700">₫{request.originalPrice?.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-800">Final Price</span>
                      <span className="text-lg font-bold text-blue-600">₫{request.finalPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center bg-white rounded-lg p-2 border">
                    <Calendar className="h-4 w-4 text-slate-500 mx-auto mb-1" />
                    <span className="block text-xs text-slate-500">Start Date</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {request.startDate ? new Date(request.startDate).toLocaleDateString() : '-'}
                    </span>
                  </div>
                  <div className="text-center bg-white rounded-lg p-2 border">
                    <Clock className="h-4 w-4 text-slate-500 mx-auto mb-1" />
                    <span className="block text-xs text-slate-500">Expire Date</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {request.expireAt ? new Date(request.expireAt).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </div>

                {/* Status-specific content */}
                {request.status?.toLowerCase() === "completed" && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Payment completed. Welcome to Next Universe!</AlertDescription>
                  </Alert>
                )}

                {request.status?.toLowerCase() === 'pendingpayment' && (
                  <Alert className="bg-orange-50 border-orange-200">
                    <Clock className="h-4 w-4" />
                    <AlertDescription>Your package is pending payment. Please proceed to payment.</AlertDescription>
                  </Alert>
                )}

                {request.status?.toLowerCase() === 'cancelled' && (
                  <Alert className="bg-red-50 border-red-200">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>This request has been cancelled.</AlertDescription>
                  </Alert>
                )}
              </CardContent>

              <CardFooter className="flex justify-end gap-2 pt-0 mt-auto">
                {(request.status?.toLowerCase() === 'pending' || request.status?.toLowerCase() === 'pendingpayment') && (
                  <Button variant="destructive" onClick={e => { e.stopPropagation(); handleCancelRequest(request.requestId); }}>
                    Cancel
                  </Button>
                )}
                {request.status?.toLowerCase() === 'pendingpayment' && (
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={e => { e.stopPropagation(); handleInitPayment(request); }}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                )}
                {request.status?.toLowerCase() === 'completed' && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={e => { e.stopPropagation(); handleRenewalClick(request); }}
                    disabled={processingRenewal === request.requestId}
                  >
                    {processingRenewal === request.requestId ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {processingRenewal === request.requestId ? 'Processing...' : 'Renew'}
                  </Button>
                )}
                <Button variant="outline" onClick={e => { e.stopPropagation(); handleShowDetail(request); }}>
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        packageData={selectedPackage}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Single Detail Modal - Package + Room Information */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Package Details
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowDetail(false)}
              className="absolute right-4 top-4 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          {detailLoading && (
            <div className="text-center py-12 text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              Loading details...
            </div>
          )}
          
          {!detailLoading && selectedRequest && (
            <div className="space-y-6">
              {/* Request Summary with Pricing */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {selectedRequest.requestedPackageName}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(selectedRequest.status)} text-white text-xs px-2 py-1`}>
                      {selectedRequest.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      {selectedRequest.packageType?.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                {/* Pricing inline */}
                <div className="flex items-center gap-6 mb-3 text-sm">
                  <div>
                    <span className="text-slate-500">Original:</span>
                    <span className="ml-2 font-medium">₫{selectedRequest.originalPrice?.toLocaleString()}</span>
                  </div>
                  {selectedRequest.addOnsFee && selectedRequest.addOnsFee > 0 && (
                    <div>
                      <span className="text-slate-500">Add-ons:</span>
                      <span className="ml-2 font-medium text-purple-600">₫{selectedRequest.addOnsFee?.toLocaleString()}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500">Final:</span>
                    <span className="ml-2 font-semibold text-blue-600">₫{selectedRequest.finalPrice?.toLocaleString()}</span>
                  </div>
                  {selectedRequest.discountRate && selectedRequest.discountRate > 0 && (
                    <div>
                      <span className="text-slate-500">Discount:</span>
                      <span className="ml-2 font-medium text-green-600">{selectedRequest.discountRate}%</span>
                    </div>
                  )}
                  {selectedRequest.discountAmount && selectedRequest.discountAmount > 0 && (
                    <div>
                      <span className="text-slate-500">Saved:</span>
                      <span className="ml-2 font-medium text-green-600">₫{selectedRequest.discountAmount?.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Location:</span>
                    <span className="ml-2 font-medium">{selectedRequest.locationName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Created:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedRequest.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Start Date:</span>
                    <span className="ml-2 font-medium">
                      {selectedRequest.startDate ? new Date(selectedRequest.startDate).toLocaleDateString() : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Expire Date:</span>
                    <span className="ml-2 font-medium">
                      {selectedRequest.expireAt ? new Date(selectedRequest.expireAt).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </div>
                
                {selectedRequest.paymentMethod && (
                  <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Payment Method:</span>
                      <span className="ml-2 font-medium">{selectedRequest.paymentMethod}</span>
                    </div>
                    {selectedRequest.paymentTime && (
                      <div>
                        <span className="text-slate-500">Payment Time:</span>
                        <span className="ml-2 font-medium">
                          {new Date(selectedRequest.paymentTime).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Package Information */}
              {basicPlanDetail && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Package Information</h3>
                  
                  {/* Package Type Badge */}
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={`${
                      selectedRequest?.packageType?.toLowerCase() === 'combo' 
                        ? 'bg-purple-500' 
                        : 'bg-blue-500'
                    } text-white`}>
                      {selectedRequest?.packageType?.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className={
                      selectedRequest?.requireBooking ? 'border-green-500 text-green-600' : 'border-orange-500 text-orange-600'
                    }>
                      {selectedRequest?.requireBooking ? 'With Room Booking' : 'Without Room Booking'}
                    </Badge>
                  </div>
                  
                  {/* Basic Package Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Type Code:</span>
                          <span className="font-medium">{basicPlanDetail.basicPlanTypeCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Plan Source:</span>
                          <span className="font-medium">{basicPlanDetail.planSource}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-slate-500 mb-2">Plan Duration:</div>
                      {basicPlanDetail.planDurations && basicPlanDetail.planDurations.length > 0 && (
                        <div className="space-y-1">
                          {basicPlanDetail.planDurations.map((duration, idx) => (
                            <div key={idx} className="bg-slate-50 rounded px-3 py-2 text-sm font-medium">
                              {duration.planDurationDescription}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Entitlements */}
                  {entitlementDetails && entitlementDetails.length > 0 && (
                    <div className="mb-4 pt-4 border-t">
                      <div className="text-sm text-slate-500 mb-2">Entitlements:</div>
                      <div className="space-y-3">
                        {entitlementDetails.map((entitlement, idx) => (
                          <div key={idx} className="bg-slate-50 rounded-lg p-4 border">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-slate-800">{entitlement.entittlementRuleName}</h5>
                              <Badge variant="outline" className="text-xs">
                                {entitlement.nextUServiceName}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <span className="text-slate-500">Price:</span>
                                <span className="ml-2 font-medium">₫{entitlement.price?.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">Credit Amount:</span>
                                <span className="ml-2 font-medium">{entitlement.creditAmount}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">Period:</span>
                                <span className="ml-2 font-medium">{entitlement.period || 'Unlimited'}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">Limit/Period:</span>
                                <span className="ml-2 font-medium">{entitlement.limitPerPeriod || 'Unlimited'}</span>
                              </div>
                            </div>
                            {entitlement.note && (
                              <div className="mt-2 pt-2 border-t">
                                <span className="text-slate-500 text-sm">Note:</span>
                                <span className="ml-2 text-sm">{entitlement.note}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}



                  {/* Room Information as part of Package */}
                  {roomDetail && (
                    <div className="pt-4 border-t">
                      <h4 className="text-md font-semibold text-slate-800 mb-4">Room Details</h4>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Image Gallery */}
                        <div className="space-y-4">
                          {/* Main Image */}
                          <div className="relative aspect-[4/3] rounded-lg overflow-hidden border bg-slate-100">
                            {roomDetail.medias && roomDetail.medias.length > 0 ? (
                              <>
                                <img 
                                  src={roomDetail.medias[currentImageIndex].url} 
                                  alt={roomDetail.medias[currentImageIndex].description || 'Room image'}
                                  className="w-full h-full object-cover"
                                />
                                {/* Image Counter */}
                                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                  {currentImageIndex + 1}/{roomDetail.medias.length}
                                </div>
                                {/* Navigation Arrows */}
                                {roomDetail.medias.length > 1 && (
                                  <>
                                    <button 
                                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 p-2 rounded-full shadow-lg transition-all"
                                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? roomDetail.medias.length - 1 : prev - 1))}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                      </svg>
                                    </button>
                                    <button 
                                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 p-2 rounded-full shadow-lg transition-all"
                                      onClick={() => setCurrentImageIndex((prev) => (prev === roomDetail.medias.length - 1 ? 0 : prev + 1))}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </button>
                                  </>
                                )}
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Thumbnail Navigation */}
                          {roomDetail.medias && roomDetail.medias.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                              {roomDetail.medias.map((media, idx) => (
                                <div 
                                  key={idx} 
                                  className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                                    currentImageIndex === idx ? 'border-blue-500' : 'border-transparent hover:border-blue-300'
                                  }`}
                                  onClick={() => setCurrentImageIndex(idx)}
                                >
                                  <img 
                                    src={media.url} 
                                    alt={media.description || `Room thumbnail ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Right: Room Details */}
                        <div className="space-y-4">
                          {/* Combined Description and Room Specifications */}
                          <div className="bg-white border rounded-lg p-4">
                            {/* Description Section */}
                            <div className="mb-4">
                              <h5 className="font-semibold text-slate-800 mb-3">Description</h5>
                              <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700">
                                {roomDetail.descriptionDetails || 'No description available'}
                              </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-slate-200 mb-4"></div>

                            {/* Room Specifications Section */}
                            <div>
                              <h5 className="font-semibold text-slate-800 mb-3">Room Specifications</h5>
                              
                              {/* Room Specifications in 4 rows with 2 columns each */}
                              <div className="space-y-3 text-sm">
                                {/* Row 1: Room Code | Room Type */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="flex justify-between items-center gap-3">
                                    <span className="text-slate-500">Room Code:</span>
                                    <span className="font-medium">{roomDetail.roomCode}</span>
                                  </div>
                                  <div className="flex justify-between items-center gap-3">
                                    <span className="text-slate-500">Room Type:</span>
                                    <span 
                                      className="font-medium text-right truncate min-w-0 max-w-[70%] cursor-pointer hover:text-blue-600 transition-colors" 
                                      title={`Click to see full: ${roomDetail.roomTypeName}`}
                                      onClick={() => {
                                        if (roomDetail.roomTypeName.length > 15) {
                                          alert(`Full Room Type: ${roomDetail.roomTypeName}`);
                                        }
                                      }}
                                    >
                                      {roomDetail.roomTypeName}
                                    </span>
                                  </div>
                                </div>

                                {/* Row 2: Area | View */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Area:</span>
                                    <span className="font-medium">{roomDetail.areaInSquareMeters} m²</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500">View:</span>
                                    <span className="font-medium">{roomDetail.roomViewName}</span>
                                  </div>
                                </div>

                                {/* Row 3: Size | Floor */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Size:</span>
                                    <span className="font-medium">{roomDetail.roomSizeName}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Floor:</span>
                                    <span className="font-medium">{roomDetail.roomFloorName}</span>
                                  </div>
                                </div>

                                {/* Row 4: Bed Type | Number of Beds */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Bed Type:</span>
                                    <span className="font-medium">{roomDetail.bedTypeName}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Number of Beds:</span>
                                    <span className="font-medium">{roomDetail.numberOfBeds}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Staff Notes */}
              {selectedRequest.staffNote && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Staff Notes</h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                    {selectedRequest.staffNote}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <ConfirmDialogContent className="max-w-sm">
          <ConfirmDialogHeader>
            <ConfirmDialogTitle>Cancel Request</ConfirmDialogTitle>
            <ConfirmDialogDescription>
              Are you sure you want to cancel this request?
            </ConfirmDialogDescription>
          </ConfirmDialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={canceling}>No</Button>
            <Button variant="destructive" onClick={confirmCancelRequest} disabled={canceling}>{canceling ? 'Cancelling...' : 'Yes'}</Button>
          </div>
        </ConfirmDialogContent>
      </ConfirmDialog>

      {/* Cancel Success Dialog */}
      <ConfirmDialog open={cancelSuccess} onOpenChange={setCancelSuccess}>
        <ConfirmDialogContent className="max-w-sm">
          <ConfirmDialogHeader>
            <ConfirmDialogTitle>Cancel successfully</ConfirmDialogTitle>
            <ConfirmDialogDescription>
              Your request has been cancelled successfully.
            </ConfirmDialogDescription>
          </ConfirmDialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setCancelSuccess(false)}>OK</Button>
          </div>
        </ConfirmDialogContent>
      </ConfirmDialog>

      {/* Renewal Confirmation Dialog */}
      <ConfirmDialog open={showRenewalDialog} onOpenChange={setShowRenewalDialog}>
        <ConfirmDialogContent className="max-w-md">
          <ConfirmDialogHeader>
            <ConfirmDialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Renew Membership
            </ConfirmDialogTitle>
            <ConfirmDialogDescription>
              Are you sure you want to renew this membership?
            </ConfirmDialogDescription>
          </ConfirmDialogHeader>
          
          {selectedRenewalRequest && (
            <div className="bg-slate-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-slate-800 mb-3">{selectedRenewalRequest.requestedPackageName}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Package Type:</span>
                  <span className="font-medium">{selectedRenewalRequest.packageType?.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Price:</span>
                  <span className="font-semibold text-blue-600">₫{selectedRenewalRequest.finalPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-medium">{selectedRenewalRequest.locationName}</span>
                </div>

              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowRenewalDialog(false)}
              disabled={processingRenewal !== null}
            >
              No, Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={confirmRenewal}
              disabled={processingRenewal !== null}
            >
              {processingRenewal ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Yes, Renew
                </>
              )}
            </Button>
          </div>
        </ConfirmDialogContent>
      </ConfirmDialog>
    </div>
  )
}

