// components/ui/Logo.tsx
"use client"

import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="text-2xl font-black bg-gradient-to-r from-[#28c4dd] via-[#5661b3] to-[#0c1f47] bg-clip-text text-transparent">
      Next Living
    </Link>
  )
}
