"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { AuthStatus } from "@/components/auth-status";
import { useAuth } from "./auth-context";
import { Logo } from "@/components/ui/Logo";
export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo branding: "Next" + "U" với 2 màu tách biệt */}
          <Logo />
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/rooms/hanoi"
              className="text-[#1d2951] hover:text-[#35b9da] transition-colors font-medium"
            >
              Rooms
            </Link>
            <Link
              href="/packages"
              className="text-[#1d2951] hover:text-[#35b9da] transition-colors font-medium"
            >
              Packages
            </Link>
            <Link
              href="/ecosystem"
              className="text-[#1d2951] hover:text-[#35b9da] transition-colors font-medium"
            >
              Ecosystem
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="text-[#1d2951] hover:text-[#35b9da] font-medium transition-colors"
                >
                  Profile
                </Link>
                <AuthStatus />
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="rounded-full border-[#1d2951] text-[#1d2951] hover:border-[#35b9da] hover:text-[#35b9da]"
                  asChild
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button
                  className="rounded-full bg-[#1d2951] hover:bg-[#2c3d7a] text-white"
                  asChild
                >
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-[#35b9da] text-[#35b9da] hover:border-[#1d2951] hover:text-[#1d2951]"
                  asChild
                >
                  <Link href="/partner">For Partners</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              href="/rooms/hanoi"
              className="block text-[#1d2951] hover:text-[#35b9da] font-medium"
            >
              Rooms
            </Link>
            <Link
              href="/packages"
              className="block text-[#1d2951] hover:text-[#35b9da] font-medium"
            >
              Packages
            </Link>
            <Link
              href="/ecosystem"
              className="block text-[#1d2951] hover:text-[#35b9da] font-medium"
            >
              Ecosystem
            </Link>

            {isLoggedIn ? (
              <Link
                href="/profile"
                className="block text-[#1d2951] hover:text-[#35b9da] font-medium"
              >
                Profile
              </Link>
            ) : (
              <div className="flex flex-col space-y-2 pt-4">
                <Button
                  variant="outline"
                  className="rounded-full border-[#1d2951] text-[#1d2951] hover:border-[#35b9da] hover:text-[#35b9da]"
                  asChild
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button
                  className="rounded-full bg-[#1d2951] hover:bg-[#2c3d7a] text-white"
                  asChild
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
