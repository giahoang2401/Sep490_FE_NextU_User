"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Package, MapPin, Clock, CheckCircle, CreditCard, XCircle, Download, QrCode } from "lucide-react"
import { PaymentModal } from "@/components/payment-modal"
import api from '@/utils/axiosConfig'

interface PackageHistory {
  requestId: string;
  fullName: string;
  requestedPackageName: string;
  packageType: string;
  amount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentTime?: string;
  staffNote?: string;
  approvedAt?: string;
  messageToStaff?: string;
  createdAt: string;
  locationName: string;
  moveInDate?: string;
}

export default function PackageList() {
  const [packageRequests, setPackageRequests] = useState<PackageHistory[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<PackageHistory | null>(null)
  const [loading, setLoading] = useState(true)

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
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "paid":
      case "Completed":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "paid":
      case "Completed":
        return <CreditCard className="h-4 w-4" />
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
    api.get('/user/memberships/history').then(res => {
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
        IsDirectMembership: false
      });
      const redirectUrl = res.data?.Data?.redirectUrl;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        alert('Không lấy được link thanh toán!');
      }
    } catch (err) {
      alert('Khởi tạo thanh toán thất bại!');
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {packageRequests.length === 0 ? (
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Package Requests</h3>
            <p className="text-slate-600 mb-6">You haven't requested any packages yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {packageRequests.map((request) => (
            <Card key={request.requestId} className="rounded-2xl border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {request.requestedPackageName}
                    </CardTitle>
                    <p className="text-slate-600 capitalize">{request.locationName}</p>
                  </div>
                  <Badge className={`${getStatusColor(request.status)} text-white`}>
                    {getStatusIcon(request.status)}
                    <span className="ml-1 capitalize">{request.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm text-slate-600">Amount</Label>
                    <p className="font-semibold">₫{request.amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Request Date</Label>
                    <p className="font-semibold">{new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Status</Label>
                    <p className="font-semibold">{request.status}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Payment</Label>
                    <p className="font-semibold">{request.paymentStatus}</p>
                  </div>
                </div>

                {request.status === "pending" && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <Clock className="h-4 w-4" />
                    <AlertDescription>Your request is being reviewed. Please wait.</AlertDescription>
                  </Alert>
                )}

                {/* Combo: chỉ hiện nút thanh toán khi approved và chưa paid */}
                {request.packageType === 'combo' && request.status === "approved" && request.paymentStatus !== 'Paid' && (
                  <div className="space-y-4">
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>Your package is approved. Proceed with payment.</AlertDescription>
                    </Alert>
                    <Button
                      className="rounded-full bg-green-600 hover:bg-green-700"
                      onClick={() => handlePayment(request)}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now - ₫{request.amount?.toLocaleString()}
                    </Button>
                  </div>
                )}

                {/* Combo: hiện nút khởi tạo thanh toán khi PendingPayment */}
                {request.packageType === 'combo' && request.status === 'PendingPayment' && (
                  <div className="space-y-4">
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <Clock className="h-4 w-4" />
                      <AlertDescription>Your package is pending payment. Please proceed to payment.</AlertDescription>
                    </Alert>
                    <Button
                      className="rounded-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleInitPayment(request)}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Khởi tạo thanh toán
                    </Button>
                  </div>
                )}

                {/* Basic: đã thanh toán */}
                {(request.packageType === 'basic' && (request.paymentStatus === 'Paid' || request.status === 'Completed')) && (
                  <div className="space-y-4">
                    <Alert className="bg-blue-50 border-blue-200">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>Payment completed. Welcome to Next Universe!</AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Combo đã thanh toán */}
                {request.packageType === 'combo' && (request.paymentStatus === 'Paid' || request.status === 'Completed') && (
                  <div className="space-y-4">
                    <Alert className="bg-blue-50 border-blue-200">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>Payment completed. Welcome to Next Universe!</AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Rejected */}
                {request.status === "rejected" && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>Your request was rejected. Please contact support.</AlertDescription>
                  </Alert>
                )}
              </CardContent>
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
    </div>
  )
}
