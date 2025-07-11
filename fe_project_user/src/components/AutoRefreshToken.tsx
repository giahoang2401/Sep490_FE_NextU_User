"use client";
import { useEffect } from "react";
import { refreshAccessToken } from "@/utils/refreshAccessToken";

export default function AutoRefreshToken() {
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && localStorage.getItem("refresh_token")) {
        refreshAccessToken();
      }
    }, 600_000); // 10 phút
    return () => clearInterval(interval);
  }, []);
  return null;
} 