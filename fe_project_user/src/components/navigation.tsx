"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import { AuthStatus } from "@/components/auth-status";
import { useAuth } from "./auth-context";
import { Logo } from "@/components/ui/Logo";
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLocaleMenu, setShowLocaleMenu] = useState(false);
  const { isLoggedIn } = useAuth();
  // Removed useTranslations since we'll use simple text for now
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Remove current locale from pathname and add new one
    const pathnameWithoutLocale = pathname.replace(`/${locale}`, '');
    const newPath = `/${newLocale}${pathnameWithoutLocale}`;
    router.push(newPath);
    setShowLocaleMenu(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo branding: "Next" + "U" với 2 màu tách biệt */}
          <Logo />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href={`/${locale}/rooms/hanoi`}
              className="text-[#1d2951] hover:text-[#35b9da] transition-colors font-medium"
            >
              Rooms
            </Link>
            <Link
              href={`/${locale}/packages`}
              className="text-[#1d2951] hover:text-[#35b9da] transition-colors font-medium"
            >
              Packages
            </Link>
            <Link
              href={`/${locale}/ecosystem`}
              className="text-[#1d2951] hover:text-[#35b9da] transition-colors font-medium"
            >
              Ecosystem
            </Link>

            {/* Language Switcher */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLocaleMenu(!showLocaleMenu)}
                className="text-[#1d2951] hover:text-[#35b9da]"
              >
                <Globe className="h-4 w-4 mr-2" />
                {locale.toUpperCase()}
              </Button>
              
              {showLocaleMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[100px]">
                  <button
                    onClick={() => switchLocale('en')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      locale === 'en' ? 'bg-gray-50 font-medium' : ''
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => switchLocale('vi')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      locale === 'vi' ? 'bg-gray-50 font-medium' : ''
                    }`}
                  >
                    Tiếng Việt
                  </button>
                </div>
              )}
            </div>

            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link
                  href={`/${locale}/profile`}
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
                  <Link href={`/${locale}/login`}>
                    {locale === 'vi' ? 'Đăng nhập' : 'Sign In'}
                  </Link>
                </Button>
                <Button
                  className="rounded-full bg-[#1d2951] hover:bg-[#2c3d7a] text-white"
                  asChild
                >
                  <Link href={`/${locale}/register`}>
                    {locale === 'vi' ? 'Bắt đầu' : 'Get Started'}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-[#35b9da] text-[#35b9da] hover:border-[#1d2951] hover:text-[#1d2951]"
                  asChild
                >
                  <Link href={`/${locale}/partner`}>
                    {locale === 'vi' ? 'Cho đối tác' : 'For Partners'}
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Language Switcher */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLocaleMenu(!showLocaleMenu)}
                className="text-[#1d2951] hover:text-[#35b9da]"
              >
                <Globe className="h-4 w-4" />
              </Button>
              
              {showLocaleMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[100px]">
                  <button
                    onClick={() => switchLocale('en')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      locale === 'en' ? 'bg-gray-50 font-medium' : ''
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => switchLocale('vi')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      locale === 'vi' ? 'bg-gray-50 font-medium' : ''
                    }`}
                  >
                    Tiếng Việt
                  </button>
                </div>
              )}
            </div>

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
              href={`/${locale}/rooms/hanoi`}
              className="block text-[#1d2951] hover:text-[#35b9da] font-medium"
            >
              Rooms
            </Link>
            <Link
              href={`/${locale}/packages`}
              className="block text-[#1d2951] hover:text-[#35b9da] font-medium"
            >
              Packages
            </Link>
            <Link
              href={`/${locale}/ecosystem`}
              className="block text-[#1d2951] hover:text-[#35b9da] font-medium"
            >
              Ecosystem
            </Link>

            {isLoggedIn ? (
              <Link
                href={`/${locale}/profile`}
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
                  <Link href={`/${locale}/login`}>
                    {locale === 'vi' ? 'Đăng nhập' : 'Sign In'}
                  </Link>
                </Button>
                <Button
                  className="rounded-full bg-[#1d2951] hover:bg-[#2c3d7a] text-white"
                  asChild
                >
                  <Link href={`/${locale}/register`}>
                    {locale === 'vi' ? 'Bắt đầu' : 'Get Started'}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
