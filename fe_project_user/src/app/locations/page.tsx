"use client";
import "@/i18n";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Building } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { roomService, Location } from "@/utils/roomService"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Helper function to create simple slug from location name
const createSimpleSlug = (locationName: string): string => {
  return locationName.toLowerCase().replace(/\s+/g, '-').replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a').replace(/[èéẹẻẽêềếệểễ]/g, 'e').replace(/[ìíịỉĩ]/g, 'i').replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o').replace(/[ùúụủũưừứựửữ]/g, 'u').replace(/[ỳýỵỷỹ]/g, 'y').replace(/đ/g, 'd')
}

export default function LocationSelectionPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true)
        const locationsData = await roomService.getLocations()
        // Lọc bỏ Thanh Hóa khỏi danh sách
        const filteredLocations = locationsData.filter(location => 
          !location.name.toLowerCase().includes('thanh hóa') && 
          !location.name.toLowerCase().includes('thanh hoa')
        )
        setLocations(filteredLocations)
      } catch (err) {
        console.error('Error fetching locations:', err)
        setError('Failed to load locations')
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner message="Loading locations..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Choose Your Property</h1>
          <p className="text-lg text-slate-600">Select a location to explore available co-living spaces</p>
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <Card
              key={location.id}
              className="overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <Link href={`/rooms/${createSimpleSlug(location.name)}`}>
                <div className="relative h-48">
                  <Image 
                    src={(() => {
                      const locName = location.name.toLowerCase()
                      if (locName.includes('hà nội') || locName.includes('ha noi')) {
                        return "https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/dia-diem-du-lich-o-ha-noi-1.jpg"
                      } else if (locName.includes('hải phòng') || locName.includes('hai phong')) {
                        return "https://xdcs.cdnchinhphu.vn/446259493575335936/2025/6/22/anh-dep-hai-phong-47-1750597391221757892765.jpg"
                      } else if (locName.includes('đà nẵng') || locName.includes('da nang')) {
                        return "https://duonggiahotel.vn/wp-content/uploads/2023/11/dia-diem-du-lich-da-nang-avt.jpg"
                      } else {
                        return "/placeholder.svg?height=200&width=400"
                      }
                    })()} 
                    alt={location.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-semibold text-white mb-2">{location.name}</h3>
                    <p className="text-white/90 text-sm">{location.description}</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{location.name}</span>
                    </div>
                    <Badge className="rounded-full bg-blue-500 text-white">
                      Available
                    </Badge>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>Co-living Spaces</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Community</span>
                    </div>
                  </div>

                  <Button className="w-full mt-4 rounded-full bg-slate-800 hover:bg-slate-700">
                    Explore Spaces
                  </Button>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {/* Popular Cities Section */}
       
      </div>
    </div>
  )
} 
