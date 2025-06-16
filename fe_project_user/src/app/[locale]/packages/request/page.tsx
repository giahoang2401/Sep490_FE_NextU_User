"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, User, Phone, FileText, CheckCircle, ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

const locations = [
  { value: "hanoi", label: "Hanoi", flag: "🇻🇳" },
  { value: "ho-chi-minh-city", label: "Ho Chi Minh City", flag: "🇻🇳" },
  { value: "da-nang", label: "Da Nang", flag: "🇻🇳" },
  { value: "hai-phong", label: "Hai Phong", flag: "🇻🇳" },
  { value: "can-tho", label: "Can Tho", flag: "🇻🇳" },
  { value: "nha-trang", label: "Nha Trang", flag: "🇻🇳" },
]

const packages = {
  hanoi: [
    {
      id: "hanoi-explore",
      name: "Cùng khám phá",
      price: 12500000,
      duration: "month",
      features: ["Community events", "Basic amenities", "Shared spaces", "Pool access"],
    },
    {
      id: "hanoi-mindful",
      name: "Cùng tỉnh thức",
      price: 18800000,
      duration: "month",
      features: ["Meditation sessions", "Wellness programs", "Personal coaching", "Co-working access"],
    },
    {
      id: "hanoi-create",
      name: "Cùng kiến tạo",
      price: 25200000,
      duration: "month",
      features: ["Art studio access", "Creative workshops", "Mentorship programs", "Full ecosystem access"],
    },
  ],
  "ho-chi-minh-city": [
    {
      id: "hcm-explore",
      name: "Cùng khám phá",
      price: 14000000,
      duration: "month",
      features: ["Community events", "Basic amenities", "Shared spaces", "Tech hub access"],
    },
    {
      id: "hcm-mindful",
      name: "Cùng tỉnh thức",
      price: 20500000,
      duration: "month",
      features: ["Startup events", "Networking", "Innovation lab", "Co-working access"],
    },
    {
      id: "hcm-create",
      name: "Cùng kiến tạo",
      price: 27000000,
      duration: "month",
      features: ["Digital studio", "Creative workshops", "Mentorship programs", "Full ecosystem access"],
    },
  ],
}

