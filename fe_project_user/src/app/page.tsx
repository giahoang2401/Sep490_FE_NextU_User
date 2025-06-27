"use client";
import "@/i18n"
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Star,
  ArrowRight,
  CheckCircle,
  Heart,
  Brain,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import './globals.css'
import PackageSection from "@/components/package/PackageSection";


const popularCities = [
  {
    name: "Hanoi",
    flag: "🇻🇳",
    spaces: 45,
    priceFrom: "₫14,780,120",
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.8,
    reviews: 156,
    ecosystem: {
      residents: ["Villa Rooms", "Private Studios", "Shared Studios"],
      coworking: ["Individual Spots", "Conference Rooms", "Private Offices"],
      experiences: ["Learning Clubs", "Masterminds", "Wellness Retreats"],
      specialties: ["Art Studio", "Music Production", "Mindfulness Center"],
    },
  },
  {
    name: "Ho Chi Minh City",
    flag: "🇻🇳",
    spaces: 38,
    priceFrom: "₫16,500,000",
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.9,
    reviews: 203,
    ecosystem: {
      residents: ["Luxury Suites", "Studio Apartments", "Shared Spaces"],
      coworking: ["Tech Hub", "Creative Spaces", "Meeting Rooms"],
      experiences: ["Startup Events", "Networking", "Cultural Tours"],
      specialties: ["Innovation Lab", "Digital Studio", "Rooftop Garden"],
    },
  },
  {
    name: "Da Nang",
    flag: "🇻🇳",
    spaces: 22,
    priceFrom: "₫12,200,000",
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.7,
    reviews: 89,
    ecosystem: {
      residents: ["Beach Villas", "Mountain Views", "City Studios"],
      coworking: ["Beachfront Office", "Mountain Retreat", "City Center"],
      experiences: ["Surf Lessons", "Mountain Hiking", "Beach Yoga"],
      specialties: ["Wellness Spa", "Adventure Center", "Meditation Garden"],
    },
  },
  {
    name: "Hai Phong",
    flag: "🇻🇳",
    spaces: 18,
    priceFrom: "₫11,800,000",
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.6,
    reviews: 67,
    ecosystem: {
      residents: ["Port View Rooms", "Historic Quarters", "Modern Studios"],
      coworking: ["Maritime Hub", "Historic Spaces", "Modern Offices"],
      experiences: ["Cultural Heritage", "Port Tours", "Local Crafts"],
      specialties: ["Heritage Center", "Craft Workshop", "Cultural Hub"],
    },
  },
  {
    name: "Can Tho",
    flag: "🇻🇳",
    spaces: 15,
    priceFrom: "₫10,500,000",
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.5,
    reviews: 45,
    ecosystem: {
      residents: ["Riverside Villas", "Delta Views", "Traditional Houses"],
      coworking: ["Floating Office", "Garden Spaces", "Traditional Rooms"],
      experiences: ["Mekong Tours", "Floating Markets", "Traditional Cooking"],
      specialties: ["Floating Garden", "Traditional Craft", "River Activities"],
    },
  },
  {
    name: "Nha Trang",
    flag: "🇻🇳",
    spaces: 12,
    priceFrom: "₫13,200,000",
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.8,
    reviews: 78,
    ecosystem: {
      residents: ["Beachfront Suites", "Island Views", "Coastal Studios"],
      coworking: ["Ocean View Office", "Beach Pavilion", "Island Retreat"],
      experiences: ["Island Hopping", "Scuba Diving", "Beach Sports"],
      specialties: ["Marine Center", "Beach Club", "Water Sports Hub"],
    },
  },
];

