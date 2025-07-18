"use client";
import "@/i18n";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, Wifi, Bed, Bath, MapPin, Star, Clock, CheckCircle } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { DatePickerModal } from "@/components/date-picker-modal"
import { DurationModal } from "@/components/duration-modal"
import { BookingModal } from "@/components/booking-modal"
import { roomService, RoomInstance, AccommodationOption, Location } from "@/utils/roomService"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function RoomDetailPage({ params }: { params: { city: string; id: string } }) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showDurationPicker, setShowDurationPicker] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedDates, setSelectedDates] = useState<{ moveIn: Date | null; moveOut: Date | null }>({
    moveIn: null,
    moveOut: null,
  })
  const [duration, setDuration] = useState<string>("")
  const [roomData, setRoomData] = useState<RoomInstance | null>(null)
  const [accommodationOption, setAccommodationOption] = useState<AccommodationOption | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true)
        // Lấy danh sách locations để tìm location ID
        const locations = await roomService.getLocations()
        const targetLocation = locations.find(loc => 
          loc.name.toLowerCase().includes(params.city.toLowerCase()) ||
          loc.description.toLowerCase().includes(params.city.toLowerCase())
        )
        
        if (targetLocation) {
          // Lấy room instances theo location
          const rooms = await roomService.getRoomInstancesByLocation(targetLocation.id)
          const currentRoom = rooms.find(room => room.id === params.id)
          
          if (currentRoom) {
            setRoomData(currentRoom)
            // Lấy thông tin accommodation option
            try {
              const accOption = await roomService.getAccommodationOption(currentRoom.accommodationOptionId)
              setAccommodationOption(accOption)
            } catch (err) {
              console.warn('Could not fetch accommodation option details:', err)
            }
          } else {
            setError('Room not found')
          }
        } else {
          setError('Location not found')
        }
      } catch (err) {
        console.error('Error fetching room data:', err)
        setError('Failed to load room data')
      } finally {
        setLoading(false)
      }
    }

    fetchRoomData()
  }, [params.city, params.id])

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner message="Loading room details..." />
        </div>
      </div>
    )
  }

  if (error || !roomData) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <p className="text-red-600">{error || 'Room not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  // Tính toán giá từ accommodation option hoặc sử dụng giá mặc định
  const price = accommodationOption ? accommodationOption.pricePerNight * 30 : 15500000

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 rounded-2xl overflow-hidden">
          <div className="md:col-span-2">
            <Image
              src="/placeholder.svg?height=400&width=600"
              alt={roomData.roomName}
              width={600}
              height={400}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            <Image
              src="/placeholder.svg?height=400&width=600"
              alt={roomData.roomName}
              width={300}
              height={200}
              className="w-full h-32 md:h-48 object-cover rounded-lg"
            />
            <Image
              src="/placeholder.svg?height=400&width=600"
              alt={roomData.roomName}
              width={300}
              height={200}
              className="w-full h-32 md:h-48 object-cover rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                {roomData.roomName} - {roomData.roomTypeName}
              </h1>
              <div className="flex items-center gap-4 text-slate-600">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8</span>
                  <span>(24 reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{roomData.locationName}</span>
                </div>
              </div>
            </div>

            {/* Room Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2 text-slate-600">
                <Bed className="h-5 w-5" />
                <div>
                  <div className="font-semibold">1</div>
                  <div className="text-sm">Bedrooms</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Bath className="h-5 w-5" />
                <div>
                  <div className="font-semibold">1</div>
                  <div className="text-sm">Bathrooms</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Users className="h-5 w-5" />
                <div>
                  <div className="font-semibold">{accommodationOption?.capacity || 8}</div>
                  <div className="text-sm">Residents</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Wifi className="h-5 w-5" />
                <div>
                  <div className="font-semibold">100 Mbps</div>
                  <div className="text-sm">Internet</div>
                </div>
              </div>
            </div>

            {/* Room Details */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Room Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-500">Room Code:</span>
                  <p className="font-medium">{roomData.roomCode}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Floor:</span>
                  <p className="font-medium">{roomData.floor}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Room Type:</span>
                  <p className="font-medium">{roomData.roomTypeName}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Status:</span>
                  <p className="font-medium">{roomData.status}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-5 rounded-full">
                <TabsTrigger value="details" className="rounded-full">
                  Details
                </TabsTrigger>
                <TabsTrigger value="rooms" className="rounded-full">
                  Rooms
                </TabsTrigger>
                <TabsTrigger value="community" className="rounded-full">
                  Community
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-full">
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="faq" className="rounded-full">
                  FAQ
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">Description</h3>
                    <p className="text-slate-600 leading-relaxed">{roomData.descriptionDetails}</p>
                    {accommodationOption && (
                      <p className="text-slate-600 leading-relaxed mt-3">{accommodationOption.description}</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Amenities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "High-speed WiFi",
                        "Fully equipped kitchen",
                        "Laundry facilities",
                        "Gym access",
                        "Rooftop terrace",
                        "Co-working space",
                        "24/7 security",
                        "Cleaning service",
                        "Air conditioning",
                        "Parking available",
                      ].map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-slate-600">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rooms" className="mt-6">
                <div className="text-center py-8">
                  <p className="text-slate-600">Room layouts and floor plans coming soon...</p>
                </div>
              </TabsContent>

              <TabsContent value="community" className="mt-6">
                <div className="text-center py-8">
                  <p className="text-slate-600">Community information and resident profiles...</p>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="text-center py-8">
                  <p className="text-slate-600">Guest reviews and ratings...</p>
                </div>
              </TabsContent>

              <TabsContent value="faq" className="mt-6">
                <div className="text-center py-8">
                  <p className="text-slate-600">Frequently asked questions...</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Box */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 rounded-2xl border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-slate-800">₫{price.toLocaleString()}</div>
                  <div className="text-slate-600">per month</div>
                </div>

                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full rounded-full justify-start"
                    onClick={() => setShowDatePicker(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {selectedDates.moveIn && selectedDates.moveOut
                      ? `${selectedDates.moveIn.toLocaleDateString()} - ${selectedDates.moveOut.toLocaleDateString()}`
                      : "Select dates"}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full rounded-full justify-start"
                    onClick={() => setShowDurationPicker(true)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {duration || "Duration"}
                  </Button>

                  <Button
                    className="w-full rounded-full bg-slate-800 hover:bg-slate-700"
                    onClick={() => setShowBookingModal(true)}
                  >
                    Check Availability
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
                    <span>Monthly rent</span>
                    <span>₫{price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
                    <span>Service fee</span>
                    <span>₫500,000</span>
                  </div>
                  <div className="flex justify-between items-center font-semibold text-slate-800 pt-2 border-t border-slate-200">
                    <span>Total</span>
                    <span>₫{(price + 500000).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DatePickerModal open={showDatePicker} onOpenChange={setShowDatePicker} onDatesSelect={setSelectedDates} />
      <DurationModal open={showDurationPicker} onOpenChange={setShowDurationPicker} onDurationSelect={setDuration} />
      <BookingModal
        open={showBookingModal}
        onOpenChange={setShowBookingModal}
        roomData={{
          name: roomData.roomName,
          price: price,
        }}
        selectedDates={selectedDates}
        duration={duration}
      />
    </div>
  )
}
