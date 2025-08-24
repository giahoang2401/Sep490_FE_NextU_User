'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Construction, Clock, Lightbulb } from "lucide-react"
import Link from "next/link"

interface ComingSoonPageProps {
  serviceName: string
  serviceDescription: string
  serviceIcon: React.ComponentType<{ className?: string }>
  serviceColor: string
}

export default function ComingSoonPage({ 
  serviceName, 
  serviceDescription, 
  serviceIcon: ServiceIcon, 
  serviceColor 
}: ComingSoonPageProps) {
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
          <div className={`w-24 h-24 ${serviceColor} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
            <ServiceIcon className="h-12 w-12 text-white" />
          </div>
          
          <Badge className="mb-4 bg-gradient-to-r from-orange-400 to-yellow-500 text-white">
            <Construction className="h-4 w-4 mr-2" />
            Coming Soon
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {serviceName}
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            {serviceDescription}
          </p>
        </div>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Innovation in Progress</h3>
              </div>
              <p className="text-gray-600">
                Our team is working hard to bring you an exceptional experience with cutting-edge features and seamless integration.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Development Timeline</h3>
              </div>
              <p className="text-gray-600">
                We're in the final stages of development. Stay tuned for updates and be among the first to experience this new service.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-0 shadow-xl">
          <CardContent className="p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Get notified when {serviceName} launches and be the first to experience our latest innovation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-gray-800 hover:bg-gray-100 rounded-full px-8"
                disabled
              >
                Notify Me
              </Button>
              <Link href="/ecosystem/events">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-gray-800 rounded-full px-8"
                >
                  Explore Available Services
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">
            In the meantime, explore our other available services:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/ecosystem/Co-living">
              <Badge variant="outline" className="cursor-pointer hover:bg-blue-50">
                Co-living
              </Badge>
            </Link>
            <Link href="/ecosystem/events">
              <Badge variant="outline" className="cursor-pointer hover:bg-red-50">
                Events
              </Badge>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
