import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Users, Clock } from "lucide-react"
import Image from "next/image"

interface ServiceDetailHeaderProps {
  service: {
    name: string
    description: string
    price: string
    image: string
    amenities: any[]
  }
  category: {
    title: string
    color: string
    icon: any
  }
}

export function ServiceDetailHeader({ service, category }: ServiceDetailHeaderProps) {
  return (
    <div className="mb-12">
      {/* Hero Image */}
      <div className="relative h-96 rounded-3xl overflow-hidden mb-8">
        <Image src={service.image || "/placeholder.svg"} alt={service.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <Badge className={`${category.color} text-white mb-3`}>
            <category.icon className="h-4 w-4 mr-2" />
            {category.title}
          </Badge>
          <h1 className="text-4xl font-bold mb-2">{service.name}</h1>
          <p className="text-xl opacity-90">{service.price}</p>
        </div>
        <div className="absolute top-6 right-6">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-semibold">4.9</span>
            <span className="text-sm opacity-80">(127 reviews)</span>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl">
          <MapPin className="h-5 w-5 text-blue-500" />
          <div>
            <p className="font-semibold text-slate-800">Location</p>
            <p className="text-sm text-slate-600">District 1, Ho Chi Minh City</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl">
          <Users className="h-5 w-5 text-green-500" />
          <div>
            <p className="font-semibold text-slate-800">Capacity</p>
            <p className="text-sm text-slate-600">Up to 50 people</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl">
          <Clock className="h-5 w-5 text-orange-500" />
          <div>
            <p className="font-semibold text-slate-800">Availability</p>
            <p className="text-sm text-slate-600">24/7 Access</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">About This Service</h2>
        <p className="text-slate-600 leading-relaxed text-lg">
          {service.description}. Our space is thoughtfully designed to provide the perfect environment for productivity,
          creativity, and community connection. Whether you're looking for a quiet place to focus or a collaborative
          environment to network and grow, we have everything you need to succeed.
        </p>
      </div>
    </div>
  )
}
