"use client"
import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info & Logo */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#28c4dd] via-[#5661b3] to-[#0c1f47] bg-clip-text text-transparent">
                Next Living
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-[#28c4dd] to-[#5661b3] mt-2"></div>
            </div>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Transforming co-living experiences through mindful community building, 
              wellness programs, and innovative spaces that nurture body, mind, and creativity.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-slate-400 hover:text-[#28c4dd] transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-[#28c4dd] transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-[#28c4dd] transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-[#28c4dd] transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/ecosystem" className="text-slate-300 hover:text-[#28c4dd] transition-colors">
                  Ecosystem
                </Link>
              </li>
              <li>
                <Link href="/packages" className="text-slate-300 hover:text-[#28c4dd] transition-colors">
                  Packages
                </Link>
              </li>
              <li>
                <Link href="/locations" className="text-slate-300 hover:text-[#28c4dd] transition-colors">
                  Locations
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-slate-300 hover:text-[#28c4dd] transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-300 hover:text-[#28c4dd] transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/ecosystem/Co-living" className="text-slate-300 hover:text-[#28c4dd] transition-colors">
                  Co-living Spaces
                </Link>
              </li>
              <li>
                <Link href="/ecosystem/events" className="text-slate-300 hover:text-[#28c4dd] transition-colors">
                  Community Events
                </Link>
              </li>
              <li>
                <Link href="/ecosystem/wellness" className="text-slate-300 hover:text-[#28c4dd] transition-colors">
                  Wellness Programs
                </Link>
              </li>
              <li>
                <Link href="/ecosystem/workshops" className="text-slate-300 hover:text-[#28c4dd] transition-colors">
                  Creative Workshops
                </Link>
              </li>
              <li>
                <Link href="/ecosystem/mentorship" className="text-slate-300 hover:text-[#28c4dd] transition-colors">
                  Mentorship
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-[#28c4dd] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-300 text-sm">
                    123 Community Street<br />
                    District 1, Ho Chi Minh City<br />
                    Vietnam
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-[#28c4dd] flex-shrink-0" />
                <span className="text-slate-300 text-sm">+84 28 1234 5678</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-[#28c4dd] flex-shrink-0" />
                <span className="text-slate-300 text-sm">hello@nextliving.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-slate-400 text-sm">
              © 2024 Next Living. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-slate-400 hover:text-[#28c4dd] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-[#28c4dd] transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-slate-400 hover:text-[#28c4dd] transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
