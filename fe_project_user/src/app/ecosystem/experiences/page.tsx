'use client'

import ComingSoonPage from "@/components/ecosystem/ComingSoonPage"
import { Star } from "lucide-react"

export default function ExperiencesPage() {
  return (
    <ComingSoonPage
      serviceName="Experiences"
      serviceDescription="Personalized journeys for growth and discovery"
      serviceIcon={Star}
      serviceColor="bg-orange-500"
    />
  )
}
