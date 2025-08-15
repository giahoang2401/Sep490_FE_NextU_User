'use client'

import { useState } from 'react'
import { Package, Ticket } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PackageHistory from '@/components/user/PackageHistory'
import EventBookingHistory from '@/components/user/EventBookingHistory'
import { useRouter } from 'next/navigation'

export default function PackageBookingsPage() {
  const [activeTab, setActiveTab] = useState('packages')
  const router = useRouter()

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === 'ecosystem') {
      router.push('/my-bookings/event-bookings')
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">My Bookings</h1>
        <p className="text-slate-600">Manage all your package requests and event bookings here.</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="packages" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Package Bookings</span>
          </TabsTrigger>
          <TabsTrigger value="ecosystem" className="flex items-center space-x-2">
            <Ticket className="h-4 w-4" />
            <span>Event Bookings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-blue-900">Package Bookings</h2>
            </div>
            <p className="text-blue-700 mt-1">View and manage your package requests, payments, and statuses.</p>
          </div>
          <PackageHistory />
        </TabsContent>

        <TabsContent value="ecosystem" className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Ticket className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-green-900">Event Bookings</h2>
            </div>
            <p className="text-green-700 mt-1">View and manage your event tickets, add-ons, and payment status.</p>
          </div>
          <EventBookingHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
