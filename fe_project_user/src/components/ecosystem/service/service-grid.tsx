import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Star, Users, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface ServiceGridProps {
  services: Array<{
    name: string
    slug?: string
    description: string
    features: string[]
    price: string
    image: string
    amenities: any[]
  }>
  serviceKey: string
}

export function ServiceGrid({ services, serviceKey }: ServiceGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      {services.map((item, index) => (
        <Card
          key={index}
          className="overflow-hidden rounded-3xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/90 backdrop-blur-sm"
        >
          <div className="relative h-64 overflow-hidden">
            <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
                <Star className="h-3 w-3 fill-current" />
                <span>4.9</span>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-xl font-bold mb-1">{item.name}</h3>
              <p className="text-sm opacity-90">{item.price}</p>
            </div>
          </div>

          <CardContent className="p-6">
            <p className="text-slate-600 mb-4 leading-relaxed">{item.description}</p>

            {/* Key Features */}
            <div className="space-y-2 mb-6">
              {item.features.slice(0, 3).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>

            {/* Amenities */}
            <div className="flex gap-2 mb-6">
              {item.amenities.slice(0, 4).map((Amenity, idx) => (
                <div key={idx} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <Amenity className="h-5 w-5 text-slate-600" />
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex justify-between text-xs text-slate-500 mb-6 bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>50+ users</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>24/7 access</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/ecosystem/${serviceKey}/${item.slug || item.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="flex-1"
              >
                <Button className="w-full rounded-full bg-slate-800 hover:bg-slate-700">
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
