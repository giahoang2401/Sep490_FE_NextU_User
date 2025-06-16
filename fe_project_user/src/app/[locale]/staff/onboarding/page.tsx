"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Package, CreditCard, UserPlus, AlertCircle, TrendingUp, Settings } from "lucide-react"
import { StaffStats } from "@/components/staff-stats"
import { PackageRequestManager } from "@/components/package-request-manager"
import { PaymentManager } from "@/components/payment-manager"
import { UserRegistration } from "@/components/user-registration"
import { SupportTickets } from "@/components/support-tickets"

export default function StaffOnboardingDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Staff Onboarding Dashboard</h1>
              <p className="text-slate-600 mt-2">Manage user requests, payments, and support services</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-500 text-white">
                <Users className="h-4 w-4 mr-1" />
                Staff Onboarding
              </Badge>
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>SO</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 rounded-2xl bg-white/50 backdrop-blur-sm p-2 mb-8">
            <TabsTrigger value="overview" className="rounded-xl">
              <TrendingUp className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-xl">
              <Package className="h-4 w-4 mr-2" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="payments" className="rounded-xl">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="register" className="rounded-xl">
              <UserPlus className="h-4 w-4 mr-2" />
              Register
            </TabsTrigger>
            <TabsTrigger value="support" className="rounded-xl">
              <AlertCircle className="h-4 w-4 mr-2" />
              Support
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <StaffStats />
          </TabsContent>

          {/* Package Requests Tab */}
          <TabsContent value="requests">
            <PackageRequestManager />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <PaymentManager />
          </TabsContent>

          {/* User Registration Tab */}
          <TabsContent value="register">
            <UserRegistration />
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <SupportTickets />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="rounded-2xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Staff Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Staff settings and preferences will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
