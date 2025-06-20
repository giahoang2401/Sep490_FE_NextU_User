"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Heart, Brain, Lightbulb, ChevronDown, ChevronUp, ArrowRight, CheckCircle } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { detailedServices, ecosystemPillars } from "@/data/ecosystem/ecosystem-data"

export default function EcosystemPage() {
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null)
  const [activeService, setActiveService] = useState("residents")

  const togglePillar = (pillar: string) => {
    setExpandedPillar(expandedPillar === pillar ? null : pillar)
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">🌟 Complete Ecosystem</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">OUR SERVICE ECOSYSTEM</h1>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Discover our comprehensive ecosystem designed to nurture your body, mind, and creativity. From co-living
            spaces to digital platforms, we provide everything you need for holistic growth and meaningful connections.
          </p>
        </div>

        {/* Services Tabs */}
        <Tabs value={activeService} onValueChange={setActiveService} className="mb-20">
          <TabsList className="grid w-full grid-cols-5 rounded-2xl bg-white/50 backdrop-blur-sm p-2 mb-8">
            {Object.entries(detailedServices).map(([key, service]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <service.icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{service.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(detailedServices).map(([key, service]) => (
            <TabsContent key={key} value={key} className="space-y-8">
              {/* Service Header */}
              <div className="text-center mb-12">
                <div
                  className={`w-20 h-20 ${service.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl`}
                >
                  <service.icon className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-4">{service.title}</h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">{service.description}</p>
              </div>

              {/* Service Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {service.services.map((item, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden rounded-3xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="text-sm opacity-90">{item.price}</p>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <p className="text-slate-600 mb-4">{item.description}</p>

                      {/* Features */}
                      <div className="space-y-2 mb-4">
                        {item.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      {/* Amenities */}
                      <div className="flex gap-2 mb-4">
                        {item.amenities.map((Amenity, idx) => (
                          <div key={idx} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                            <Amenity className="h-4 w-4 text-slate-600" />
                          </div>
                        ))}
                      </div>

                      <Link href={`/ecosystem/${key}/${item.slug || item.name.toLowerCase().replace(/\s+/g, "-")}`}>
                        <Button className="w-full rounded-full bg-slate-800 hover:bg-slate-700">
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* View All Services Button */}
              <div className="text-center mt-12">
                <Link href={`/ecosystem/${key}`}>
                  <Button
                    size="lg"
                    className="rounded-full bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 px-8"
                  >
                    View All {service.title} Services
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Enhanced Three Pillars */}
        <div className="bg-white/30 backdrop-blur-sm rounded-3xl p-8 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Our Holistic Philosophy</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Next Universe is built on three fundamental pillars that work together to create a balanced and fulfilling
              co-living experience. Each pillar offers comprehensive programs and activities.
            </p>
          </div>

          {/* Visual Metaphor */}
          <div className="flex justify-center mb-12">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 rounded-full border-4 border-slate-300 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-800 mb-2">Next U</div>
                  <div className="text-lg text-slate-600">Ecosystem</div>
                  <div className="text-sm text-slate-500 mt-2">Body • Mind • Intellect</div>
                </div>
              </div>

              {/* Pillar indicators */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-xl">
                <Heart className="h-10 w-10" />
              </div>
              <div className="absolute bottom-8 left-8 w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-xl">
                <Brain className="h-10 w-10" />
              </div>
              <div className="absolute bottom-8 right-8 w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-xl">
                <Lightbulb className="h-10 w-10" />
              </div>
            </div>
          </div>

          {/* Detailed Pillar Cards */}
          <div className="space-y-6">
            {Object.entries(ecosystemPillars).map(([key, pillar]) => (
              <Card key={key} className="rounded-3xl border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="cursor-pointer" onClick={() => togglePillar(key)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-16 h-16 ${pillar.color} rounded-full flex items-center justify-center text-white shadow-lg`}
                      >
                        <pillar.icon className="h-8 w-8" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-slate-800">{pillar.title}</CardTitle>
                        <p className="text-slate-600">{pillar.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {/* Stats */}
                      <div className="hidden md:flex gap-6 text-center">
                        <div>
                          <div className="text-lg font-bold text-slate-800">{pillar.stats.participants}</div>
                          <div className="text-xs text-slate-500">Participants</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-slate-800">{pillar.stats.satisfaction}</div>
                          <div className="text-xs text-slate-500">Satisfaction</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-slate-800">{pillar.stats.sessions}</div>
                          <div className="text-xs text-slate-500">Sessions</div>
                        </div>
                      </div>
                      {expandedPillar === key ? (
                        <ChevronUp className="h-6 w-6 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {expandedPillar === key && (
                  <CardContent className="pt-0 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pillar.activities.map((activity, index) => (
                        <Card key={index} className="p-4 bg-slate-50 border-slate-200 rounded-2xl">
                          <h4 className="font-semibold text-slate-800 mb-2">{activity.name}</h4>
                          <p className="text-sm text-slate-600 mb-3">{activity.description}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            {activity.time}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-slate-800 to-slate-700 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Our Ecosystem?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Experience the perfect balance of body, mind, and creativity in our mindful co-living community. Start your
            journey with Next Universe today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-full bg-white text-slate-800 hover:bg-gray-100 px-10">
              Explore Spaces
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-2 border-white text-white hover:bg-white hover:text-slate-800 px-10"
            >
              Schedule a Tour
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
