"use client";
import "@/i18n";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Users, Bed, Maximize, Eye, Building, ArrowLeft, X, Calendar, DollarSign } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { roomService, Property, RoomInstance, AccommodationOption } from "@/utils/roomService"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string
  
  const [property, setProperty] = useState<Property | null>(null)
  const [rooms, setRooms] = useState<RoomInstance[]>([])
  const [accommodationOptions, setAccommodationOptions] = useState<AccommodationOption[]>([])
  const [filteredRooms, setFilteredRooms] = useState<RoomInstance[]>([])
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all")
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Room detail modal states
  const [showRoomDetail, setShowRoomDetail] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<RoomInstance | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch property, rooms, and accommodation options in parallel
        const [propertiesData, roomsData, accommodationOptionsData] = await Promise.all([
          roomService.getProperties(),
          roomService.getRoomInstances(),
          roomService.getAccommodationOptions()
        ])
        
        // Find the specific property
        const currentProperty = propertiesData.find(p => p.id === propertyId)
        if (!currentProperty) {
          setError('Property not found')
          return
        }
        
        setProperty(currentProperty)
        
        // Filter rooms by property
        const propertyRooms = roomsData.filter(room => room.propertyId === propertyId)
        setRooms(propertyRooms)
        setFilteredRooms(propertyRooms)
        
        // Filter accommodation options by property
        const propertyAccommodationOptions = accommodationOptionsData.filter(
          option => option.propertyId === propertyId
        )
        setAccommodationOptions(propertyAccommodationOptions)
        
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load property data')
      } finally {
        setLoading(false)
      }
    }

    if (propertyId) {
      fetchData()
    }
  }, [propertyId])

  // Filter rooms by room type
  useEffect(() => {
    if (selectedRoomType === "all") {
      setFilteredRooms(rooms)
    } else {
      const filtered = rooms.filter(room => room.roomTypeName === selectedRoomType)
      setFilteredRooms(filtered)
    }
  }, [selectedRoomType, rooms])

  // Get unique room types for filter
  const uniqueRoomTypes = Array.from(new Set(rooms.map(room => room.roomTypeName)))

  // Helper function to calculate total room price
  const calculateRoomPrice = (room: RoomInstance): number => {
    const accommodationOption = accommodationOptions.find(
      option => option.id === room.accommodationOptionId
    )
    const basePrice = accommodationOption?.pricePerNight || 0
    const addOnFee = room.addOnFee || 0
    return basePrice + addOnFee
  }

  const handleRoomClick = (room: RoomInstance) => {
    setSelectedRoom(room)
    setCurrentImageIndex(0)
    setShowRoomDetail(true)
  }

  const getPropertyImage = (property: Property) => {
    const cityName = property.cityName.toLowerCase()
    if (cityName.includes('hà nội') || cityName.includes('ha noi')) {
      return "https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/dia-diem-du-lich-o-ha-noi-1.jpg"
    } else if (cityName.includes('hải phòng') || cityName.includes('hai phong')) {
      return "https://xdcs.cdnchinhphu.vn/446259493575335936/2025/6/22/anh-dep-hai-phong-47-1750597391221757892765.jpg"
    } else if (cityName.includes('đà nẵng') || cityName.includes('da nang')) {
      return "https://duonggiahotel.vn/wp-content/uploads/2023/11/dia-diem-du-lich-da-nang-avt.jpg"
    } else {
      return "/placeholder.svg?height=200&width=400"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner message="Loading property details..." />
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <p className="text-red-600">{error || 'Property not found'}</p>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Properties
          </Button>
        </div>

        {/* Property Header */}
        <div className="mb-8">
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
            <Image 
              src={getPropertyImage(property)}
              alt={property.name} 
              fill 
              className="object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Logo overlay */}
            <div className="absolute top-6 left-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-white font-semibold text-lg">express</span>
              </div>
            </div>
            
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{property.name}</h1>
              <p className="text-white/90 text-lg">{property.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="h-5 w-5 text-white/80" />
                <span className="text-white/90">{property.locationName}, {property.cityName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Room Type Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Room Types</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedRoomType("all")}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                selectedRoomType === "all"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              All ({rooms.length})
            </button>
            {uniqueRoomTypes.map((roomType) => {
              const count = rooms.filter(room => room.roomTypeName === roomType).length
              return (
                <button
                  key={roomType}
                  onClick={() => setSelectedRoomType(roomType)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                    selectedRoomType === roomType
                      ? "bg-orange-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {roomType} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              Available Rooms ({filteredRooms.length})
            </h2>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Building className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
              <p className="text-gray-500">Try selecting a different room type filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <Card
                  key={room.id}
                  className="overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white"
                  onClick={() => handleRoomClick(room)}
                >
                  <div className="relative h-48">
                    {room.medias && room.medias.length > 0 ? (
                      <Image 
                        src={room.medias[0].url}
                        alt={room.roomName} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Building className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Room status badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className={`${
                        room.status === 'Available' ? 'bg-green-500' : 'bg-red-500'
                      } text-white`}>
                        {room.status}
                      </Badge>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1">{room.roomName}</h3>
                      <p className="text-white/90 text-sm">{room.roomCode}</p>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Room Type */}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-sm">
                          {room.roomTypeName}
                        </Badge>
                        <span className="text-lg font-bold text-blue-600">
                          ₫{calculateRoomPrice(room).toLocaleString()}/night
                        </span>
                      </div>

                      {/* Room specs */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Maximize className="h-4 w-4 text-gray-400" />
                          <span>{room.areaInSquareMeters}m²</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bed className="h-4 w-4 text-gray-400" />
                          <span>{room.numberOfBeds} beds</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-gray-400" />
                          <span>{room.roomViewName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span>{room.roomFloorName}</span>
                        </div>
                      </div>

                      {/* Action button */}
                      <Button className="w-full bg-orange-500 hover:bg-orange-600">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Room Detail Modal */}
      <Dialog open={showRoomDetail} onOpenChange={setShowRoomDetail}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Building className="h-5 w-5" />
              Room Details
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowRoomDetail(false)}
              className="absolute right-4 top-4 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          {selectedRoom && (
            <div className="space-y-6">
              {/* Room Summary */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {selectedRoom.roomName}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge className={`${
                      selectedRoom.status === 'Available' ? 'bg-green-500' : 'bg-red-500'
                    } text-white text-xs px-2 py-1`}>
                      {selectedRoom.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      {selectedRoom.roomTypeName}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Room Code:</span>
                    <span className="ml-2 font-medium">{selectedRoom.roomCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Area:</span>
                    <span className="ml-2 font-medium">{selectedRoom.areaInSquareMeters}m²</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Price:</span>
                    <span className="ml-2 font-medium text-blue-600">₫{calculateRoomPrice(selectedRoom).toLocaleString()}/night</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Property:</span>
                    <span className="ml-2 font-medium">{property.name}</span>
                  </div>
                </div>
              </div>

              {/* Room Information */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Room Information</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Image Gallery */}
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden border bg-slate-100">
                      {selectedRoom.medias && selectedRoom.medias.length > 0 ? (
                        <>
                          <img 
                            src={selectedRoom.medias[currentImageIndex].url} 
                            alt={selectedRoom.medias[currentImageIndex].description || 'Room image'}
                            className="w-full h-full object-cover"
                          />
                          {/* Image Counter */}
                          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {currentImageIndex + 1}/{selectedRoom.medias.length}
                          </div>
                          {/* Navigation Arrows */}
                          {selectedRoom.medias.length > 1 && (
                            <>
                              <button 
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 p-2 rounded-full shadow-lg transition-all"
                                onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? selectedRoom.medias.length - 1 : prev - 1))}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                              <button 
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 p-2 rounded-full shadow-lg transition-all"
                                onClick={() => setCurrentImageIndex((prev) => (prev === selectedRoom.medias.length - 1 ? 0 : prev + 1))}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Thumbnail Navigation */}
                    {selectedRoom.medias && selectedRoom.medias.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {selectedRoom.medias.map((media, idx) => (
                          <div 
                            key={idx} 
                            className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                              currentImageIndex === idx ? 'border-blue-500' : 'border-transparent hover:border-blue-300'
                            }`}
                            onClick={() => setCurrentImageIndex(idx)}
                          >
                            <img 
                              src={media.url} 
                              alt={media.description || `Room thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Room Details */}
                  <div className="space-y-4">
                    {/* Combined Description and Room Specifications */}
                    <div className="bg-white border rounded-lg p-4">
                      {/* Description Section */}
                      <div className="mb-4">
                        <h5 className="font-semibold text-slate-800 mb-3">Description</h5>
                        <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700">
                          {selectedRoom.descriptionDetails || 'No description available'}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-slate-200 mb-4"></div>

                      {/* Room Specifications Section */}
                      <div>
                        <h5 className="font-semibold text-slate-800 mb-3">Room Specifications</h5>
                        
                        {/* Room Specifications in 4 rows with 2 columns each */}
                        <div className="space-y-3 text-sm">
                          {/* Row 1: Room Code | Room Type */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex justify-between items-center gap-3">
                              <span className="text-slate-500">Room Code:</span>
                              <span className="font-medium">{selectedRoom.roomCode}</span>
                            </div>
                            <div className="flex justify-between items-center gap-3">
                              <span className="text-slate-500">Room Type:</span>
                              <span 
                                className="font-medium text-right truncate min-w-0 max-w-[70%] cursor-pointer hover:text-blue-600 transition-colors" 
                                title={`Click to see full: ${selectedRoom.roomTypeName}`}
                                onClick={() => {
                                  if (selectedRoom.roomTypeName.length > 15) {
                                    alert(`Full Room Type: ${selectedRoom.roomTypeName}`);
                                  }
                                }}
                              >
                                {selectedRoom.roomTypeName}
                              </span>
                            </div>
                          </div>

                          {/* Row 2: Area | View */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Area:</span>
                              <span className="font-medium">{selectedRoom.areaInSquareMeters} m²</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">View:</span>
                              <span className="font-medium">{selectedRoom.roomViewName}</span>
                            </div>
                          </div>

                          {/* Row 3: Size | Floor */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Size:</span>
                              <span className="font-medium">{selectedRoom.roomSizeName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Floor:</span>
                              <span className="font-medium">{selectedRoom.roomFloorName}</span>
                            </div>
                          </div>

                          {/* Row 4: Bed Type | Number of Beds */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Bed Type:</span>
                              <span className="font-medium">{selectedRoom.bedTypeName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Number of Beds:</span>
                              <span className="font-medium">{selectedRoom.numberOfBeds}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Information */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h5 className="font-semibold text-slate-800 mb-3">Pricing Information</h5>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Base price per night:</span>
                          <span className="font-medium">
                            ₫{(accommodationOptions.find(opt => opt.id === selectedRoom.accommodationOptionId)?.pricePerNight || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Add-on fee:</span>
                          <span className="font-medium">
                            ₫{(selectedRoom.addOnFee || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-800 font-semibold">Total per night:</span>
                            <span className="text-2xl font-bold text-orange-600">
                              ₫{calculateRoomPrice(selectedRoom).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button className="w-full bg-orange-500 hover:bg-orange-600">
                        Book This Room
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
