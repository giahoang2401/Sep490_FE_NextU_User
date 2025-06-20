import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Wifi, Coffee, Dumbbell, Users, Zap, Shield, Heart, Clock } from "lucide-react"

interface ServiceDetailFeaturesProps {
  service: {
    name: string
    features: string[]
    amenities: any[]
  }
}

export function ServiceDetailFeatures({ service }: ServiceDetailFeaturesProps) {
  const additionalFeatures = [
    "24/7 security and access control",
    "High-speed fiber internet (1GB/s)",
    "Professional cleaning service",
    "Climate-controlled environment",
    "Natural lighting throughout",
    "Ergonomic furniture and equipment",
    "Sound insulation for quiet work",
    "Emergency backup power",
  ]

  const amenityDetails = [
    { icon: Wifi, name: "High-Speed Internet", description: "Fiber optic connection up to 1GB/s" },
    { icon: Coffee, name: "Premium Coffee", description: "Complimentary specialty coffee and tea" },
    { icon: Dumbbell, name: "Fitness Access", description: "24/7 access to fitness facilities" },
    { icon: Users, name: "Community Events", description: "Regular networking and social events" },
    { icon: Zap, name: "Power Backup", description: "Uninterrupted power supply" },
    { icon: Shield, name: "Security", description: "24/7 security and access control" },
    { icon: Heart, name: "Wellness Programs", description: "Access to wellness and mindfulness programs" },
    { icon: Clock, name: "Flexible Access", description: "24/7 access for members" },
  ]

  return (
    <div className="space-y-8">
      {/* Main Features */}
      <Card className="rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-800">Features & Inclusions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...service.features, ...additionalFeatures].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Amenities Detail */}
      <Card className="rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-800">Amenities & Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {amenityDetails.map((amenity, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <amenity.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">{amenity.name}</h4>
                  <p className="text-sm text-slate-600">{amenity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
