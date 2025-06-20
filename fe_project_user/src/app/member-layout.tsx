"use client";
import { useAuth } from "@/components/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && isLoggedIn === false) {
      router.replace("/");
    }
  }, [isLoggedIn, isAuthLoading, router]);

  if (isAuthLoading) return null; // hoặc spinner

  return <>{children}</>;
} 