"use client"

import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { detailedServices } from "@/data/ecosystem/ecosystem-data"
import { ServiceDetailHeader } from "@/components/ecosystem/service-detail/service-detail-header"
import { ServiceDetailGallery } from "@/components/ecosystem/service-detail/service-detail-gallery"
import { ServiceDetailFeatures } from "@/components/ecosystem/service-detail/service-detail-features"
import { ServiceDetailPricing } from "@/components/ecosystem/service-detail/service-detail-pricing"
import { ServiceDetailBooking } from "@/components/ecosystem/service-detail/service-detail-booking"
import { ServiceDetailReviews } from "@/components/ecosystem/service-detail/service-detail-reviews"

interface ServiceDetailPageProps {
  params: {
    service: string
    slug: string
  }
}

export default function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const serviceData = detailedServices[params.service as keyof typeof detailedServices]

  if (!serviceData) {
    notFound()
  }

  const serviceItem = serviceData.services.find(
    (item) => item.slug === params.slug || item.name.toLowerCase().replace(/\s+/g, "-") === params.slug,
  )

  if (!serviceItem) {
    notFound()
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm text-slate-600">
          <Link href="/ecosystem" className="hover:text-slate-800 transition-colors">
            Ecosystem
          </Link>
          <span>/</span>
          <Link href={`/ecosystem/${params.service}`} className="hover:text-slate-800 transition-colors">
            {serviceData.title}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">{serviceItem.name}</span>
        </div>

        {/* Back Button */}
        <Link href={`/ecosystem/${params.service}`}>
          <Button variant="outline" className="mb-8 rounded-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {serviceData.title}
          </Button>
        </Link>

        <ServiceDetailHeader service={serviceItem} category={serviceData} />
        <ServiceDetailGallery service={serviceItem} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          <div className="lg:col-span-2 space-y-8">
            <ServiceDetailFeatures service={serviceItem} />
            <ServiceDetailReviews service={serviceItem} />
          </div>

          <div className="space-y-6">
            <ServiceDetailPricing service={serviceItem} />
            <ServiceDetailBooking service={serviceItem} />
          </div>
        </div>
      </div>
    </div>
  )
}
