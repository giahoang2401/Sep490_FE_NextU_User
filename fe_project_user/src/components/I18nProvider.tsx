"use client";
import { useEffect, useState } from "react";
import i18n from "@/i18n";

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Lấy ngôn ngữ từ localStorage (nếu có)
    const lng = localStorage.getItem("i18nextLng") || "en";
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng).then(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  // Chỉ render UI khi đã đồng bộ ngôn ngữ
  if (!ready) return null;
  return <>{children}</>;
}