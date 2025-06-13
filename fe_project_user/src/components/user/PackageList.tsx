"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Package, MapPin, Clock, CheckCircle, CreditCard, XCircle, Download, QrCode } from "lucide-react"
import { PaymentModal } from "@/components/payment-modal"

interface PackageRequest {
  id: string
  fullName: string
  email: string
  phone: string
  location: string
  packageId: string
  packageName: string
  duration: number
  totalPrice: number
  status: "pending" | "approved" | "rejected" | "paid"
  requestDate: string
  approvedDate?: string
  moveInDate: string
}

export default function PackageList() {
  const [packageRequests, setPackageRequests] = useState<PackageRequest[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<PackageRequest | null>(null)

  useEffect(() => {
    const requests = JSON.parse(localStorage.getItem("packageRequests") || "[]")
    const updatedRequests = requests.map((req: PackageRequest, index: number) => {
      if (index === 0) {
        return { ...req, status: "approved", approvedDate: new Date().toISOString() }
      }
      return req
    })
    setPackageRequests(updatedRequests)
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
        return <CreditCard className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handlePayment = (packageRequest: PackageRequest) => {
    setSelectedPackage(packageRequest)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    if (selectedPackage) {
      const updatedRequests = packageRequests.map((req) =>
        req.id === selectedPackage.id ? { ...req, status: "paid" as const } : req
      )
      setPackageRequests(updatedRequests)
      localStorage.setItem("packageRequests", JSON.stringify(updatedRequests))
    }
    setShowPaymentModal(false)
    setSelectedPackage(null)
  }

  return (
    <div className="space-y-6">
      {packageRequests.length === 0 ? (
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Package Requests</h3>
            <p className="text-slate-600 mb-6">You haven't requested any packages yet.</p>
            <Button className="rounded-full bg-slate-800 hover:bg-slate-700">Request a Package</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {packageRequests.map((request) => (
            <Card key={request.id} className="rounded-2xl border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {request.packageName}
                    </CardTitle>
                    <p className="text-slate-600 capitalize">{request.location.replace("-", " ")}</p>
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
                    <Label className="text-sm text-slate-600">Duration</Label>
                    <p className="font-semibold">{request.duration} month{request.duration > 1 ? "s" : ""}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Total Price</Label>
                    <p className="font-semibold">₫{request.totalPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Request Date</Label>
                    <p className="font-semibold">{new Date(request.requestDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Move-in Date</Label>
                    <p className="font-semibold">{new Date(request.moveInDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {request.status === "pending" && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <Clock className="h-4 w-4" />
                    <AlertDescription>Your request is being reviewed. Please wait.</AlertDescription>
                  </Alert>
                )}

                {request.status === "approved" && (
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
                      Pay Now - ₫{request.totalPrice.toLocaleString()}
                    </Button>
                  </div>
                )}

                {request.status === "paid" && (
                  <div className="space-y-4">
                    <Alert className="bg-blue-50 border-blue-200">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>Payment completed. Welcome to Next Universe!</AlertDescription>
                    </Alert>
                    <div className="flex gap-2">
                      <Button variant="outline" className="rounded-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Receipt
                      </Button>
                      <Button variant="outline" className="rounded-full">
                        <QrCode className="h-4 w-4 mr-2" />
                        Access QR Code
                      </Button>
                    </div>
                  </div>
                )}

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
