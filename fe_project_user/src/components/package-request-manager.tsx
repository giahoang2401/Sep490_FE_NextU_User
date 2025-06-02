"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Eye, CheckCircle, XCircle, Clock, MapPin, Calendar, DollarSign, FileText } from "lucide-react"

interface PackageRequest {
  id: string
  fullName: string
  email: string
  phone: string
  location: string
  packageName: string
  duration: number
  totalPrice: number
  status: "pending" | "approved" | "rejected"
  requestDate: string
  moveInDate: string
  specialRequests?: string
  emergencyContact?: string
  emergencyPhone?: string
}

export function PackageRequestManager() {
  const [requests, setRequests] = useState<PackageRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<PackageRequest | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")

  useEffect(() => {
    // Load requests from localStorage and add some mock data
    const storedRequests = JSON.parse(localStorage.getItem("packageRequests") || "[]")
    const mockRequests = [
      {
        id: "req_001",
        fullName: "Nguyen Van A",
        email: "nguyenvana@email.com",
        phone: "+84 123 456 789",
        location: "hanoi",
        packageName: "Cùng tỉnh thức",
        duration: 6,
        totalPrice: 112800000,
        status: "pending",
        requestDate: "2024-01-15T10:30:00Z",
        moveInDate: "2024-02-01",
        specialRequests: "Vegetarian meals preferred",
        emergencyContact: "Nguyen Thi B",
        emergencyPhone: "+84 987 654 321",
      },
      {
        id: "req_002",
        fullName: "Tran Thi C",
        email: "tranthic@email.com",
        phone: "+84 111 222 333",
        location: "ho-chi-minh-city",
        packageName: "Cùng kiến tạo",
        duration: 3,
        totalPrice: 81000000,
        status: "pending",
        requestDate: "2024-01-14T15:45:00Z",
        moveInDate: "2024-01-25",
        specialRequests: "Need quiet workspace for writing",
        emergencyContact: "Le Van D",
        emergencyPhone: "+84 444 555 666",
      },
    ]

    setRequests([...storedRequests, ...mockRequests])
  }, [])

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || request.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleApprove = (requestId: string) => {
    setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "approved" as const } : req)))
    // Update localStorage
    const updatedRequests = requests.map((req) =>
      req.id === requestId ? { ...req, status: "approved" as const } : req,
    )
    localStorage.setItem("packageRequests", JSON.stringify(updatedRequests))
  }

  const handleReject = (requestId: string) => {
    setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "rejected" as const } : req)))
    // Update localStorage
    const updatedRequests = requests.map((req) =>
      req.id === requestId ? { ...req, status: "rejected" as const } : req,
    )
    localStorage.setItem("packageRequests", JSON.stringify(updatedRequests))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
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
            <FileText className="h-5 w-5" />
            Package Requests Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or email..."
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {request.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">{request.fullName}</h3>
                    <p className="text-slate-600">{request.email}</p>
                    <p className="text-sm text-slate-500">{request.phone}</p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(request.status)} text-white`}>
                  {getStatusIcon(request.status)}
                  <span className="ml-1 capitalize">{request.status}</span>
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Location</p>
                    <p className="font-medium capitalize">{request.location.replace("-", " ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Package</p>
                    <p className="font-medium">{request.packageName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Duration</p>
                    <p className="font-medium">{request.duration} months</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Total Price</p>
                    <p className="font-medium">₫{request.totalPrice.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  Requested: {new Date(request.requestDate).toLocaleDateString()} | Move-in:{" "}
                  {new Date(request.moveInDate).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Request Details - {request.fullName}</DialogTitle>
                      </DialogHeader>
                      {selectedRequest && (
                        <div className="space-y-6">
                          {/* Personal Information */}
                          <div>
                            <h4 className="font-semibold text-slate-800 mb-3">Personal Information</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-slate-500">Full Name</p>
                                <p className="font-medium">{selectedRequest.fullName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">Email</p>
                                <p className="font-medium">{selectedRequest.email}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">Phone</p>
                                <p className="font-medium">{selectedRequest.phone}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">Move-in Date</p>
                                <p className="font-medium">
                                  {new Date(selectedRequest.moveInDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Package Information */}
                          <div>
                            <h4 className="font-semibold text-slate-800 mb-3">Package Information</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-slate-500">Location</p>
                                <p className="font-medium capitalize">{selectedRequest.location.replace("-", " ")}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">Package</p>
                                <p className="font-medium">{selectedRequest.packageName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">Duration</p>
                                <p className="font-medium">{selectedRequest.duration} months</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">Total Price</p>
                                <p className="font-medium text-green-600">
                                  ₫{selectedRequest.totalPrice.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Emergency Contact */}
                          {selectedRequest.emergencyContact && (
                            <div>
                              <h4 className="font-semibold text-slate-800 mb-3">Emergency Contact</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-slate-500">Contact Name</p>
                                  <p className="font-medium">{selectedRequest.emergencyContact}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-slate-500">Contact Phone</p>
                                  <p className="font-medium">{selectedRequest.emergencyPhone}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Special Requests */}
                          {selectedRequest.specialRequests && (
                            <div>
                              <h4 className="font-semibold text-slate-800 mb-3">Special Requests</h4>
                              <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">
                                {selectedRequest.specialRequests}
                              </p>
                            </div>
                          )}

                          {/* Review Notes */}
                          <div>
                            <h4 className="font-semibold text-slate-800 mb-3">Review Notes</h4>
                            <Textarea
                              placeholder="Add notes about this request..."
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              className="rounded-xl"
                            />
                          </div>

                          {/* Action Buttons */}
                          {selectedRequest.status === "pending" && (
                            <div className="flex gap-3 pt-4">
                              <Button
                                className="flex-1 rounded-full bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  handleApprove(selectedRequest.id)
                                  setSelectedRequest(null)
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Request
                              </Button>
                              <Button
                                variant="destructive"
                                className="flex-1 rounded-full"
                                onClick={() => {
                                  handleReject(selectedRequest.id)
                                  setSelectedRequest(null)
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Request
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {request.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="rounded-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(request.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-full"
                        onClick={() => handleReject(request.id)}
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

      {filteredRequests.length === 0 && (
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Requests Found</h3>
            <p className="text-slate-600">No package requests match your current filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
