'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, AlertTriangle, Home, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function EcosystemGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
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
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <AlertTriangle className="h-12 w-12 text-yellow-600" />
          </div>
          
          <Badge className="mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            Something went wrong
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ecosystem Error
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            We encountered an unexpected error while loading the ecosystem. 
            Please try again or contact support if the problem persists.
          </p>
        </div>

        {/* Error Details */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Error Details</h3>
            <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-700 font-mono">
              {error.message || 'Unknown error occurred'}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Try Again</h3>
              <p className="text-gray-600 mb-4">
                Click the button below to attempt to reload the page
              </p>
              <Button onClick={reset} className="w-full bg-blue-600 hover:bg-blue-700">
                Retry
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Go Home</h3>
              <p className="text-gray-600 mb-4">
                Return to the main ecosystem page
              </p>
              <Link href="/ecosystem">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Back to Ecosystem
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
              If you continue to experience issues, please contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button 
                  size="lg" 
                  className="bg-white text-gray-800 hover:bg-gray-100 rounded-full px-8"
                >
                  Go to Homepage
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-gray-800 rounded-full px-8"
                onClick={reset}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
