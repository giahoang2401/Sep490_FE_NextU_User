'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Home, Calendar } from "lucide-react"
import Link from "next/link"

export default function EcosystemNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/ecosystem">
            <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <ArrowLeft className="h-4 w-4" />
              Back to Ecosystem
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Search className="h-12 w-12 text-red-600" />
          </div>
          
          <Badge className="mb-4 bg-gradient-to-r from-red-400 to-pink-500 text-white">
            Page Not Found
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Service Not Found
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            The service you're looking for doesn't exist or may be under development. 
            Please check the URL or explore our available services below.
          </p>
        </div>

        {/* Available Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Co-living</h3>
              <p className="text-gray-600 mb-4">
                Modern living spaces designed for comfort and community
              </p>
              <Link href="/ecosystem/Co-living">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Explore Co-living
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Events</h3>
              <p className="text-gray-600 mb-4">
                Diverse learning opportunities and community gatherings
              </p>
              <Link href="/ecosystem/events">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Browse Events
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-0 shadow-xl">
          <CardContent className="p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Can't find what you're looking for? Contact our support team for assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/ecosystem">
                <Button 
                  size="lg" 
                  className="bg-white text-gray-800 hover:bg-gray-100 rounded-full px-8"
                >
                  Back to Ecosystem
                </Button>
              </Link>
              <Link href="/">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-gray-800 rounded-full px-8"
                >
                  Go Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
