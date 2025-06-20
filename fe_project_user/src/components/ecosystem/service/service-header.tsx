import { Badge } from "@/components/ui/badge"

interface ServiceHeaderProps {
  service: {
    icon: any
    color: string
    title: string
    description: string
  }
}

export function ServiceHeader({ service }: ServiceHeaderProps) {
  return (
    <div className="text-center mb-16">
      <div
        className={`w-24 h-24 ${service.color} rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl`}
      >
        <service.icon className="h-12 w-12 text-white" />
      </div>
      <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-lg px-6 py-2">
        ✨ {service.title} Services
      </Badge>
      <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">{service.title}</h1>
      <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        {service.description}. Discover all our premium services designed to enhance your experience and support your
        goals.
      </p>
    </div>
  )
}
