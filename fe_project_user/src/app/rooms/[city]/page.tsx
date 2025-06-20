"use client";
import "@/i18n";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Wifi, Users, Calendar, DollarSign, Filter, Map } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const rooms = [
  {
    id: 1,
    name: "Modern Studio in City Center",
    image: "/placeholder.svg?height=250&width=400",
    tags: ["New", "Available"],
    description: "Beautiful modern studio with city views and premium amenities",
    bedrooms: 1,
    bathrooms: 1,
    residents: 8,
    speed: "100 Mbps",
    area: "25m²",
    amenities: ["WiFi", "Kitchen", "Laundry", "Gym"],
    communityTags: ["Remote workers", "Students", "Creatives"],
    price: "₫15,500,000",
    coordinates: { lat: 21.0285, lng: 105.8542 },
  },
  {
    id: 2,
    name: "Shared Villa with Garden",
    image: "/placeholder.svg?height=250&width=400",
    tags: ["Available"],
    description: "Spacious shared villa with beautiful garden and co-working space",
    bedrooms: 2,
    bathrooms: 2,
    residents: 12,
    speed: "200 Mbps",
    area: "45m²",
    amenities: ["WiFi", "Kitchen", "Garden", "Pool", "Gym"],
    communityTags: ["Remote workers", "Entrepreneurs"],
    price: "₫18,200,000",
    coordinates: { lat: 21.0245, lng: 105.8412 },
  },
  {
    id: 3,
    name: "Creative Loft Space",
    image: "/placeholder.svg?height=250&width=400",
    tags: ["Available"],
    description: "Inspiring loft space perfect for artists and creative professionals",
    bedrooms: 1,
    bathrooms: 1,
    residents: 6,
    speed: "150 Mbps",
    area: "35m²",
    amenities: ["WiFi", "Kitchen", "Art Studio", "Music Room"],
    communityTags: ["Artists", "Musicians", "Writers"],
    price: "₫16,800,000",
    coordinates: { lat: 21.0195, lng: 105.8502 },
  },
]

export default function RoomListingPage({ params }: { params: { city: string } }) {
  const [showMap, setShowMap] = useState(false)
  const cityName = params.city.charAt(0).toUpperCase() + params.city.slice(1).replace("-", " ")

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
            {rooms.map((room) => (
              <Card
                key={room.id}
                className="overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="md:flex">
                  <div className="md:w-1/3 relative h-64 md:h-auto">
                    <Image src={room.image || "/placeholder.svg"} alt={room.name} fill className="object-cover" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {room.tags.map((tag, index) => (
                        <Badge key={index} className={`rounded-full ${tag === "New" ? "bg-green-500" : "bg-blue-500"}`}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <CardContent className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">{room.name}</h3>
                        <p className="text-slate-600 mb-4">{room.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-800">{room.price}</div>
                        <div className="text-sm text-slate-500">per month</div>
                      </div>
                    </div>

                    {/* Room Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Bed className="h-4 w-4" />
                        <span>{room.bedrooms} bed</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Bath className="h-4 w-4" />
                        <span>{room.bathrooms} bath</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Wifi className="h-4 w-4" />
                        <span>{room.speed}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="h-4 w-4" />
                        <span>{room.residents} residents</span>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="rounded-full">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Community Tags */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {room.communityTags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="rounded-full">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full rounded-full bg-slate-800 hover:bg-slate-700" asChild>
                      <Link href={`/rooms/${params.city}/${room.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </div>
              </Card>
            ))}
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
                  <div className="absolute top-4 left-4 bg-white rounded-full px-3 py-1 text-sm font-semibold shadow-lg">
                    ₫15.5M
                  </div>
                  <div className="absolute top-12 right-8 bg-white rounded-full px-3 py-1 text-sm font-semibold shadow-lg">
                    ₫18.2M
                  </div>
                  <div className="absolute bottom-8 left-8 bg-white rounded-full px-3 py-1 text-sm font-semibold shadow-lg">
                    ₫16.8M
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
