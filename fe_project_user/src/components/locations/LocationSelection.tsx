"use client";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Building, ArrowRight, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { roomService, City, Location, Property } from "@/api/roomService"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function LocationSelection() {
  const [cities, setCities] = useState<City[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  
  const [selectedCity, setSelectedCity] = useState<string>("all")
  const [selectedLocation, setSelectedLocation] = useState<string>("all")
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [citiesData, locationsData, propertiesData] = await Promise.all([
          roomService.getCities(),
          roomService.getLocations(),
          roomService.getProperties()
        ])
        
        setCities(citiesData)
        setLocations(locationsData)
        setProperties(propertiesData)
        setFilteredLocations(locationsData)
        setFilteredProperties(propertiesData)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter locations based on selected city
  useEffect(() => {
    if (selectedCity === "all") {
      setFilteredLocations(locations)
    } else {
      const filtered = locations.filter(location => location.cityId === selectedCity)
      setFilteredLocations(filtered)
    }
    setSelectedLocation("all") // Reset location filter when city changes
  }, [selectedCity, locations])

  // Filter properties based on selected city and location
  useEffect(() => {
    let filtered = properties

    if (selectedCity !== "all") {
      filtered = filtered.filter(property => property.cityId === selectedCity)
    }

    if (selectedLocation !== "all") {
      filtered = filtered.filter(property => property.locationId === selectedLocation)
    }

    setFilteredProperties(filtered)
  }, [selectedCity, selectedLocation, properties])

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner message="Loading properties..." />
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Choose Your Property</h1>
          <p className="text-lg text-slate-600">Select a location to explore available co-living spaces</p>
        </div>

        {/* City Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedCity("all")}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                selectedCity === "all"
                  ? "bg-slate-800 text-white shadow-lg"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              Tất cả
            </button>
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => setSelectedCity(city.id)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  selectedCity === city.id
                    ? "bg-slate-800 text-white shadow-lg"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Location Filter Tabs */}
        {filteredLocations.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSelectedLocation("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedLocation === "all"
                    ? "bg-slate-800 text-white shadow-lg"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                Tất cả
              </button>
              {filteredLocations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedLocation === location.id
                      ? "bg-slate-800 text-white shadow-lg"
                      : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  {location.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card
              key={property.id}
              className="overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white"
            >
              <Link href={`/locations/${property.id}`}>
                <div className="relative h-48">
                  {property.coverImage && property.coverImage.trim() !== '' ? (
                    <Image 
                      src={property.coverImage}
                      alt={property.name} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm font-medium">Image not updated</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Logo overlay */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1">
                      <span className="text-white font-semibold text-sm">express</span>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1">{property.name}</h3>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{property.locationName}, {property.cityName}</span>
                    </div>
                    <Badge className="rounded-full bg-blue-500 text-white">
                      Available
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Building className="h-4 w-4" />
                      <span>Co-living Space</span>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="rounded-full bg-slate-800 hover:bg-slate-700 text-white px-4 py-2"
                    >
                      Đặt ngay
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {/* No properties found */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Building className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500">Try selecting a different city or location filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}
