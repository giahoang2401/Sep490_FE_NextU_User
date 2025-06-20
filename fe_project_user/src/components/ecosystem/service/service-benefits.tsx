import { Card } from "@/components/ui/card"
import { Users, Zap, Heart, Shield, Clock, Award } from "lucide-react"

interface ServiceBenefitsProps {
  serviceKey: string
}

const benefitsData = {
  residents: [
    {
      icon: Users,
      title: "Community Living",
      description: "Connect with like-minded individuals in a supportive environment",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "24/7 security and safe living environment for peace of mind",
    },
    { icon: Zap, title: "All-Inclusive", description: "Utilities, internet, and amenities included in your rent" },
    { icon: Heart, title: "Wellness Focus", description: "Access to wellness programs and healthy living initiatives" },
  ],
  coworking: [
    { icon: Zap, title: "High-Speed Internet", description: "Blazing fast fiber internet for seamless productivity" },
    { icon: Users, title: "Networking", description: "Connect with entrepreneurs, freelancers, and professionals" },
    { icon: Clock, title: "Flexible Hours", description: "24/7 access to accommodate your work schedule" },
    { icon: Award, title: "Premium Amenities", description: "Modern facilities and professional meeting spaces" },
  ],
  cocreation: [
    {
      icon: Heart,
      title: "Creative Community",
      description: "Collaborate with artists, writers, and creative professionals",
    },
    { icon: Zap, title: "Inspiration", description: "Stimulating environment designed to spark creativity" },
    { icon: Users, title: "Mentorship", description: "Learn from experienced artists and creative professionals" },
    { icon: Award, title: "Exhibition Space", description: "Showcase your work in our dedicated gallery spaces" },
  ],
  experiences: [
    { icon: Users, title: "Expert Guidance", description: "Learn from industry experts and experienced mentors" },
    { icon: Heart, title: "Personal Growth", description: "Programs designed for holistic personal development" },
    { icon: Award, title: "Certification", description: "Earn certificates and credentials for your achievements" },
    { icon: Zap, title: "Practical Skills", description: "Hands-on learning with real-world applications" },
  ],
  digital: [
    { icon: Zap, title: "Cutting-Edge Tech", description: "Latest technology and digital learning platforms" },
    { icon: Users, title: "Global Community", description: "Connect with learners and professionals worldwide" },
    { icon: Clock, title: "Self-Paced", description: "Learn at your own pace with flexible scheduling" },
    { icon: Award, title: "Industry Recognition", description: "Certificates recognized by leading companies" },
  ],
}

export function ServiceBenefits({ serviceKey }: ServiceBenefitsProps) {
  const benefits = benefitsData[serviceKey as keyof typeof benefitsData] || []

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Why Choose Our Services?</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Discover the unique advantages and benefits that set our services apart from the rest.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit, index) => (
          <Card
            key={index}
            className="text-center p-6 rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <benefit.icon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">{benefit.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
