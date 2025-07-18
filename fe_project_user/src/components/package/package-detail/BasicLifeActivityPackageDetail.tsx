import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import api from "@/utils/axiosConfig";
import { useRouter } from "next/navigation";
import { isLogged } from "@/utils/auth";

export default function BasicLifeActivityPackageDetail({ id, router }: { id: string, router: any }) {
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const pkgRes = await api.get(`/api/membership/BasicPlans/${id}`);
        const pkgData = pkgRes.data || pkgRes;
        setPkg(pkgData);
      } catch (err) {
        setPkg(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  const handleBuyNow = async () => {
    if (!pkg) return;
    setIsPaying(true);
    setMessage(null);
    if (!isLogged()) {
      setMessage("Vui lòng đăng nhập để tiếp tục.");
      setIsPaying(false);
      setTimeout(() => {
        router.push("/login");
      }, 1800);
      return;
    }
    try {
      const res = await api.post("/api/user/memberships/requestMember", {
        packageId: pkg.id,
        packageType: "basic",
        selectedStartDate: new Date().toISOString(),
        requireBooking: false,
        messageToStaff: "",
        redirectUrl: window.location.origin + "/profile"
      });
      if (res.data && res.data.success && res.data.data && res.data.data.paymentUrl && res.data.data.paymentUrl.redirectUrl) {
        window.location.href = res.data.data.paymentUrl.redirectUrl;
      } else {
        // Nếu không có paymentUrl, chuyển về profile
        window.location.href = "/profile";
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Yêu cầu mua gói thất bại. Vui lòng thử lại.";
      if (errorMsg.toLowerCase().includes("profile") || errorMsg.toLowerCase().includes("account") || errorMsg.toLowerCase().includes("cập nhật thông tin") || errorMsg.toLowerCase().includes("update your information")) {
        setMessage("Vui lòng cập nhật thông tin tài khoản để tiếp tục.");
        setTimeout(() => {
          router.push("/account");
        }, 1800);
        return;
      }
      setMessage(errorMsg);
      // alert(err?.response?.data?.message || "Yêu cầu mua gói thất bại. Vui lòng thử lại.");
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg">Đang tải dữ liệu...</div>;
  if (!pkg) return <div className="min-h-screen flex items-center justify-center text-lg text-red-500">Không tìm thấy gói này.</div>;

  // Demo entitlements nếu backend chưa có
  const entitlements = pkg.entitlements || [];
  const planDurations = pkg.planDurations || [];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#e8f9fc] via-[#f0fbfd] to-[#cce9fa]">
      {message && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-blue-200 shadow-lg rounded-xl px-6 py-3 text-blue-800 font-semibold text-center animate-fade-in">
          {message}
        </div>
      )}
      <div className="max-w-3xl mx-auto">
        <button
          className="mb-6 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold shadow hover:bg-slate-100 transition"
          onClick={() => router.push('/packages')}
        >
          ← Back to Packages
        </button>
        <Card className="rounded-2xl shadow border border-slate-200 p-8">
          <CardContent>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{pkg.name}</h1>
            <div className="text-slate-600 mb-4">{pkg.description}</div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Entitlements</h3>
              {entitlements.length === 0 && <div className="text-slate-500">No entitlements.</div>}
              <ul className="space-y-2">
                {entitlements.map((item: any, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-slate-600">{item.nextUserName || item.entitlementName}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Plan Durations</h3>
              {planDurations.length === 0 && <div className="text-slate-500">No durations.</div>}
              <ul className="space-y-2">
                {planDurations.map((d: any, idx: number) => (
                  <li key={idx} className="text-slate-600">
                    {d.planDurationDescription} (Discount: {d.discountRate}%)
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-xl font-bold text-blue-700 mb-2">₫{pkg.price?.toLocaleString()}</div>
              <Button className="rounded-full px-8 py-3 text-base font-semibold bg-black text-white hover:bg-slate-800 disabled:opacity-60" onClick={handleBuyNow} disabled={isPaying}>
                {isPaying ? "Đang xử lý..." : "Đăng ký/Mua ngay"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 