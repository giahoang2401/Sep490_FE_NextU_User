"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Heart, Brain, Lightbulb, ChevronDown, ChevronUp, ArrowRight, CheckCircle } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { ecosystemOverview, ecosystemPillars } from "@/data/ecosystem/ecosystem-data"

export default function EcosystemPage() {
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null)

  const togglePillar = (pillar: string) => {
    setExpandedPillar(expandedPillar === pillar ? null : pillar)
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">🌟 Complete Ecosystem</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">{ecosystemOverview.hero.title}</h1>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-2">
            {ecosystemOverview.hero.subtitle}
          </p>
          <p className="text-lg text-slate-500 max-w-3xl mx-auto">
            {ecosystemOverview.hero.description}
          </p>
        </div>

        {/* Services Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Our Services</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Explore our comprehensive range of services designed to support every aspect of your co-living journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ecosystemOverview.services.map((service, index) => (
              <Card key={index} className="overflow-hidden rounded-3xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm group">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{service.title}</h3>
                  <p className="text-slate-600 mb-4">{service.description}</p>
                  
                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Link href={service.link}>
                    <Button className="w-full rounded-full bg-slate-800 hover:bg-slate-700 group-hover:bg-gradient-to-r group-hover:from-slate-800 group-hover:to-slate-700">
                      Explore {service.title}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Enhanced Three Pillars */}
        <div className="bg-white/30 backdrop-blur-sm rounded-3xl p-8 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Our Holistic Philosophy</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Next Universe is built on three fundamental pillars that work together to create a balanced and fulfilling
              co-living experience. Each pillar offers comprehensive programs and activities.
            </p>
          </div>

          {/* Pillars Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {ecosystemOverview.pillars.map((pillar, index) => (
              <Card key={index} className="rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${pillar.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <pillar.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{pillar.title}</h3>
                  <p className="text-slate-600 mb-4">{pillar.description}</p>
                  <div className="space-y-1">
                    {pillar.features.map((feature, idx) => (
                      <div key={idx} className="text-sm text-slate-500">{feature}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
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
            <Link href="/ecosystem/Co-living">
              <Button size="lg" className="rounded-full bg-white text-slate-800 hover:bg-gray-100 px-10">
                Explore Co-living Spaces
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/ecosystem/events">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-2 border-white text-white hover:bg-white hover:text-slate-800 px-10"
              >
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
