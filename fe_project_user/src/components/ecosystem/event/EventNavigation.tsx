'use client'

import { Calendar, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function EventNavigation() {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center mb-6">
          <Link href="/ecosystem" className="text-gray-500 hover:text-gray-700">
            Ecosystem
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900 font-medium">Events & Workshops</span>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center mb-2">
              <Calendar className="h-6 w-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Events & Workshops</h1>
            </div>
            <p className="text-gray-600">
              Discover diverse events from yoga, cooking, photography to networking
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Calendar className="h-4 w-4 mr-2" />
              Event Calendar
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">500+</div>
            <div className="text-sm text-gray-600">Events per month</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">10K+</div>
            <div className="text-sm text-gray-600">Participants</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">50+</div>
            <div className="text-sm text-gray-600">Locations</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">4.8★</div>
            <div className="text-sm text-gray-600">Average rating</div>
          </div>
        </div>
      </div>
    </div>
  )
} 