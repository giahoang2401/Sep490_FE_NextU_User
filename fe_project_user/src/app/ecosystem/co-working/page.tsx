'use client'

import ComingSoonPage from "@/components/ecosystem/ComingSoonPage"
import { Briefcase } from "lucide-react"

export default function CoWorkingPage() {
  return (
    <ComingSoonPage
      serviceName="Co-working"
      serviceDescription="Professional workspaces for productivity and collaboration"
      serviceIcon={Briefcase}
      serviceColor="bg-green-500"
    />
  )
}
