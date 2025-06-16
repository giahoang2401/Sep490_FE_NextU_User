"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Home,
  Briefcase,
  Palette,
  Calendar,
  Monitor,
  Heart,
  Brain,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Users,
  Wifi,
  Coffee,
  Dumbbell,
  Music,
  BookOpen,
  Camera,
  Utensils,
  Leaf,
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
} from "lucide-react"
import { useState } from "react"
import Image from "next/image"

const detailedServices = {
  residents: {
    icon: Home,
    color: "bg-blue-500",
    title: "RESIDENTS",
    description: "Comfortable living spaces designed for modern co-living",
    services: [
      {
        name: "Villa Room",
        description: "Private rooms in shared villas with common areas",
        features: ["Private bedroom", "Shared kitchen", "Common living area", "Garden access"],
        price: "From ₫12,000,000/month",
        image: "/placeholder.svg?height=200&width=300",
        amenities: [Wifi, Coffee, Dumbbell, Leaf],
      },
      {
        name: "Private Studio",
        description: "Fully private studio apartments with all amenities",
        features: ["Private bathroom", "Kitchenette", "Work area", "Balcony"],
        price: "From ₫18,000,000/month",
        image: "/placeholder.svg?height=200&width=300",
        amenities: [Wifi, Coffee, Dumbbell, Zap],
      },
      {
        name: "Shared Studio",
        description: "Shared studio spaces perfect for collaboration",
        features: ["Shared workspace", "Community kitchen", "Event space", "Rooftop access"],
        price: "From ₫8,000,000/month",
        image: "/placeholder.svg?height=200&width=300",
        amenities: [Wifi, Users, Coffee, Music],
      },
    ],
  },
  coworking: {
    icon: Briefcase,
    color: "bg-green-500",
    title: "CO-WORKING",
    description: "Professional workspaces for productivity and collaboration",
    services: [
      {
        name: "Individual Spots",
        description: "Dedicated desk spaces with personal storage",
        features: ["Dedicated desk", "Personal storage", "High-speed internet", "Printing access"],
        price: "From ₫2,500,000/month",
        image: "/placeholder.svg?height=200&width=300",
        amenities: [Wifi, Coffee, Zap, BookOpen],
      },
      {
        name: "Conference Rooms",
        description: "Professional meeting spaces for teams",
        features: ["Video conferencing", "Whiteboard", "Projector", "Catering service"],
        price: "From ₫500,000/hour",
        image: "/placeholder.svg?height=200&width=300",
        amenities: [Wifi, Users, Camera, Coffee],
      },
      {
        name: "Private Offices",
        description: "Fully private office spaces for teams",
        features: ["Private entrance", "Team storage", "Meeting area", "24/7 access"],
        price: "From ₫15,000,000/month",
        image: "/placeholder.svg?height=200&width=300",
        amenities: [Wifi, Users, Zap, BookOpen],
      },
    ],
  },
  cocreation: {
    icon: Palette,
    color: "bg-purple-500",
    title: "CO-CREATION",
    description: "Creative spaces for artistic expression and innovation",
    services: [
      {
        name: "Co-living Café",
        description: "Community café and social gathering space",
        features: ["Specialty coffee", "Healthy meals", "Social events", "Live music"],
        price: "Pay per consumption",
        image: "/placeholder.svg?height=200&width=300",
        amenities: [Coffee, Utensils, Music, Users],
      },
      {
        name: "Art Studio",
        description: "Creative workspace for visual artists",
        features: ["Art supplies", "Natural lighting", "Exhibition space", "Artist mentorship"],
        price: "From ₫3,000,000/month",
        image: "/placeholder.svg?height=200&width=300",
        amenities: [Palette, Leaf, Users, BookOpen],
      },
      {
        name: "Music Production",
        description: "Professional music recording and practice rooms",
        features: ["Soundproof rooms", "Recording equipment", "Instruments", "Mixing console"],
        price: "From ₫1,000,000/session",
        image: "/placeholder.svg?height=200&width=300",
        amenities: [Music, Zap, Users, BookOpen],
      },
      {
        name: "Writing Sanctuary",
        description: "Quiet spaces designed for writers and thinkers",
        features: ["Silent zones", "Comfortable seating", "Natural views", "Writing workshops"],
        price: "From ₫1,500,000/month",
        image: "/placeholder.svg?height=200&width=300",
        amenities: [BookOpen, Leaf, Coffee, Users],
      },
    ],
  },
  experiences: {
    icon: Calendar,
    color: "bg-orange-500",
    title: "EXPERIENCES",
    description: "Curated experiences for personal and professional growth",
    services: [
      {
        name: "Learning Clubs",
        description: "Skill-sharing communities and workshops",
        features: ["Weekly workshops", "Peer learning", "Expert sessions", "Certification"],
        price: "From ₫500,000/session",
        image: "/placeholder.svg?height=200&width=300",
        amenities: [BookOpen, Users, Coffee, Zap],
      },
      {
        name: "Masterminds",
        description: "Peer mentorship and accountability groups",
        features: ["Monthly meetings", "Goal setting", "Peer support", "Success tracking"],
        price: "From ₫2,000,000/month",
        image: "/placeholder.svg?height=200&width=300",
        amenities: [Users, BookOpen, Coffee, Star],
      },
      {
        name: "Wellness Retreats",
        description: "Mindfulness and wellness programs",
        features: ["Meditation sessions", "Yoga classes", "Wellness coaching", "Nature activities"],
        price: "From ₫5,000,000/retreat",
        image: "/placeholder.svg?height=200&width=300",
        amenities: [Heart, Leaf, Users, Dumbbell],
      },
    ],
  },
  digital: {
    icon: Monitor,
    color: "bg-cyan-500",
    title: "DIGITAL PLATFORM",
    description: "Online learning and community platform",
    services: [
      {
        name: "E-learning Platform",
        description: "Online courses and skill development",
        features: ["Video courses", "Interactive content", "Progress tracking", "Certificates"],
        price: "From ₫1,000,000/course",
        image: "/placeholder.svg?height=200&width=300",
        amenities: [Monitor, BookOpen, Zap, Star],
      },
      {
        name: "Masterclasses",
        description: "Expert-led intensive sessions",
        features: ["Industry experts", "Live sessions", "Q&A sessions", "Networking"],
        price: "From ₫3,000,000/class",
        image: "/placeholder.svg?height=200&width=300",
        amenities: [Monitor, Users, BookOpen, Star],
      },
      {
        name: "Community App",
        description: "Connect with residents and access services",
        features: ["Resident directory", "Event booking", "Service requests", "Community chat"],
        price: "Free for residents",
        image: "/placeholder.svg?height=200&width=300",
        amenities: [Monitor, Users, Wifi, Coffee],
      },
    ],
  },
}

