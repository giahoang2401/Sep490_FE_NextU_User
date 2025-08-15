'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MyBookingsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect mặc định đến package booking
    router.replace('/my-bookings/package-bookings')
  }, [router])

  return null // Không hiển thị gì vì sẽ redirect
} 