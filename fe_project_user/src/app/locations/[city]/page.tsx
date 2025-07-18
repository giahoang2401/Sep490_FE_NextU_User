"use client";
import "@/i18n";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Wifi, Users, Calendar, DollarSign, Filter, Map } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { roomService, RoomInstance, Location, AccommodationOption } from "@/utils/roomService"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function RoomListingPage({ params }: { params: { city: string } }) {
  const [showMap, setShowMap] = useState(false)
  const [rooms, setRooms] = useState<RoomInstance[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [accommodationOptions, setAccommodationOptions] = useState<{ [key: string]: AccommodationOption }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Helper function to create simple slug from location name
  const createSimpleSlug = (locationName: string): string => {
    return locationName.toLowerCase().replace(/\s+/g, '-').replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a').replace(/[èéẹẻẽêềếệểễ]/g, 'e').replace(/[ìíịỉĩ]/g, 'i').replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o').replace(/[ùúụủũưừứựửữ]/g, 'u').replace(/[ỳýỵỷỹ]/g, 'y').replace(/đ/g, 'd')
  }

  // Helper function to find location by slug
  const findLocationBySlug = (slug: string, locations: Location[]): Location | undefined => {
    // Try to match with slug
    const targetLocation = locations.find(loc => {
      const locSlug = createSimpleSlug(loc.name)
      return locSlug === slug.toLowerCase()
    })
    
    return targetLocation
  }

  // Get city name for display
  const cityName = decodeURIComponent(params.city).replace(/-/g, ' ')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Lấy danh sách locations
        const locationsData = await roomService.getLocations()
        setLocations(locationsData)
        
        // Tìm location ID dựa trên city slug
        const targetLocation = findLocationBySlug(params.city, locationsData)
        
        if (targetLocation) {
          // Lấy room instances theo location
          const roomsData = await roomService.getRoomInstancesByLocation(targetLocation.id)
          setRooms(roomsData)
          
          // Lấy accommodation options cho tất cả rooms
          const optionsMap: { [key: string]: AccommodationOption } = {}
          for (const room of roomsData) {
            try {
              const option = await roomService.getAccommodationOption(room.accommodationOptionId)
              optionsMap[room.accommodationOptionId] = option
            } catch (err) {
              console.warn(`Could not fetch accommodation option for room ${room.id}:`, err)
            }
          }
          setAccommodationOptions(optionsMap)
        } else {
          // Không tìm thấy location - hiển thị rỗng
          setRooms([])
          setAccommodationOptions({})
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load rooms data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.city])

  // Helper function để format price
  const formatPrice = (pricePerNight: number) => {
    const monthlyPrice = pricePerNight * 30 // Giả sử 30 ngày/tháng
    return `₫${monthlyPrice.toLocaleString()}`
  }

  // Helper function để lấy icon cho room type
  const getRoomTypeIcon = (roomTypeName: string) => {
    if (roomTypeName.toLowerCase().includes('shared')) {
      return <Users className="h-4 w-4" />
    }
    return <Bed className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner message="Loading rooms..." />
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
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Top Coliving Spaces in {cityName}</h1>
          <p className="text-lg text-slate-600">Discover amazing co-living spaces in {cityName}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button variant="outline" className="rounded-full">
            <Calendar className="h-4 w-4 mr-2" />
            Move-in date
          </Button>
          <Button variant="outline" className="rounded-full">
            <DollarSign className="h-4 w-4 mr-2" />
            Budget
          </Button>
          <Button variant="outline" className="rounded-full">
            <Bed className="h-4 w-4 mr-2" />
            Room type
          </Button>
          <Button variant="outline" className="rounded-full">
            <Users className="h-4 w-4 mr-2" />
            Community
          </Button>
          <Button variant="outline" className="rounded-full">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
          <Button
            variant={showMap ? "default" : "outline"}
            className="rounded-full ml-auto"
            onClick={() => setShowMap(!showMap)}
          >
            <Map className="h-4 w-4 mr-2" />
            {showMap ? "Hide Map" : "Show Map"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Cards */}
          <div className="lg:col-span-2 space-y-6">
            {rooms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600">No rooms available in this location.</p>
              </div>
            ) : (
              rooms.map((room) => (
                <Card
                  key={room.id}
                  className="overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="md:flex">
                    <div className="md:w-1/3 relative h-64 md:h-auto">
                      <Image 
                        src="/placeholder.svg?height=250&width=400" 
                        alt={room.roomName} 
                        fill 
                        className="object-cover" 
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className="rounded-full bg-green-500">
                          New
                        </Badge>
                        <Badge className={`rounded-full ${room.status === 'Available' ? 'bg-blue-500' : 'bg-gray-500'}`}>
                          {room.status}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="md:w-2/3 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-800 mb-2">
                            {room.roomName} - {room.roomTypeName}
                          </h3>
                          <p className="text-slate-600 mb-4">{room.descriptionDetails}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-800">
                            {(() => {
                              const option = accommodationOptions[room.accommodationOptionId]
                              if (option) {
                                return `₫${option.pricePerNight.toLocaleString()}`
                              }
                              return "₫500,000" // Fallback price
                            })()}
                          </div>
                          <div className="text-sm text-slate-500">per night</div>
                        </div>
                      </div>

                      {/* Room Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Bed className="h-4 w-4" />
                          <span>1 bed</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Bath className="h-4 w-4" />
                          <span>1 bath</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Wifi className="h-4 w-4" />
                          <span>100 Mbps</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Users className="h-4 w-4" />
                          <span>
                            {(() => {
                              const option = accommodationOptions[room.accommodationOptionId]
                              return option ? `${option.capacity} residents` : "8 residents"
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* Room Details */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="rounded-full">
                            {room.roomTypeName}
                          </Badge>
                          <Badge variant="secondary" className="rounded-full">
                            Floor: {room.floor}
                          </Badge>
                          <Badge variant="secondary" className="rounded-full">
                            Code: {room.roomCode}
                          </Badge>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="rounded-full">
                            WiFi
                          </Badge>
                          <Badge variant="secondary" className="rounded-full">
                            Kitchen
                          </Badge>
                          <Badge variant="secondary" className="rounded-full">
                            Laundry
                          </Badge>
                          <Badge variant="secondary" className="rounded-full">
                            Gym
                          </Badge>
                        </div>
                      </div>

                      {/* Community Tags */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="rounded-full">
                            Remote workers
                          </Badge>
                          <Badge variant="outline" className="rounded-full">
                            Students
                          </Badge>
                          <Badge variant="outline" className="rounded-full">
                            Creatives
                          </Badge>
                        </div>
                      </div>

                     
                    </CardContent>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Map */}
          {showMap && (
            <div className="lg:col-span-1">
              <Card className="sticky top-24 rounded-2xl border-0 shadow-lg overflow-hidden">
                <div className="h-96 bg-slate-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Map className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500">Interactive map with price markers</p>
                    </div>
                  </div>
                  {/* Price markers would be positioned here */}
                  {rooms.slice(0, 3).map((room, index) => {
                    const option = accommodationOptions[room.accommodationOptionId]
                    const pricePerNight = option ? option.pricePerNight : 500000
                    const priceInK = Math.round(pricePerNight / 1000)
                    
                    return (
                      <div 
                        key={room.id}
                        className="absolute bg-white rounded-full px-3 py-1 text-sm font-semibold shadow-lg"
                        style={{
                          top: `${20 + index * 40}px`,
                          left: `${20 + index * 20}px`
                        }}
                      >
                        ₫{priceInK}K
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
