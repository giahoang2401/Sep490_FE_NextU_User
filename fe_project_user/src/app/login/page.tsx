"use client";
import "@/i18n";
import type React from "react";
import { useState } from "react";
import api from '@/utils/axiosConfig';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { saveAccessToken } from "@/utils/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth(); // lấy hàm login từ context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
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

      const data = response.data;

      if (!data || !data.access_token) {
        setError("Login failed: No access_token returned from server.");
        setIsLoading(false);
        return;
      }
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("nextU_user", JSON.stringify({
        name: data.full_name || "User",
        email: data.email,
        role: data.role,
        user_id: data.user_id,
        location_id: data.location_id,
      }));

      login({
        name: data.full_name || "User",
        email: data.email,
        accessToken: data.access_token,
      });

      router.push("/");
    } catch (err: any) {
      const errorData = err.response?.data;
      const msg = errorData?.error_description || errorData?.error || errorData?.message || err?.message || "Login failed.";
      setError(msg);
      console.error("Login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Giả lập gọi Google API – đoạn này cần thay bằng dữ liệu thật khi tích hợp Google OAuth
      const googleUser = {
        email: "user@example.com",
        fullName: "Google User",
        providerId: "google-oauth-id-123456",
      };

      const res = await api.post(
        '/auth/google-login',
        googleUser,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      const data = res.data;
      if (!data.accessToken) {
        throw new Error("No access token received from server.");
      }

      const user = {
        name: data.fullName || "User",
        email: data.email,
        accessToken: data.accessToken,
      };

      login(user);
      localStorage.setItem("access_token", data.accessToken);
      router.push("/");
    } catch (err: any) {
      console.error("Google login failed:", err);
      setError(
        err.response?.data?.message || err.message || "Google login failed."
      );
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl"
                required
              />
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
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl"
                required
              />
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
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">
                Or continue with
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Google"
              )}
            </Button>
            <Button variant="outline" className="rounded-xl">
              Facebook
            </Button>
          </div>
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