const ecosystemPillars = {
  than: {
    title: "Thân (Body)",
    description: "Physical wellbeing and health",
    color: "bg-green-500",
    icon: Heart,
    activities: [
      {
        name: "Daily Yoga Sessions",
        description: "Morning and evening yoga classes for all levels",
        time: "7:00 AM & 6:00 PM",
      },
      {
        name: "Fitness Programs",
        description: "Personalized fitness training and group classes",
        time: "Flexible schedule",
      },
      {
        name: "Healthy Cooking Workshops",
        description: "Learn to prepare nutritious Vietnamese and international cuisine",
        time: "Weekends",
      },
      {
        name: "Wellness Retreats",
        description: "Weekend retreats focusing on physical and mental health",
        time: "Monthly",
      },
      {
        name: "Massage & Spa Services",
        description: "Professional massage and wellness treatments",
        time: "By appointment",
      },
      { name: "Outdoor Activities", description: "Hiking, cycling, and nature exploration", time: "Weekends" },
    ],
    stats: { participants: "2,500+", satisfaction: "98%", sessions: "1,200+" },
  },
  tam: {
    title: "Tâm (Mind)",
    description: "Emotional connection and community",
    color: "bg-blue-500",
    icon: Brain,
    activities: [
      {
        name: "Circle Talks",
        description: "Weekly sharing sessions for emotional connection",
        time: "Every Wednesday",
      },
      {
        name: "Community Building Events",
        description: "Social gatherings and team building activities",
        time: "Bi-weekly",
      },
      {
        name: "Emotional Wellness Workshops",
        description: "Learn emotional intelligence and stress management",
        time: "Monthly",
      },
      { name: "Healing Sessions", description: "Group therapy and individual counseling", time: "By appointment" },
      { name: "Mindful Communication Training", description: "Improve interpersonal relationships", time: "Quarterly" },
      { name: "Cultural Exchange Programs", description: "Connect with diverse communities", time: "Monthly" },
    ],
    stats: { participants: "1,800+", satisfaction: "96%", sessions: "800+" },
  },
  tri: {
    title: "Trí (Intellect)",
    description: "Conscious creativity and learning",
    color: "bg-purple-500",
    icon: Lightbulb,
    activities: [
      {
        name: "Creative Mentorship Programs",
        description: "One-on-one guidance from industry experts",
        time: "Ongoing",
      },
      { name: "Skill Development Workshops", description: "Technical and soft skills training", time: "Weekly" },
      { name: "Innovation Labs", description: "Collaborative spaces for new ideas and projects", time: "24/7 access" },
      {
        name: "Writing & Storytelling Circles",
        description: "Develop your narrative and communication skills",
        time: "Bi-weekly",
      },
      { name: "Entrepreneurship Support", description: "Business development and startup incubation", time: "Ongoing" },
      { name: "Tech Talks & Seminars", description: "Industry insights and knowledge sharing", time: "Monthly" },
    ],
    stats: { participants: "2,200+", satisfaction: "97%", sessions: "1,500+" },
  },
}

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

                      <Button className="w-full rounded-full bg-slate-800 hover:bg-slate-700">
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
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
