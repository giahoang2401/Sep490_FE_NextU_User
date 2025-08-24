'use client'

import ComingSoonPage from "@/components/ecosystem/ComingSoonPage"
import { Monitor } from "lucide-react"

export default function DigitalPlatformPage() {
  return (
    <ComingSoonPage
      serviceName="Digital Platform"
      serviceDescription="Online learning and community connection tools"
      serviceIcon={Monitor}
      serviceColor="bg-cyan-500"
    />
  )
}
