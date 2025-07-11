"use client";
import { useEffect } from "react";
import i18n from "@/i18n";

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lng = localStorage.getItem("i18nextLng") || "en";
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng);
    }
  }, []);

  return <>{children}</>;
}