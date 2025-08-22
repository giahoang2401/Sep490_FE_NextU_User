'use client'

import PackageSection from '@/components/package/PackageSection'
import { Building, Users, MapPin, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CoLivingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f9fc] via-[#f0fbfd] to-[#cce9fa]">
      {/* Navigation Header */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/ecosystem">
              <Button variant="ghost" className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
                <ArrowLeft className="h-4 w-4" />
                Back to Ecosystem
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-slate-700">
              <Building className="h-5 w-5" />
              <span className="font-semibold">Co-living Packages</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
              <Building className="h-6 w-6 text-[#28c4dd]" />
              <span className="text-slate-800 font-semibold">Co-living Residences</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight">
            Find Your Perfect
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#28c4dd] to-[#1ea5b8]">
              Co-living Space
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Discover our thoughtfully designed co-living packages that combine comfort, community, and convenience. 
            From basic accommodations to premium suites, find the perfect space for your lifestyle and budget.
          </p>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-[#28c4dd]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building className="h-6 w-6 text-[#28c4dd]" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Modern Spaces</h3>
              <p className="text-sm text-slate-600">Fully furnished rooms with contemporary amenities and design</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-[#28c4dd]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-[#28c4dd]" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Vibrant Community</h3>
              <p className="text-sm text-slate-600">Connect with like-minded individuals in shared spaces</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-[#28c4dd]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-[#28c4dd]" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Prime Locations</h3>
              <p className="text-sm text-slate-600">Strategic locations with easy access to city amenities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Package Section */}
      <PackageSection 
        showHero={false}
        showLocationFilter={true}
        showTypeFilter={true}
        isPreview={false}
        className=""
      />
    </div>
  )
}
