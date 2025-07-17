"use client";
import { useParams, useRouter } from "next/navigation";
import ComboPackageDetail from "@/components/package/package-detail/ComboPackageDetail";

export default function ComboPackageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  return <ComboPackageDetail id={id} router={router} />;
} 