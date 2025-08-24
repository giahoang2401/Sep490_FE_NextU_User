'use client'

import ComingSoonPage from "@/components/ecosystem/ComingSoonPage"
import { Palette } from "lucide-react"

export default function CreativeStudiosPage() {
  return (
    <ComingSoonPage
      serviceName="Creative Studios"
      serviceDescription="Inspiring spaces for artistic expression and innovation"
      serviceIcon={Palette}
      serviceColor="bg-purple-500"
    />
  )
}
