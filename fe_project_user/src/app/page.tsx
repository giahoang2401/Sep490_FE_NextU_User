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
import FeaturedProperties from "@/components/home/FeaturedProperties";
import Footer from "@/components/footer/Footer";

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

      {/* Featured Properties Section */}
      <FeaturedProperties />

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

      {/* Footer */}
      <Footer />
   
    </div>
  );
}
