"use client";
import "@/i18n";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, Wifi, Bed, Bath, MapPin, Star, Clock, CheckCircle } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { DatePickerModal } from "@/components/date-picker-modal"
import { DurationModal } from "@/components/duration-modal"
import { BookingModal } from "@/components/booking-modal"

const roomData = {
  name: "Modern Studio in City Center",
  images: [
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600",
  ],
  bedrooms: 1,
  bathrooms: 1,
  residents: 8,
  speed: "100 Mbps",
  area: "25m²",
  rating: 4.8,
  reviews: 24,
  description:
    "Beautiful modern studio with city views and premium amenities. Located in the heart of the city with easy access to public transportation, restaurants, and entertainment. Perfect for digital nomads and young professionals.",
  amenities: [
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
  ],
  price: 15500000,
}

export default function RoomDetailPage({ params }: { params: { city: string; id: string } }) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showDurationPicker, setShowDurationPicker] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedDates, setSelectedDates] = useState<{ moveIn: Date | null; moveOut: Date | null }>({
    moveIn: null,
    moveOut: null,
  })
  const [duration, setDuration] = useState<string>("")

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 rounded-2xl overflow-hidden">
          <div className="md:col-span-2">
            <Image
              src={roomData.images[0] || "/placeholder.svg"}
              alt={roomData.name}
              width={600}
              height={400}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            <Image
              src={roomData.images[1] || "/placeholder.svg"}
              alt={roomData.name}
              width={300}
              height={200}
              className="w-full h-32 md:h-48 object-cover rounded-lg"
            />
            <Image
              src={roomData.images[2] || "/placeholder.svg"}
              alt={roomData.name}
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
              <h1 className="text-3xl font-bold text-slate-800 mb-2">{roomData.name}</h1>
              <div className="flex items-center gap-4 text-slate-600">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{roomData.rating}</span>
                  <span>({roomData.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>City Center</span>
                </div>
              </div>
            </div>

            {/* Room Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2 text-slate-600">
                <Bed className="h-5 w-5" />
                <div>
                  <div className="font-semibold">{roomData.bedrooms}</div>
                  <div className="text-sm">Bedrooms</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Bath className="h-5 w-5" />
                <div>
                  <div className="font-semibold">{roomData.bathrooms}</div>
                  <div className="text-sm">Bathrooms</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Users className="h-5 w-5" />
                <div>
                  <div className="font-semibold">{roomData.residents}</div>
                  <div className="text-sm">Residents</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Wifi className="h-5 w-5" />
                <div>
                  <div className="font-semibold">{roomData.speed}</div>
                  <div className="text-sm">Internet</div>
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
                    <p className="text-slate-600 leading-relaxed">{roomData.description}</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Amenities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {roomData.amenities.map((amenity, index) => (
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
                  <div className="text-3xl font-bold text-slate-800">₫{roomData.price.toLocaleString()}</div>
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
                    <span>₫{roomData.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
                    <span>Service fee</span>
                    <span>₫500,000</span>
                  </div>
                  <div className="flex justify-between items-center font-semibold text-slate-800 pt-2 border-t border-slate-200">
                    <span>Total</span>
                    <span>₫{(roomData.price + 500000).toLocaleString()}</span>
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
        roomData={roomData}
        selectedDates={selectedDates}
        duration={duration}
      />
    </div>
  )
}
