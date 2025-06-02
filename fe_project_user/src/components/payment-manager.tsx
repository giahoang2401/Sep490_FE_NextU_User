"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Search,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  DollarSign,
  Calendar,
  AlertTriangle,
  Download,
  RefreshCw,
} from "lucide-react"

interface Payment {
  id: string
  userId: string
  userName: string
  userEmail: string
  packageName: string
  amount: number
  status: "pending" | "confirmed" | "failed" | "refunded"
  paymentMethod: string
  transactionId?: string
  paymentDate: string
  confirmationDate?: string
  notes?: string
}

export function PaymentManager() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  useEffect(() => {
    // Mock payment data
    const mockPayments: Payment[] = [
      {
        id: "pay_001",
        userId: "user_001",
        userName: "Nguyen Van A",
        userEmail: "nguyenvana@email.com",
        packageName: "Cùng tỉnh thức - Hanoi",
        amount: 18800000,
        status: "pending",
        paymentMethod: "Bank Transfer",
        transactionId: "TXN123456789",
        paymentDate: "2024-01-15T14:30:00Z",
        notes: "Awaiting bank confirmation",
      },
      {
        id: "pay_002",
        userId: "user_002",
        userName: "Tran Thi B",
        userEmail: "tranthib@email.com",
        packageName: "Cùng kiến tạo - HCMC",
        amount: 27000000,
        status: "confirmed",
        paymentMethod: "QR Code",
        transactionId: "QR987654321",
        paymentDate: "2024-01-14T10:15:00Z",
        confirmationDate: "2024-01-14T10:20:00Z",
      },
      {
        id: "pay_003",
        userId: "user_003",
        userName: "Le Van C",
        userEmail: "levanc@email.com",
        packageName: "Cùng khám phá - Da Nang",
        amount: 12200000,
        status: "pending",
        paymentMethod: "Bank Transfer",
        transactionId: "TXN555666777",
        paymentDate: "2024-01-13T16:45:00Z",
        notes: "Customer uploaded payment proof",
      },
    ]
    setPayments(mockPayments)
  }, [])

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || payment.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleConfirmPayment = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment.id === paymentId
          ? { ...payment, status: "confirmed" as const, confirmationDate: new Date().toISOString() }
          : payment,
      ),
    )
  }

  const handleRejectPayment = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((payment) => (payment.id === paymentId ? { ...payment, status: "failed" as const } : payment)),
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "confirmed":
        return "bg-green-500"
      case "failed":
        return "bg-red-500"
      case "refunded":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "failed":
        return <XCircle className="h-4 w-4" />
      case "refunded":
        return <RefreshCw className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <Card className="rounded-2xl border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48 rounded-xl">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Pending</p>
                <p className="text-2xl font-bold">{payments.filter((p) => p.status === "pending").length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Confirmed</p>
                <p className="text-2xl font-bold">{payments.filter((p) => p.status === "confirmed").length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Failed</p>
                <p className="text-2xl font-bold">{payments.filter((p) => p.status === "failed").length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Amount</p>
                <p className="text-2xl font-bold">
                  ₫{(payments.reduce((sum, p) => sum + p.amount, 0) / 1000000).toFixed(0)}M
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPayments.map((payment) => (
          <Card key={payment.id} className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                      {payment.userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">{payment.userName}</h3>
                    <p className="text-slate-600">{payment.userEmail}</p>
                    <p className="text-sm text-slate-500">Transaction: {payment.transactionId}</p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(payment.status)} text-white`}>
                  {getStatusIcon(payment.status)}
                  <span className="ml-1 capitalize">{payment.status}</span>
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-500">Package</p>
                  <p className="font-medium">{payment.packageName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Amount</p>
                  <p className="font-medium text-green-600">₫{payment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Payment Method</p>
                  <p className="font-medium">{payment.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Payment Date</p>
                  <p className="font-medium">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                </div>
              </div>

              {payment.notes && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Notes:</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">{payment.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  {payment.confirmationDate && (
                    <>Confirmed: {new Date(payment.confirmationDate).toLocaleDateString()}</>
                  )}
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Payment Details - {payment.userName}</DialogTitle>
                      </DialogHeader>
                      {selectedPayment && (
                        <div className="space-y-6">
                          {/* Payment Information */}
                          <div>
                            <h4 className="font-semibold text-slate-800 mb-3">Payment Information</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-slate-500">Transaction ID</p>
                                <p className="font-medium">{selectedPayment.transactionId}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">Amount</p>
                                <p className="font-medium text-green-600">₫{selectedPayment.amount.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">Payment Method</p>
                                <p className="font-medium">{selectedPayment.paymentMethod}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">Status</p>
                                <Badge className={`${getStatusColor(selectedPayment.status)} text-white w-fit`}>
                                  {getStatusIcon(selectedPayment.status)}
                                  <span className="ml-1 capitalize">{selectedPayment.status}</span>
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Customer Information */}
                          <div>
                            <h4 className="font-semibold text-slate-800 mb-3">Customer Information</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-slate-500">Name</p>
                                <p className="font-medium">{selectedPayment.userName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">Email</p>
                                <p className="font-medium">{selectedPayment.userEmail}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">Package</p>
                                <p className="font-medium">{selectedPayment.packageName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">User ID</p>
                                <p className="font-medium">{selectedPayment.userId}</p>
                              </div>
                            </div>
                          </div>

                          {/* Timeline */}
                          <div>
                            <h4 className="font-semibold text-slate-800 mb-3">Payment Timeline</h4>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Calendar className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium">Payment Initiated</p>
                                  <p className="text-sm text-slate-500">
                                    {new Date(selectedPayment.paymentDate).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              {selectedPayment.confirmationDate && (
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">Payment Confirmed</p>
                                    <p className="text-sm text-slate-500">
                                      {new Date(selectedPayment.confirmationDate).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-4">
                            <Button variant="outline" className="flex-1 rounded-full">
                              <Download className="h-4 w-4 mr-2" />
                              Download Receipt
                            </Button>
                            {selectedPayment.status === "pending" && (
                              <>
                                <Button
                                  className="flex-1 rounded-full bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    handleConfirmPayment(selectedPayment.id)
                                    setSelectedPayment(null)
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirm Payment
                                </Button>
                                <Button
                                  variant="destructive"
                                  className="flex-1 rounded-full"
                                  onClick={() => {
                                    handleRejectPayment(selectedPayment.id)
                                    setSelectedPayment(null)
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject Payment
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {payment.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="rounded-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleConfirmPayment(payment.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-full"
                        onClick={() => handleRejectPayment(payment.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPayments.length === 0 && (
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <CreditCard className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Payments Found</h3>
            <p className="text-slate-600">No payments match your current filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
