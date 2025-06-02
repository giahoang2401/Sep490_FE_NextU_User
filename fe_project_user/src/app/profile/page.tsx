"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  QrCode,
  Download,
} from "lucide-react"
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

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [packageRequests, setPackageRequests] = useState<PackageRequest[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<PackageRequest | null>(null)

  useEffect(() => {
    // Load user data (mock)
    const userData = {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+84 123 456 789",
      avatar: "/placeholder.svg?height=100&width=100",
      joinDate: "2024-01-15",
      membershipLevel: "Explorer",
    }
    setUser(userData)

    // Load package requests from localStorage
    const requests = JSON.parse(localStorage.getItem("packageRequests") || "[]")

    // Simulate some approved packages for demo
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
        req.id === selectedPackage.id ? { ...req, status: "paid" as const } : req,
      )
      setPackageRequests(updatedRequests)
      localStorage.setItem("packageRequests", JSON.stringify(updatedRequests))
    }
    setShowPaymentModal(false)
    setSelectedPackage(null)
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">My Profile</h1>
          <p className="text-lg text-slate-600">Manage your account and package subscriptions</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-white/50 backdrop-blur-sm p-2 mb-8">
            <TabsTrigger value="profile" className="rounded-xl">
              <User className="h-4 w-4 mr-2" />
              Profile Information
            </TabsTrigger>
            <TabsTrigger value="packages" className="rounded-xl">
              <Package className="h-4 w-4 mr-2" />
              My Packages
            </TabsTrigger>
          </TabsList>

          {/* Profile Information Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <Card className="lg:col-span-1 rounded-2xl border-0 shadow-lg">
                <CardHeader className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{user.name}</CardTitle>
                  <Badge className="w-fit mx-auto bg-blue-500">{user.membershipLevel}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                  </div>
                  <Button variant="outline" className="w-full rounded-full" onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Profile Details */}
              <Card className="lg:col-span-2 rounded-2xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={user.name} disabled={!isEditing} className="rounded-xl" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={user.email} disabled={!isEditing} className="rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={user.phone} disabled={!isEditing} className="rounded-xl" />
                    </div>
                    <div>
                      <Label htmlFor="membership">Membership Level</Label>
                      <Input id="membership" value={user.membershipLevel} disabled className="rounded-xl" />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-4 pt-4">
                      <Button className="rounded-full bg-slate-800 hover:bg-slate-700">Save Changes</Button>
                      <Button variant="outline" className="rounded-full" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages">
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
                            <p className="font-semibold">
                              {request.duration} month{request.duration > 1 ? "s" : ""}
                            </p>
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
                            <AlertDescription>
                              Your request is being reviewed by our staff. We'll notify you within 24 hours.
                            </AlertDescription>
                          </Alert>
                        )}

                        {request.status === "approved" && (
                          <div className="space-y-4">
                            <Alert className="bg-green-50 border-green-200">
                              <CheckCircle className="h-4 w-4" />
                              <AlertDescription>
                                Congratulations! Your package request has been approved. You can now proceed with
                                payment.
                              </AlertDescription>
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
                              <AlertDescription>
                                Payment completed! Your package is now active. Welcome to Next Universe!
                              </AlertDescription>
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
                            <AlertDescription>
                              Unfortunately, your request was not approved. Please contact our support team for more
                              information.
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        packageData={selectedPackage}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
