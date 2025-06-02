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
import { Search, AlertTriangle, MessageCircle, Clock, CheckCircle, XCircle, Eye, Send, Calendar } from "lucide-react"

interface SupportTicket {
  id: string
  userId: string
  userName: string
  userEmail: string
  subject: string
  description: string
  category: "payment" | "technical" | "general" | "package" | "urgent"
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in_progress" | "resolved" | "closed"
  createdDate: string
  lastUpdated: string
  assignedTo?: string
  responses: Array<{
    id: string
    author: string
    message: string
    timestamp: string
    isStaff: boolean
  }>
}

export function SupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [responseMessage, setResponseMessage] = useState("")

  useEffect(() => {
    // Mock support tickets data
    const mockTickets: SupportTicket[] = [
      {
        id: "ticket_001",
        userId: "user_001",
        userName: "Nguyen Van A",
        userEmail: "nguyenvana@email.com",
        subject: "Payment verification needed",
        description: "I made a payment yesterday but my package status is still pending. Can you please check?",
        category: "payment",
        priority: "high",
        status: "open",
        createdDate: "2024-01-15T10:30:00Z",
        lastUpdated: "2024-01-15T10:30:00Z",
        responses: [],
      },
      {
        id: "ticket_002",
        userId: "user_002",
        userName: "Tran Thi B",
        userEmail: "tranthib@email.com",
        subject: "Cannot access co-working space",
        description:
          "My access card is not working for the co-working area. I tried multiple times but the door won't open.",
        category: "technical",
        priority: "medium",
        status: "in_progress",
        createdDate: "2024-01-14T15:45:00Z",
        lastUpdated: "2024-01-15T09:20:00Z",
        assignedTo: "staff_service",
        responses: [
          {
            id: "resp_001",
            author: "Staff Support",
            message:
              "Hi Tran Thi B, I've checked your access permissions and they seem to be active. Let me contact the technical team to check the card reader.",
            timestamp: "2024-01-15T09:20:00Z",
            isStaff: true,
          },
        ],
      },
      {
        id: "ticket_003",
        userId: "user_003",
        userName: "Le Van C",
        userEmail: "levanc@email.com",
        subject: "Request for package upgrade",
        description: "I would like to upgrade from 'Cùng khám phá' to 'Cùng tỉnh thức' package. What's the process?",
        category: "package",
        priority: "low",
        status: "resolved",
        createdDate: "2024-01-13T11:15:00Z",
        lastUpdated: "2024-01-14T16:30:00Z",
        assignedTo: "staff_onboarding",
        responses: [
          {
            id: "resp_002",
            author: "Staff Onboarding",
            message:
              "Hi Le Van C, I can help you with the package upgrade. The price difference will be calculated and you can pay the additional amount.",
            timestamp: "2024-01-14T14:20:00Z",
            isStaff: true,
          },
          {
            id: "resp_003",
            author: "Le Van C",
            message: "That sounds great! How much would be the additional cost?",
            timestamp: "2024-01-14T15:10:00Z",
            isStaff: false,
          },
          {
            id: "resp_004",
            author: "Staff Onboarding",
            message:
              "The additional cost would be ₫6,300,000 for the remaining duration. I'll send you the payment details.",
            timestamp: "2024-01-14T16:30:00Z",
            isStaff: true,
          },
        ],
      },
    ]
    setTickets(mockTickets)
  }, [])

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus
    const matchesPriority = filterPriority === "all" || ticket.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, status: newStatus as any, lastUpdated: new Date().toISOString() }
          : ticket,
      ),
    )
  }

  const handleSendResponse = () => {
    if (!selectedTicket || !responseMessage.trim()) return

    const newResponse = {
      id: `resp_${Date.now()}`,
      author: "Staff Onboarding",
      message: responseMessage,
      timestamp: new Date().toISOString(),
      isStaff: true,
    }

    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              responses: [...ticket.responses, newResponse],
              lastUpdated: new Date().toISOString(),
              status: ticket.status === "open" ? "in_progress" : ticket.status,
            }
          : ticket,
      ),
    )

    setSelectedTicket((prev) =>
      prev
        ? {
            ...prev,
            responses: [...prev.responses, newResponse],
            lastUpdated: new Date().toISOString(),
          }
        : null,
    )

    setResponseMessage("")
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "high":
        return "bg-orange-500"
      case "urgent":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500"
      case "in_progress":
        return "bg-yellow-500"
      case "resolved":
        return "bg-green-500"
      case "closed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "payment":
        return "💳"
      case "technical":
        return "🔧"
      case "package":
        return "📦"
      case "urgent":
        return "🚨"
      default:
        return "💬"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <Card className="rounded-2xl border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Support Tickets Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search tickets..."
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
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full md:w-48 rounded-xl">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Open</p>
                <p className="text-2xl font-bold">{tickets.filter((t) => t.status === "open").length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">In Progress</p>
                <p className="text-2xl font-bold">{tickets.filter((t) => t.status === "in_progress").length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Resolved</p>
                <p className="text-2xl font-bold">{tickets.filter((t) => t.status === "resolved").length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Urgent</p>
                <p className="text-2xl font-bold">{tickets.filter((t) => t.priority === "urgent").length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-orange-100 text-orange-600">
                      {ticket.userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">{ticket.userName}</h3>
                    <p className="text-slate-600">{ticket.userEmail}</p>
                    <p className="text-sm text-slate-500">Ticket #{ticket.id}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={`${getPriorityColor(ticket.priority)} text-white`}>
                    {ticket.priority.toUpperCase()}
                  </Badge>
                  <Badge className={`${getStatusColor(ticket.status)} text-white`}>
                    {ticket.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getCategoryIcon(ticket.category)}</span>
                  <h4 className="font-semibold text-slate-800">{ticket.subject}</h4>
                </div>
                <p className="text-slate-600 line-clamp-2">{ticket.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Created: {new Date(ticket.createdDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Updated: {new Date(ticket.lastUpdated).toLocaleDateString()}
                  </div>
                  {ticket.responses.length > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {ticket.responses.length} responses
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View & Respond
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Support Ticket - {ticket.subject}</DialogTitle>
                      </DialogHeader>
                      {selectedTicket && (
                        <div className="space-y-6">
                          {/* Ticket Header */}
                          <div className="flex items-start justify-between p-4 bg-slate-50 rounded-lg">
                            <div>
                              <h3 className="font-semibold text-slate-800">{selectedTicket.userName}</h3>
                              <p className="text-slate-600">{selectedTicket.userEmail}</p>
                              <p className="text-sm text-slate-500">Ticket #{selectedTicket.id}</p>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={`${getPriorityColor(selectedTicket.priority)} text-white`}>
                                {selectedTicket.priority.toUpperCase()}
                              </Badge>
                              <Select
                                value={selectedTicket.status}
                                onValueChange={(value) => handleStatusChange(selectedTicket.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Original Message */}
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-slate-800 mb-2">{selectedTicket.subject}</h4>
                            <p className="text-slate-600">{selectedTicket.description}</p>
                            <p className="text-xs text-slate-500 mt-2">
                              {new Date(selectedTicket.createdDate).toLocaleString()}
                            </p>
                          </div>

                          {/* Conversation */}
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {selectedTicket.responses.map((response) => (
                              <div
                                key={response.id}
                                className={`p-4 rounded-lg ${
                                  response.isStaff
                                    ? "bg-green-50 border border-green-200 ml-8"
                                    : "bg-gray-50 border border-gray-200 mr-8"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-slate-800">{response.author}</span>
                                  <span className="text-xs text-slate-500">
                                    {new Date(response.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-slate-600">{response.message}</p>
                              </div>
                            ))}
                          </div>

                          {/* Response Form */}
                          <div className="space-y-4 border-t pt-4">
                            <Textarea
                              placeholder="Type your response..."
                              value={responseMessage}
                              onChange={(e) => setResponseMessage(e.target.value)}
                              className="rounded-xl"
                              rows={4}
                            />
                            <div className="flex justify-end">
                              <Button
                                onClick={handleSendResponse}
                                disabled={!responseMessage.trim()}
                                className="rounded-full bg-blue-600 hover:bg-blue-700"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send Response
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {ticket.status === "open" && (
                    <Button
                      size="sm"
                      className="rounded-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleStatusChange(ticket.id, "in_progress")}
                    >
                      Take Ticket
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Tickets Found</h3>
            <p className="text-slate-600">No support tickets match your current filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
