"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  Package,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  DollarSign,
  Calendar,
  AlertTriangle,
} from "lucide-react"

const statsData = {
  totalRequests: 156,
  pendingRequests: 23,
  approvedToday: 12,
  rejectedToday: 3,
  totalRevenue: 2450000000,
  monthlyRevenue: 450000000,
  activeMembers: 1247,
  newMembersToday: 8,
}

const recentActivity = [
  {
    id: 1,
    type: "request_approved",
    user: "Nguyen Van A",
    package: "Cùng tỉnh thức - Hanoi",
    amount: 18800000,
    time: "2 minutes ago",
  },
  {
    id: 2,
    type: "payment_confirmed",
    user: "Tran Thi B",
    package: "Cùng kiến tạo - HCMC",
    amount: 27000000,
    time: "15 minutes ago",
  },
  {
    id: 3,
    type: "request_pending",
    user: "Le Van C",
    package: "Cùng khám phá - Da Nang",
    amount: 12200000,
    time: "1 hour ago",
  },
  {
    id: 4,
    type: "support_ticket",
    user: "Pham Thi D",
    issue: "Payment verification needed",
    time: "2 hours ago",
  },
]

export function StaffStats() {
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Pending Requests</p>
                <p className="text-3xl font-bold">{statsData.pendingRequests}</p>
                <p className="text-blue-100 text-sm mt-1">Needs attention</p>
              </div>
              <Clock className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Approved Today</p>
                <p className="text-3xl font-bold">{statsData.approvedToday}</p>
                <p className="text-green-100 text-sm mt-1">+{statsData.approvedToday - 8} from yesterday</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Monthly Revenue</p>
                <p className="text-3xl font-bold">₫{(statsData.monthlyRevenue / 1000000).toFixed(0)}M</p>
                <p className="text-purple-100 text-sm mt-1">+12% from last month</p>
              </div>
              <DollarSign className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Active Members</p>
                <p className="text-3xl font-bold">{statsData.activeMembers}</p>
                <p className="text-orange-100 text-sm mt-1">+{statsData.newMembersToday} new today</p>
              </div>
              <Users className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-blue-50 border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                <div className="text-center">
                  <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-blue-800">Review Requests</p>
                  <p className="text-sm text-blue-600">{statsData.pendingRequests} pending</p>
                </div>
              </Card>
              <Card className="p-4 bg-green-50 border-green-200 cursor-pointer hover:bg-green-100 transition-colors">
                <div className="text-center">
                  <CreditCard className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-green-800">Verify Payments</p>
                  <p className="text-sm text-green-600">5 pending</p>
                </div>
              </Card>
              <Card className="p-4 bg-purple-50 border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors">
                <div className="text-center">
                  <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-semibold text-purple-800">Register User</p>
                  <p className="text-sm text-purple-600">Manual registration</p>
                </div>
              </Card>
              <Card className="p-4 bg-orange-50 border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="font-semibold text-orange-800">Support Tickets</p>
                  <p className="text-sm text-orange-600">3 urgent</p>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                  <div className="flex-shrink-0">
                    {activity.type === "request_approved" && (
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                    {activity.type === "payment_confirmed" && (
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                    {activity.type === "request_pending" && (
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                    )}
                    {activity.type === "support_ticket" && (
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{activity.user}</p>
                    <p className="text-sm text-slate-600">
                      {activity.type === "support_ticket" ? activity.issue : activity.package}
                    </p>
                    {activity.amount && (
                      <p className="text-sm font-medium text-green-600">₫{activity.amount.toLocaleString()}</p>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