export default function PackageRequestPage() {
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedPackage, setSelectedPackage] = useState("")
  const [duration, setDuration] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    occupation: "",
    company: "",
    moveInDate: "",
    specialRequests: "",
    emergencyContact: "",
    emergencyPhone: "",
    agreeTerms: false,
    agreePrivacy: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const selectedPackageData =
    selectedLocation && selectedPackage
      ? packages[selectedLocation as keyof typeof packages]?.find((pkg) => pkg.id === selectedPackage)
      : null

  const calculateTotal = () => {
    if (!selectedPackageData || !duration) return 0
    const months = Number.parseInt(duration)
    return selectedPackageData.price * months
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate required fields
    const requiredFields = ["fullName", "email", "phone", "moveInDate"]
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData])

    if (missingFields.length > 0 || !selectedLocation || !selectedPackage || !duration) {
      alert("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    if (!formData.agreeTerms || !formData.agreePrivacy) {
      alert("Please agree to the terms and privacy policy")
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Save to localStorage (in real app, this would be an API call)
      const packageRequest = {
        id: Date.now().toString(),
        ...formData,
        location: selectedLocation,
        packageId: selectedPackage,
        packageName: selectedPackageData?.name,
        duration: Number.parseInt(duration),
        totalPrice: calculateTotal(),
        status: "pending",
        requestDate: new Date().toISOString(),
      }

      const existingRequests = JSON.parse(localStorage.getItem("packageRequests") || "[]")
      existingRequests.push(packageRequest)
      localStorage.setItem("packageRequests", JSON.stringify(existingRequests))

      setSuccess(true)
      setTimeout(() => {
        router.push("/profile")
      }, 2000)
    } catch (error) {
      alert("Failed to submit request. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Card className="w-full max-w-md rounded-2xl border-0 shadow-xl text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Request Submitted!</h2>
            <p className="text-slate-600 mb-6">
              Your package request has been submitted successfully. Our team will review it and contact you within 24
              hours.
            </p>
            <Button
              className="w-full rounded-full bg-slate-800 hover:bg-slate-700"
              onClick={() => router.push("/profile")}
            >
              View My Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Request Your Package</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Fill out the form below to request your preferred co-living package. Our team will review your application
            and get back to you soon.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Package Selection */}
              <Card className="rounded-2xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Package Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.value} value={location.value}>
                              {location.flag} {location.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration *</Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 month</SelectItem>
                          <SelectItem value="3">3 months</SelectItem>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedLocation && packages[selectedLocation as keyof typeof packages] && (
                    <div>
                      <Label>Package Type *</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        {packages[selectedLocation as keyof typeof packages].map((pkg) => (
                          <Card
                            key={pkg.id}
                            className={`cursor-pointer transition-all duration-200 ${
                              selectedPackage === pkg.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
                            }`}
                            onClick={() => setSelectedPackage(pkg.id)}
                          >
                            <CardContent className="p-4">
                              <h4 className="font-semibold text-slate-800 mb-2">{pkg.name}</h4>
                              <p className="text-lg font-bold text-slate-800 mb-2">
                                ₫{pkg.price.toLocaleString()}/{pkg.duration}
                              </p>
                              <ul className="text-xs text-slate-600 space-y-1">
                                {pkg.features.slice(0, 2).map((feature, idx) => (
                                  <li key={idx}>• {feature}</li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card className="rounded-2xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className="rounded-xl"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="rounded-xl"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="rounded-xl"
                        placeholder="+84 xxx xxx xxx"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        value={formData.occupation}
                        onChange={(e) => handleInputChange("occupation", e.target.value)}
                        className="rounded-xl"
                        placeholder="Your job title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        className="rounded-xl"
                        placeholder="Company name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="moveInDate">Preferred Move-in Date *</Label>
                    <Input
                      id="moveInDate"
                      type="date"
                      value={formData.moveInDate}
                      onChange={(e) => handleInputChange("moveInDate", e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="rounded-2xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContact">Contact Name</Label>
                      <Input
                        id="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                        className="rounded-xl"
                        placeholder="Emergency contact name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyPhone">Contact Phone</Label>
                      <Input
                        id="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                        className="rounded-xl"
                        placeholder="+84 xxx xxx xxx"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card className="rounded-2xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="specialRequests">Special Requests or Requirements</Label>
                    <Textarea
                      id="specialRequests"
                      value={formData.specialRequests}
                      onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                      className="rounded-xl mt-2"
                      placeholder="Any special requirements, dietary restrictions, accessibility needs, etc."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Terms and Conditions */}
              <Card className="rounded-2xl border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeTerms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) => handleInputChange("agreeTerms", checked as boolean)}
                      />
                      <Label htmlFor="agreeTerms" className="text-sm leading-relaxed">
                        I agree to the{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          Terms and Conditions
                        </a>{" "}
                        and understand that this is a request that requires approval from Next Universe staff.
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreePrivacy"
                        checked={formData.agreePrivacy}
                        onCheckedChange={(checked) => handleInputChange("agreePrivacy", checked as boolean)}
                      />
                      <Label htmlFor="agreePrivacy" className="text-sm leading-relaxed">
                        I agree to the{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </a>{" "}
                        and consent to the processing of my personal data.
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="rounded-2xl border-0 shadow-lg sticky top-24">
                <CardHeader>
                  <CardTitle>Request Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedLocation && (
                    <div>
                      <Label className="text-sm text-slate-600">Location</Label>
                      <p className="font-semibold">
                        {locations.find((l) => l.value === selectedLocation)?.flag}{" "}
                        {locations.find((l) => l.value === selectedLocation)?.label}
                      </p>
                    </div>
                  )}

                  {selectedPackageData && (
                    <div>
                      <Label className="text-sm text-slate-600">Package</Label>
                      <p className="font-semibold">{selectedPackageData.name}</p>
                      <p className="text-sm text-slate-600">₫{selectedPackageData.price.toLocaleString()}/month</p>
                    </div>
                  )}

                  {duration && (
                    <div>
                      <Label className="text-sm text-slate-600">Duration</Label>
                      <p className="font-semibold">
                        {duration} month{Number.parseInt(duration) > 1 ? "s" : ""}
                      </p>
                    </div>
                  )}

                  {selectedPackageData && duration && (
                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Subtotal</span>
                        <span>₫{(selectedPackageData.price * Number.parseInt(duration)).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center font-semibold text-lg">
                        <span>Total</span>
                        <span>₫{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-sm">
                      This is a request that requires manual approval from our staff. You will be notified within 24
                      hours.
                    </AlertDescription>
                  </Alert>

                  <Button
                    type="submit"
                    className="w-full rounded-full bg-slate-800 hover:bg-slate-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Request
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
