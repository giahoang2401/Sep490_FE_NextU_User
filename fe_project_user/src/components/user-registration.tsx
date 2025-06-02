"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, CheckCircle, User, Package, CreditCard } from "lucide-react"

const locations = [
  { value: "hanoi", label: "Hanoi" },
  { value: "ho-chi-minh-city", label: "Ho Chi Minh City" },
  { value: "da-nang", label: "Da Nang" },
  { value: "hai-phong", label: "Hai Phong" },
  { value: "can-tho", label: "Can Tho" },
  { value: "nha-trang", label: "Nha Trang" },
]

const packages = {
  hanoi: [
    { id: "hanoi-explore", name: "Cùng khám phá", price: 12500000 },
    { id: "hanoi-mindful", name: "Cùng tỉnh thức", price: 18800000 },
    { id: "hanoi-create", name: "Cùng kiến tạo", price: 25200000 },
  ],
  "ho-chi-minh-city": [
    { id: "hcm-explore", name: "Cùng khám phá", price: 14000000 },
    { id: "hcm-mindful", name: "Cùng tỉnh thức", price: 20500000 },
    { id: "hcm-create", name: "Cùng kiến tạo", price: 27000000 },
  ],
}

export function UserRegistration() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // User Information
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    occupation: "",

    // Package Information
    location: "",
    packageId: "",
    duration: "",
    moveInDate: "",

    // Payment Information
    paymentMethod: "",
    paymentStatus: "confirmed",
    transactionId: "",

    // Notes
    staffNotes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const selectedPackage =
    formData.location && formData.packageId
      ? packages[formData.location as keyof typeof packages]?.find((pkg) => pkg.id === formData.packageId)
      : null

  const calculateTotal = () => {
    if (!selectedPackage || !formData.duration) return 0
    return selectedPackage.price * Number.parseInt(formData.duration)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Create registration record
    const registration = {
      id: Date.now().toString(),
      ...formData,
      packageName: selectedPackage?.name,
      totalPrice: calculateTotal(),
      status: "confirmed",
      registrationDate: new Date().toISOString(),
      registeredBy: "staff_onboarding",
    }

    // Save to localStorage (in real app, this would be an API call)
    const existingRegistrations = JSON.parse(localStorage.getItem("staffRegistrations") || "[]")
    existingRegistrations.push(registration)
    localStorage.setItem("staffRegistrations", JSON.stringify(existingRegistrations))

    setSuccess(true)
    setIsSubmitting(false)
  }

  if (success) {
    return (
      <Card className="rounded-2xl border-0 shadow-lg max-w-2xl mx-auto">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Registration Successful!</h2>
          <p className="text-slate-600 mb-6">User has been successfully registered and their package is now active.</p>
          <Button
            className="rounded-full bg-slate-800 hover:bg-slate-700"
            onClick={() => {
              setSuccess(false)
              setStep(1)
              setFormData({
                fullName: "",
                email: "",
                phone: "",
                dateOfBirth: "",
                occupation: "",
                location: "",
                packageId: "",
                duration: "",
                moveInDate: "",
                paymentMethod: "",
                paymentStatus: "confirmed",
                transactionId: "",
                staffNotes: "",
              })
            }}
          >
            Register Another User
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="rounded-2xl border-0 shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Manual User Registration
          </CardTitle>
          <p className="text-slate-600">Register a user directly and assign them a package</p>
        </CardHeader>
      </Card>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= stepNumber ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                {stepNumber === 1 && <User className="h-5 w-5" />}
                {stepNumber === 2 && <Package className="h-5 w-5" />}
                {stepNumber === 3 && <CreditCard className="h-5 w-5" />}
              </div>
              {stepNumber < 3 && (
                <div className={`w-16 h-1 mx-2 ${step > stepNumber ? "bg-blue-500" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          {/* Step 1: User Information */}
          {step === 1 && (
            <Card className="rounded-2xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle>User Information</CardTitle>
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
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="rounded-xl"
                      placeholder="user@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="rounded-xl"
                      placeholder="+84 xxx xxx xxx"
                      required
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

                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange("occupation", e.target.value)}
                    className="rounded-xl"
                    placeholder="Job title"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!formData.fullName || !formData.email || !formData.phone}
                    className="rounded-full bg-slate-800 hover:bg-slate-700"
                  >
                    Next: Package Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Package Selection */}
          {step === 2 && (
            <Card className="rounded-2xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Package Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.value} value={location.value}>
                            {location.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration *</Label>
                    <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
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

                {formData.location && packages[formData.location as keyof typeof packages] && (
                  <div>
                    <Label>Package Type *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      {packages[formData.location as keyof typeof packages].map((pkg) => (
                        <Card
                          key={pkg.id}
                          className={`cursor-pointer transition-all duration-200 ${
                            formData.packageId === pkg.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
                          }`}
                          onClick={() => handleInputChange("packageId", pkg.id)}
                        >
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-slate-800 mb-2">{pkg.name}</h4>
                            <p className="text-lg font-bold text-slate-800">₫{pkg.price.toLocaleString()}/month</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="moveInDate">Move-in Date *</Label>
                  <Input
                    id="moveInDate"
                    type="date"
                    value={formData.moveInDate}
                    onChange={(e) => handleInputChange("moveInDate", e.target.value)}
                    className="rounded-xl"
                    required
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="rounded-full">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!formData.location || !formData.packageId || !formData.duration || !formData.moveInDate}
                    className="rounded-full bg-slate-800 hover:bg-slate-700"
                  >
                    Next: Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Payment Information */}
          {step === 3 && (
            <Card className="rounded-2xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) => handleInputChange("paymentMethod", value)}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="qr_code">QR Code</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="transactionId">Transaction ID</Label>
                    <Input
                      id="transactionId"
                      value={formData.transactionId}
                      onChange={(e) => handleInputChange("transactionId", e.target.value)}
                      className="rounded-xl"
                      placeholder="TXN123456789"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="staffNotes">Staff Notes</Label>
                  <Textarea
                    id="staffNotes"
                    value={formData.staffNotes}
                    onChange={(e) => handleInputChange("staffNotes", e.target.value)}
                    className="rounded-xl"
                    placeholder="Add any notes about this registration..."
                    rows={3}
                  />
                </div>

                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    This registration will be automatically approved and the user will have immediate access to their
                    package.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(2)} className="rounded-full">
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.paymentMethod || isSubmitting}
                    className="rounded-full bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? "Registering..." : "Complete Registration"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="rounded-2xl border-0 shadow-lg sticky top-24">
            <CardHeader>
              <CardTitle>Registration Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.fullName && (
                <div>
                  <Label className="text-sm text-slate-600">User</Label>
                  <p className="font-semibold">{formData.fullName}</p>
                  {formData.email && <p className="text-sm text-slate-500">{formData.email}</p>}
                </div>
              )}

              {formData.location && (
                <div>
                  <Label className="text-sm text-slate-600">Location</Label>
                  <p className="font-semibold capitalize">{formData.location.replace("-", " ")}</p>
                </div>
              )}

              {selectedPackage && (
                <div>
                  <Label className="text-sm text-slate-600">Package</Label>
                  <p className="font-semibold">{selectedPackage.name}</p>
                  <p className="text-sm text-slate-600">₫{selectedPackage.price.toLocaleString()}/month</p>
                </div>
              )}

              {formData.duration && (
                <div>
                  <Label className="text-sm text-slate-600">Duration</Label>
                  <p className="font-semibold">
                    {formData.duration} month{Number.parseInt(formData.duration) > 1 ? "s" : ""}
                  </p>
                </div>
              )}

              {formData.moveInDate && (
                <div>
                  <Label className="text-sm text-slate-600">Move-in Date</Label>
                  <p className="font-semibold">{new Date(formData.moveInDate).toLocaleDateString()}</p>
                </div>
              )}

              {selectedPackage && formData.duration && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total Amount</span>
                    <span className="text-green-600">₫{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              )}

              {step === 3 && formData.paymentMethod && (
                <div className="pt-4 border-t border-slate-200">
                  <Label className="text-sm text-slate-600">Payment Method</Label>
                  <p className="font-semibold capitalize">{formData.paymentMethod.replace("_", " ")}</p>
                  <Badge className="bg-green-500 text-white mt-2">Payment Confirmed</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
