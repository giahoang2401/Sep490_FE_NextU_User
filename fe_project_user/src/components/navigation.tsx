"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { AuthStatus, } from "@/components/auth-status"
import { useAuth } from "./auth-context"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { isLoggedIn } = useAuth()

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-slate-800">
            Next U
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/rooms/hanoi" className="text-slate-700 hover:text-slate-900 transition-colors">
              Rooms
            </Link>
            <Link href="/packages" className="text-slate-700 hover:text-slate-900 transition-colors">
              Packages
            </Link>
            <Link href="/ecosystem" className="text-slate-700 hover:text-slate-900 transition-colors">
              Ecosystem
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="text-slate-700 hover:text-slate-900 transition-colors">
                  Profile
                </Link>
                <AuthStatus />
              </div>
            ) : (
              <>
                <Button variant="outline" className="rounded-full" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button className="rounded-full bg-slate-800 hover:bg-slate-700" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link href="/rooms/hanoi" className="block text-slate-700 hover:text-slate-900">
              Rooms
            </Link>
            <Link href="/packages" className="block text-slate-700 hover:text-slate-900">
              Packages
            </Link>
            <Link href="/ecosystem" className="block text-slate-700 hover:text-slate-900">
              Ecosystem
            </Link>

            {isLoggedIn ? (
              <Link href="/profile" className="block text-slate-700 hover:text-slate-900">
                Profile
              </Link>
            ) : (
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="outline" className="rounded-full" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button className="rounded-full bg-slate-800 hover:bg-slate-700" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
