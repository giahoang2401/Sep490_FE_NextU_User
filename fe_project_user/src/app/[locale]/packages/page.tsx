import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, X, MapPin } from "lucide-react"
import Link from "next/link"

const packages = {
  hanoi: [
    {
      name: "Cùng khám phá",
      price: "₫12,500,000",
      description: "Perfect for newcomers to co-living",
      features: {
        pool: true,
        coworking: false,
        mindfulActivities: true,
        coachingAccess: false,
      },
      highlights: ["Community events", "Basic amenities", "Shared spaces"],
    },
    {
      name: "Cùng tỉnh thức",
      price: "₫18,800,000",
      description: "For mindful living enthusiasts",
      features: {
        pool: true,
        coworking: true,
        mindfulActivities: true,
        coachingAccess: true,
      },
      highlights: ["Meditation sessions", "Wellness programs", "Personal coaching"],
    },
    {
      name: "Cùng kiến tạo",
      price: "₫25,200,000",
      description: "Complete creative ecosystem experience",
      features: {
        pool: true,
        coworking: true,
        mindfulActivities: true,
        coachingAccess: true,
      },
      highlights: ["Art studio access", "Creative workshops", "Mentorship programs"],
    },
  ],
  haiphong: [
    {
      name: "Cùng khám phá",
      price: "₫10,800,000",
      description: "Perfect for newcomers to co-living",
      features: {
        pool: false,
        coworking: false,
        mindfulActivities: true,
        coachingAccess: false,
      },
      highlights: ["Community events", "Basic amenities", "Shared spaces"],
    },
    {
      name: "Cùng tỉnh thức",
      price: "₫16,500,000",
      description: "For mindful living enthusiasts",
      features: {
        pool: true,
        coworking: true,
        mindfulActivities: true,
        coachingAccess: false,
      },
      highlights: ["Meditation sessions", "Wellness programs", "Community support"],
    },
    {
      name: "Cùng kiến tạo",
      price: "₫22,000,000",
      description: "Complete creative ecosystem experience",
      features: {
        pool: true,
        coworking: true,
        mindfulActivities: true,
        coachingAccess: true,
      },
      highlights: ["Art studio access", "Creative workshops", "Mentorship programs"],
    },
  ],
}

const featureLabels = {
  pool: "Pool Access",
  coworking: "Co-working Space",
  mindfulActivities: "Mindful Activities",
  coachingAccess: "Coaching Access",
}

export default function PackagesPage() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Explore Our Membership Packages by Location
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Choose the perfect package that fits your lifestyle and goals. Each package is designed to support your
            journey in our mindful co-living ecosystem.
          </p>
        </div>

        {/* Location Tabs */}
        <Tabs defaultValue="hanoi" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto rounded-full mb-8">
            <TabsTrigger value="hanoi" className="rounded-full">
              <MapPin className="h-4 w-4 mr-2" />
              Hanoi
            </TabsTrigger>
            <TabsTrigger value="haiphong" className="rounded-full">
              <MapPin className="h-4 w-4 mr-2" />
              Hai Phong
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hanoi">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.hanoi.map((pkg, index) => (
                <Card
                  key={index}
                  className={`rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${index === 1 ? "ring-2 ring-blue-500 transform scale-105" : ""}`}
                >
                  <CardHeader className="text-center pb-4">
                    {index === 1 && <Badge className="w-fit mx-auto mb-2 bg-blue-500">Most Popular</Badge>}
                    <CardTitle className="text-2xl text-slate-800">{pkg.name}</CardTitle>
                    <div className="text-3xl font-bold text-slate-800 mt-2">{pkg.price}</div>
                    <div className="text-slate-600">per month</div>
                    <p className="text-slate-600 mt-2">{pkg.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Features Matrix */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-800">Included Features</h4>
                      {Object.entries(pkg.features).map(([key, included]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-slate-600">{featureLabels[key as keyof typeof featureLabels]}</span>
                          {included ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-slate-300" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Highlights */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-800">Highlights</h4>
                      <ul className="space-y-2">
                        {pkg.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-slate-600">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button className="w-full rounded-full bg-slate-800 hover:bg-slate-700" asChild>
                      <Link href="/packages/request">Request This Package</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="haiphong">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.haiphong.map((pkg, index) => (
                <Card
                  key={index}
                  className={`rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${index === 1 ? "ring-2 ring-blue-500 transform scale-105" : ""}`}
                >
                  <CardHeader className="text-center pb-4">
                    {index === 1 && <Badge className="w-fit mx-auto mb-2 bg-blue-500">Most Popular</Badge>}
                    <CardTitle className="text-2xl text-slate-800">{pkg.name}</CardTitle>
                    <div className="text-3xl font-bold text-slate-800 mt-2">{pkg.price}</div>
                    <div className="text-slate-600">per month</div>
                    <p className="text-slate-600 mt-2">{pkg.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Features Matrix */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-800">Included Features</h4>
                      {Object.entries(pkg.features).map(([key, included]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-slate-600">{featureLabels[key as keyof typeof featureLabels]}</span>
                          {included ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-slate-300" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Highlights */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-800">Highlights</h4>
                      <ul className="space-y-2">
                        {pkg.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-slate-600">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button className="w-full rounded-full bg-slate-800 hover:bg-slate-700" asChild>
                      <Link href="/packages/request">Request This Package</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="text-center mt-16 bg-white/30 backdrop-blur-sm rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Need a Custom Package?</h2>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Our team can create a personalized package that perfectly fits your needs and lifestyle. Contact us to
            discuss your requirements.
          </p>
          <Button size="lg" className="rounded-full bg-slate-800 hover:bg-slate-700">
            Contact Our Team
          </Button>
        </div>
      </div>
    </div>
  )
}
