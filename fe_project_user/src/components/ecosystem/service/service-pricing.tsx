import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight } from "lucide-react"

interface ServicePricingProps {
  serviceKey: string
}

const pricingData = {
  residents: [
    {
      name: "Shared Studio",
      price: "₫8,000,000",
      period: "/month",
      popular: false,
      features: ["Shared workspace", "Community kitchen", "Event access", "Rooftop access", "Utilities included"],
    },
    {
      name: "Villa Room",
      price: "₫12,000,000",
      period: "/month",
      popular: true,
      features: [
        "Private bedroom",
        "Shared kitchen",
        "Common living area",
        "Garden access",
        "All amenities",
        "Cleaning service",
      ],
    },
    {
      name: "Private Studio",
      price: "₫18,000,000",
      period: "/month",
      popular: false,
      features: ["Private bathroom", "Kitchenette", "Work area", "Balcony", "Premium amenities", "Concierge service"],
    },
  ],
  coworking: [
    {
      name: "Hot Desk",
      price: "₫1,500,000",
      period: "/month",
      popular: false,
      features: ["Flexible seating", "High-speed internet", "Coffee & tea", "Printing access", "Community events"],
    },
    {
      name: "Dedicated Desk",
      price: "₫2,500,000",
      period: "/month",
      popular: true,
      features: ["Personal desk", "Storage locker", "High-speed internet", "Meeting room access", "All amenities"],
    },
    {
      name: "Private Office",
      price: "₫15,000,000",
      period: "/month",
      popular: false,
      features: ["Private space", "Team storage", "Meeting area", "24/7 access", "Premium support", "Custom setup"],
    },
  ],
}

export function ServicePricing({ serviceKey }: ServicePricingProps) {
  const pricing = pricingData[serviceKey as keyof typeof pricingData] || []

  if (pricing.length === 0) return null

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Transparent Pricing</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Choose the plan that best fits your needs. All plans include our core amenities and community access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricing.map((plan, index) => (
          <Card
            key={index}
            className={`relative rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${plan.popular ? "ring-2 ring-blue-500 scale-105" : ""}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                Most Popular
              </Badge>
            )}
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold text-slate-800">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-3xl font-bold text-slate-800">{plan.price}</span>
                <span className="text-slate-600">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full rounded-full ${plan.popular ? "bg-blue-500 hover:bg-blue-600" : "bg-slate-800 hover:bg-slate-700"}`}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
