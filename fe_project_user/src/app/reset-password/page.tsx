"use client";
import "@/i18n";
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import api from '@/utils/axiosConfig'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Eye, EyeOff, Check, X } from "lucide-react"

interface PasswordRequirement {
  id: string;
  text: string;
  validator: (password: string) => boolean;
}

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  // Password requirements
  const passwordRequirements: PasswordRequirement[] = [
    {
      id: "length",
      text: "At least 8 characters long",
      validator: (password) => password.length >= 8
    },
    {
      id: "uppercase",
      text: "Contains uppercase letter",
      validator: (password) => /[A-Z]/.test(password)
    },
    {
      id: "lowercase",
      text: "Contains lowercase letter",
      validator: (password) => /[a-z]/.test(password)
    },
    {
      id: "number",
      text: "Contains number",
      validator: (password) => /\d/.test(password)
    },
    {
      id: "special",
      text: "Contains special character",
      validator: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  ]

  // Check if passwords match
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== ""
  
  // Check if all requirements are met
  const allRequirementsMet = passwordRequirements.every(req => req.validator(newPassword))
  
  // Check if form is valid
  const isFormValid = newPassword !== "" && confirmPassword !== "" && passwordsMatch && allRequirementsMet

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing token.")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return
    
    setError(null)
    setLoading(true)

    try {
      const res = await api.post('/api/auth/reset-password', {
        token,
        newPassword,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      setSuccess(true)
      setTimeout(() => router.push("/login"), 3000)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md rounded-2xl border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Reset Password
          </CardTitle>
        </CardHeader>
        
        <CardContent className="px-8 pb-6">
          {error && (
            <Alert variant="destructive" className="mb-6 rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="mb-6 rounded-xl border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Password reset successfully! Redirecting to login page...
              </AlertDescription>
            </Alert>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="rounded-xl h-11 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`rounded-xl h-11 pr-10 ${
                      confirmPassword !== "" && !passwordsMatch 
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                        : confirmPassword !== "" && passwordsMatch 
                        ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                        : ""
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPassword !== "" && !passwordsMatch && (
                  <p className="text-sm text-red-600 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    Passwords do not match
                  </p>
                )}
                {confirmPassword !== "" && passwordsMatch && (
                  <p className="text-sm text-green-600 flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    Passwords match
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Password Requirements
                </Label>
                <div className="space-y-2">
                  {passwordRequirements.map((requirement) => {
                    const isValid = requirement.validator(newPassword)
                    return (
                      <div
                        key={requirement.id}
                        className={`flex items-center text-sm ${
                          newPassword === "" ? "text-gray-400" : isValid ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {newPassword === "" ? (
                          <div className="w-4 h-4 mr-2 rounded-full border-2 border-gray-300" />
                        ) : isValid ? (
                          <Check className="w-4 h-4 mr-2" />
                        ) : (
                          <X className="w-4 h-4 mr-2" />
                        )}
                        {requirement.text}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Resetting...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="text-center">
          <p className="text-sm text-gray-600">
            Make sure your new password is strong and secure.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
