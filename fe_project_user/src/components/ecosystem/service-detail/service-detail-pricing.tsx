import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"

interface ServiceDetailPricingProps {
  service: {
    name: string
    price: string
  }
}

export function ServiceDetailPricing({ service }: ServiceDetailPricingProps) {
  const pricingOptions = [
    {
      duration: "Monthly",
      price: service.price,
      discount: null,
      popular: true,
      features: ["Flexible cancellation", "All amenities included", "Community access"],
    },
    {
      duration: "3 Months",
      price: service.price.replace(/[\d,]/g, (match) =>
        String(Math.floor(Number.parseInt(match.replace(",", "")) * 0.9)),
      ),
      discount: "10% off",
      popular: false,
      features: ["10% discount", "Priority booking", "Extended guest privileges"],
    },
    {
      duration: "6 Months",
      price: service.price.replace(/[\d,]/g, (match) =>
        String(Math.floor(Number.parseInt(match.replace(",", "")) * 0.85)),
      ),
      discount: "15% off",
      popular: false,
      features: ["15% discount", "Free room upgrades", "Personal concierge service"],
    },
  ]

  return (
    <Card className="rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-slate-800">Pricing Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pricingOptions.map((option, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border-2 transition-all ${option.popular ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-slate-800">{option.duration}</h4>
                <p className="text-2xl font-bold text-slate-800">{option.price}</p>
              </div>
              <div className="text-right">
                {option.popular && <Badge className="bg-blue-500 text-white mb-1">Most Popular</Badge>}
                {option.discount && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {option.discount}
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {option.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
