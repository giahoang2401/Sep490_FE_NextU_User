"use client";
import "@/i18n";
import type React from "react";
import { useState } from "react";
import api from '@/utils/axiosConfig';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { saveAccessToken } from "@/utils/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { login } = useAuth();

  // Email validation function
  const validateEmail = (email: string) => {
    if (!email) {
      return "Email is required";
    }
    if (!email.includes("@")) {
      return "Please enter a valid email address";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  // Password validation function
  const validatePassword = (password: string) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return null;
  };

  // Handle email change with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  // Handle password change with validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validate all fields before submit
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);

    setEmailError(emailValidationError);
    setPasswordError(passwordValidationError);

    if (emailValidationError || passwordValidationError) {
      setError("Please fix the errors above");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post(
        '/api/auth/connect/token',
        new URLSearchParams({
          grant_type: 'password',
          username: email,
          password: password,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      console.log("Full API Response:", response); // Debug log
      const data = response.data;
      console.log("API Response data:", data); // Debug log

      // Check for different possible token field names
      const accessToken = data.access_token || data.accessToken || data.token;
      const refreshToken = data.refresh_token || data.refreshToken;

      if (!data || !accessToken) {
        console.error("No access token found in response:", data); // Debug log
        setError("Login failed: No access token returned from server.");
        setIsLoading(false);
        return;
      }

      // Store tokens based on remember me preference
      if (rememberMe) {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        localStorage.setItem("nextU_user", JSON.stringify({
          name: data.full_name || data.name || "User",
          email: data.email || email,
          role: data.role || "user",
          user_id: data.user_id || data.id,
          location_id: data.location_id,
        }));
        console.log("Tokens saved to localStorage"); // Debug log
      } else {
        sessionStorage.setItem("access_token", accessToken);
        sessionStorage.setItem("refresh_token", refreshToken);
        sessionStorage.setItem("nextU_user", JSON.stringify({
          name: data.full_name || data.name || "User",
          email: data.email || email,
          role: data.role || "user",
          user_id: data.user_id || data.id,
          location_id: data.location_id,
        }));
        console.log("Tokens saved to sessionStorage"); // Debug log
      }

      // Also save to auth context
      login({
        name: data.full_name || data.name || "User",
        email: data.email || email,
        accessToken: accessToken,
      });

      // Always save access token to localStorage for immediate access
      localStorage.setItem("access_token", accessToken);
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }
      console.log("Access token saved to localStorage for immediate access"); // Debug log

      router.push("/");
    } catch (err: any) {
      console.error("Login failed - Full error:", err);
      console.log("Error type:", typeof err);
      console.log("Error keys:", Object.keys(err || {}));
      console.log("Error response:", err.response);
      console.log("Error data direct:", err.data);
      console.log("Error config:", err.config);
      console.log("Error status:", err.status);
      console.log("Error message:", err.message);
      
      // Thử nhiều cách để lấy error data
      let errorData = null;
      if (err.response && err.response.data) {
        errorData = err.response.data;
        console.log("Using err.response.data:", errorData);
      } else if (err.data) {
        errorData = err.data;
        console.log("Using err.data:", errorData);
      } else if (err.error || err.error_description) {
        // Error object chính nó chứa data
        errorData = err;
        console.log("Using err directly:", errorData);
      } else if (typeof err === 'string') {
        try {
          errorData = JSON.parse(err);
          console.log("Parsed string error:", errorData);
        } catch {
          console.log("Cannot parse error as JSON");
        }
      }
      
      console.log("Final errorData:", errorData);
      
      // Debug: Log từng trường để kiểm tra
      if (errorData) {
        console.log("error_description:", errorData.error_description);
        console.log("message:", errorData.message);
        console.log("error:", errorData.error);
      }
      
      // Ưu tiên hiển thị error_description từ API response
      let msg = "Login failed.";
      
      if (errorData && errorData.error_description) {
        msg = errorData.error_description;
        console.log("Using error_description:", msg);
      } else if (errorData && errorData.message) {
        msg = errorData.message;
        console.log("Using message:", msg);
      } else if (errorData && errorData.error) {
        msg = errorData.error;
        console.log("Using error:", msg);
      } else if (err?.message) {
        msg = err.message;
        console.log("Using err.message:", msg);
      }
      
      console.log("Final error message to display:", msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Card className="w-full max-w-md rounded-2xl border-0 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-800">
            Welcome Back
          </CardTitle>
          <CardDescription>
            Sign in to your Next Universe account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6 rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={handleEmailChange}
                className={`rounded-xl ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {emailError && (
                <p className="text-sm text-red-500 mt-1">{emailError}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  className={`rounded-xl pr-10 ${passwordError ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-red-500 mt-1">{passwordError}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full bg-slate-800 hover:bg-slate-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-800"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