const ecosystemPillars = [
  {
    icon: Heart,
    title: "Thân (Body)",
    description: "Physical wellbeing and health",
    color: "bg-green-500",
    features: [
      "Daily Yoga",
      "Fitness Programs",
      "Wellness Retreats",
      "Healthy Nutrition",
    ],
  },
  {
    icon: Brain,
    title: "Tâm (Mind)",
    description: "Emotional connection and community",
    color: "bg-blue-500",
    features: [
      "Circle Talks",
      "Community Events",
      "Emotional Wellness",
      "Healing Sessions",
    ],
  },
  {
    icon: Lightbulb,
    title: "Trí (Intellect)",
    description: "Conscious creativity and learning",
    color: "bg-purple-500",
    features: [
      "Creative Workshops",
      "Skill Development",
      "Innovation Labs",
      "Mentorship",
    ],
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Digital Nomad",
    location: "Hanoi",
    content:
      "Next U transformed my remote work experience. The community here is incredible, and the mindful approach to co-living has helped me grow both personally and professionally.",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
  },
  {
    name: "David Nguyen",
    role: "Startup Founder",
    location: "Ho Chi Minh City",
    content:
      "The ecosystem at Next U is perfect for entrepreneurs. From the co-working spaces to the networking events, everything is designed to foster innovation and collaboration.",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
  },
  {
    name: "Maria Rodriguez",
    role: "Creative Artist",
    location: "Da Nang",
    content:
      "As an artist, I found my creative sanctuary at Next U. The art studios, creative workshops, and inspiring community have elevated my work to new heights.",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
  },
];

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e8f9fc] via-[#f0fbfd] to-[#cce9fa]" />
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] bg-cover bg-center opacity-5" />

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="mb-4 bg-white/20 text-slate-700 border-white/30 backdrop-blur-sm">
              🌟 {t('home.hero.badge')}
            </Badge>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-8 leading-tight">
            {t('home.hero.title1')}{" "}
            <span className="text-7xl font-black bg-gradient-to-r from-[#28c4dd] via-[#5661b3] to-[#0c1f47] bg-clip-text text-transparent tracking-tight">
              {t('home.hero.title2')}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            {t('home.hero.desc1')} <strong>{t('home.hero.body')}</strong>, <strong>{t('home.hero.mind')}</strong>, {t('home.hero.and')} <strong>{t('home.hero.creativity')}</strong>. {t('home.hero.desc2')}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button
              size="lg"
              className="rounded-full bg-slate-800 hover:bg-slate-700 px-10 py-6 text-lg shadow-xl"
            >
              {t('home.hero.cta1')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-10 py-6 text-lg border-2 border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30"
            >
              {t('home.hero.cta2')}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-slate-800">
                360+
              </div>
              <div className="text-slate-600">{t('home.hero.stats.cities')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-slate-800">
                2,500+
              </div>
              <div className="text-slate-600">{t('home.hero.stats.residents')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-slate-800">
                4.8★
              </div>
              <div className="text-slate-600">{t('home.hero.stats.rating')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-slate-800">
                98%
              </div>
              <div className="text-slate-600">{t('home.hero.stats.satisfaction')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Most Popular Cities with Enhanced Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              {t('home.cities.title')}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t('home.cities.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {popularCities.map((city, index) => (
              <Card
                key={index}
                className="group overflow-hidden rounded-3xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={city.image || "/placeholder.svg"}
                    alt={city.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* City Info Overlay */}
                  <div className="absolute bottom-6 left-6 text-white">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{city.flag}</span>
                      <div>
                        <h3 className="text-2xl font-bold">{city.name}</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{city.rating}</span>
                          <span>({city.reviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{city.spaces} spaces</span>
                      </div>
                    </div>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-6 right-6">
                    <Badge className="bg-white/90 text-slate-800 font-semibold px-3 py-1">
                      From {city.priceFrom}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Ecosystem Preview */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-800 mb-3">
                      Available Services
                    </h4>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="font-medium text-slate-700 mb-1">
                          Residents
                        </div>
                        <div className="text-slate-600">
                          {city.ecosystem.residents.length} options
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-slate-700 mb-1">
                          Co-working
                        </div>
                        <div className="text-slate-600">
                          {city.ecosystem.coworking.length} spaces
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-slate-700 mb-1">
                          Experiences
                        </div>
                        <div className="text-slate-600">
                          {city.ecosystem.experiences.length} activities
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-slate-700 mb-1">
                          Specialties
                        </div>
                        <div className="text-slate-600">
                          {city.ecosystem.specialties.length} unique
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <Button
                        className="w-full rounded-full bg-slate-800 hover:bg-slate-700 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 transition-all duration-300"
                        asChild
                      >
                        <Link
                          href={`/rooms/${city.name
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          Explore {city.name}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-10 py-6 text-lg border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50"
            >
              Show all 360 cities
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Package Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Featured Packages
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Discover our most popular co-living packages designed to enhance your lifestyle
            </p>
          </div>
        </div>
        <PackageSection 
          showHero={false} 
          showLocationFilter={false} 
          showTypeFilter={true}
          maxPackages={3}
          className="bg-transparent"
        />
      </section>

      {/* Ecosystem Overview by Location */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Our Ecosystem by Location
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Each location offers a unique blend of services tailored to the
              local culture and community needs
            </p>
          </div>

          {/* Featured Locations */}
          <div className="space-y-16">
            {popularCities.slice(0, 3).map((city, index) => (
              <div
                key={index}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
                }`}
              >
                <div className={`${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                  <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
                    <Image
                      src={city.image || "/placeholder.svg"}
                      alt={city.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{city.flag}</span>
                        <h3 className="text-2xl font-bold">{city.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>
                          {city.rating} ({city.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`${
                    index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""
                  }`}
                >
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-3xl font-bold text-slate-800 mb-4">
                        {city.name} Ecosystem
                      </h3>
                      <p className="text-lg text-slate-600 mb-6">
                        Discover the unique blend of services and experiences
                        available in {city.name}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-4 bg-blue-50 border-blue-200 rounded-2xl">
                        <h4 className="font-semibold text-slate-800 mb-2">
                          Residents
                        </h4>
                        <ul className="space-y-1 text-sm text-slate-600">
                          {city.ecosystem.residents.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-blue-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </Card>

                      <Card className="p-4 bg-green-50 border-green-200 rounded-2xl">
                        <h4 className="font-semibold text-slate-800 mb-2">
                          Co-working
                        </h4>
                        <ul className="space-y-1 text-sm text-slate-600">
                          {city.ecosystem.coworking.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </Card>

                      <Card className="p-4 bg-purple-50 border-purple-200 rounded-2xl">
                        <h4 className="font-semibold text-slate-800 mb-2">
                          Experiences
                        </h4>
                        <ul className="space-y-1 text-sm text-slate-600">
                          {city.ecosystem.experiences.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-purple-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </Card>

                      <Card className="p-4 bg-orange-50 border-orange-200 rounded-2xl">
                        <h4 className="font-semibold text-slate-800 mb-2">
                          Specialties
                        </h4>
                        <ul className="space-y-1 text-sm text-slate-600">
                          {city.ecosystem.specialties.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-orange-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>

                    <div className="pt-4">
                      <Button
                        className="rounded-full bg-slate-800 hover:bg-slate-700 px-8"
                        asChild
                      >
                        <Link
                          href={`/rooms/${city.name
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          Explore {city.name}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Our Three Pillars
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Next Universe is built on three fundamental pillars that work
              together to create a balanced and fulfilling co-living experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ecosystemPillars.map((pillar, index) => (
              <Card
                key={index}
                className="text-center p-8 rounded-3xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
              >
                <div
                  className={`w-20 h-20 ${pillar.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}
                >
                  <pillar.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  {pillar.title}
                </h3>
                <p className="text-slate-600 mb-6">{pillar.description}</p>
                <div className="space-y-2">
                  {pillar.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-center gap-2 text-sm text-slate-600"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              className="rounded-full bg-slate-800 hover:bg-slate-700 px-10"
              asChild
            >
              <Link href="/ecosystem">
                Explore Full Ecosystem
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              What Our Community Says
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Hear from residents who have transformed their lives through our
              mindful co-living ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="p-8 rounded-3xl border-0 shadow-xl bg-white/80 backdrop-blur-sm"
              >
                <div className="flex items-center gap-4 mb-6">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-800">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                    <p className="text-sm text-slate-500">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-slate-600 italic">"{testimonial.content}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-800 to-slate-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of like-minded individuals who have found their
            perfect co-living experience with Next Universe
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="rounded-full bg-white text-slate-800 hover:bg-gray-100 px-10 py-6 text-lg"
            >
              Find Your Space
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-2 border-white text-white hover:bg-white hover:text-slate-800 px-10 py-6 text-lg"
            >
              Schedule a Tour
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
