"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Phone, Mail, ArrowRight } from "lucide-react"
import { useState } from "react"

interface ServiceDetailBookingProps {
  service: {
    name: string
  }
}

export function ServiceDetailBooking({ service }: ServiceDetailBookingProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    moveInDate: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle booking submission
    console.log("Booking submitted:", formData)
  }

  return (
    <div className="space-y-6">
      {/* Quick Contact */}
      <Card className="rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800">Quick Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full rounded-full bg-green-500 hover:bg-green-600 text-white">
            <Phone className="h-4 w-4 mr-2" />
            Call Now: +84 123 456 789
          </Button>
          <Button variant="outline" className="w-full rounded-full border-blue-500 text-blue-500 hover:bg-blue-50">
            <Mail className="h-4 w-4 mr-2" />
            Email: hello@nextuniverse.com
          </Button>
        </CardContent>
      </Card>

      {/* Booking Form */}
      <Card className="rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800">Book a Tour</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-full"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="rounded-full"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="rounded-full"
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <Label htmlFor="moveInDate">Preferred Move-in Date</Label>
              <Input
                id="moveInDate"
                type="date"
                value={formData.moveInDate}
                onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                className="rounded-full"
              />
            </div>
            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="rounded-2xl"
                placeholder="Any specific requirements or questions?"
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full rounded-full bg-slate-800 hover:bg-slate-700">
              Schedule Tour
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Instant Booking */}
      <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
        <CardContent className="p-6 text-center">
          <Calendar className="h-8 w-8 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">Available Now</h3>
          <p className="text-sm opacity-90 mb-4">This space is currently available for immediate move-in</p>
          <Button className="bg-white text-blue-500 hover:bg-gray-100 rounded-full">Reserve Now</Button>
        </CardContent>
      </Card>
    </div>
  )
}
