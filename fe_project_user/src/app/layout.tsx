import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Next Universe - Mindful Co-living & Creative Ecosystem",
  description: "Find your perfect co-living experience with Next U",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-[#e8f9fc] to-[#cce9fa]">
          <Navigation />
          {children}
        </div>
      </body>
    </html>
  )
}
