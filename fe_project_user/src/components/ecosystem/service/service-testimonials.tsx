import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"
import Image from "next/image"

interface ServiceTestimonialsProps {
  serviceKey: string
}

const testimonialsData = {
  residents: [
    {
      name: "Sarah Chen",
      role: "Digital Nomad",
      image: "/placeholder.svg?height=60&width=60",
      rating: 5,
      text: "Living at Next Universe has been transformative. The community is incredible and the spaces are beautifully designed.",
    },
    {
      name: "Michael Rodriguez",
      role: "Startup Founder",
      image: "/placeholder.svg?height=60&width=60",
      rating: 5,
      text: "Perfect balance of privacy and community. The villa rooms are spacious and the common areas foster great connections.",
    },
  ],
  coworking: [
    {
      name: "Emily Watson",
      role: "Freelance Designer",
      image: "/placeholder.svg?height=60&width=60",
      rating: 5,
      text: "The coworking space is incredibly productive. Fast internet, great coffee, and amazing networking opportunities.",
    },
    {
      name: "David Kim",
      role: "Tech Entrepreneur",
      image: "/placeholder.svg?height=60&width=60",
      rating: 5,
      text: "Conference rooms are top-notch with all the tech we need. The private offices have helped our team grow.",
    },
  ],
  cocreation: [
    {
      name: "Luna Martinez",
      role: "Visual Artist",
      image: "/placeholder.svg?height=60&width=60",
      rating: 5,
      text: "The art studio has everything I need. Natural light, quality supplies, and a supportive creative community.",
    },
    {
      name: "James Thompson",
      role: "Music Producer",
      image: "/placeholder.svg?height=60&width=60",
      rating: 5,
      text: "Recording quality is professional-grade. The soundproof rooms and equipment have elevated my music production.",
    },
  ],
  experiences: [
    {
      name: "Anna Nguyen",
      role: "Marketing Manager",
      image: "/placeholder.svg?height=60&width=60",
      rating: 5,
      text: "The learning clubs have expanded my skillset tremendously. Expert instructors and practical workshops.",
    },
    {
      name: "Robert Lee",
      role: "Consultant",
      image: "/placeholder.svg?height=60&width=60",
      rating: 5,
      text: "Mastermind groups provide incredible accountability and support. My business has grown significantly.",
    },
  ],
  digital: [
    {
      name: "Sophie Brown",
      role: "UX Designer",
      image: "/placeholder.svg?height=60&width=60",
      rating: 5,
      text: "E-learning platform is intuitive and comprehensive. The masterclasses with industry experts are invaluable.",
    },
    {
      name: "Alex Johnson",
      role: "Developer",
      image: "/placeholder.svg?height=60&width=60",
      rating: 5,
      text: "Community app keeps everyone connected. Easy to book services and participate in events.",
    },
  ],
}

export function ServiceTestimonials({ serviceKey }: ServiceTestimonialsProps) {
  const testimonials = testimonialsData[serviceKey as keyof typeof testimonialsData] || []

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">What Our Community Says</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Hear from our satisfied members about their experiences with our services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="p-6 rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="flex items-start gap-4 mb-4">
                <Image
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  width={60}
                  height={60}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">{testimonial.name}</h4>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <Quote className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-slate-700 leading-relaxed italic">"{testimonial.text}"</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
