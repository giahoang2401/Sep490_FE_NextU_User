import { Card } from "@/components/ui/card"
import Image from "next/image"

interface ServiceDetailGalleryProps {
  service: {
    name: string
  }
}

export function ServiceDetailGallery({ service }: ServiceDetailGalleryProps) {
  const galleryImages = [
    "/placeholder.svg?height=300&width=400",
    "/placeholder.svg?height=300&width=400",
    "/placeholder.svg?height=300&width=400",
    "/placeholder.svg?height=300&width=400",
    "/placeholder.svg?height=300&width=400",
    "/placeholder.svg?height=300&width=400",
  ]

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Gallery</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {galleryImages.map((image, index) => (
          <Card
            key={index}
            className="overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="relative h-48">
              <Image
                src={image || "/placeholder.svg"}
                alt={`${service.name} - Image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
