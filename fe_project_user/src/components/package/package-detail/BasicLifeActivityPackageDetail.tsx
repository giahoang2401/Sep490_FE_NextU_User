import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, UserCheck } from "lucide-react";
import api from "@/utils/axiosConfig";
import { useRouter } from "next/navigation";
import { isLogged } from "@/utils/auth";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/components/auth-context";

export default function BasicLifeActivityPackageDetail({ id, router }: { id: string, router: any }) {
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

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

  const checkProfileComplete = async () => {
    try {
      const res = await api.get("/api/user/profiles/profileme");
      const data = res.data || res;
      // Kiểm tra các trường bắt buộc
      if (!data.fullName || !data.phone || !data.dob || !data.gender || !data.address) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleBuyNow = async () => {
    if (!pkg) return;
    setIsPaying(true);
    setMessage(null);
    if (!isLoggedIn) {
      setShowAuthModal(true);
      setIsPaying(false);
      return;
    }
    // Kiểm tra hoàn thiện hồ sơ
    const isProfileComplete = await checkProfileComplete();
    if (!isProfileComplete) {
      setShowProfileModal(true);
      setIsPaying(false);
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
        window.location.href = "/profile";
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Yêu cầu mua gói thất bại. Vui lòng thử lại.";
      setMessage(errorMsg);
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
      {showAuthModal && (
        <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
          <DialogContent className="max-w-sm p-8 text-center flex flex-col items-center">
            <AlertCircle className="text-blue-500 mb-3" size={48} />
            <DialogTitle className="text-2xl font-bold mb-2">Bạn cần đăng nhập</DialogTitle>
            <DialogDescription className="mb-4 text-base text-slate-600">Vui lòng đăng nhập để sử dụng chức năng này và tiếp tục quá trình mua gói.</DialogDescription>
            <Button className="mt-2 w-full py-3 text-base font-semibold rounded-full bg-blue-600 hover:bg-blue-700 transition" onClick={() => { setShowAuthModal(false); router.push("/login"); }}>Đăng nhập</Button>
          </DialogContent>
        </Dialog>
      )}
      {showProfileModal && (
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent className="max-w-sm p-8 text-center flex flex-col items-center">
            <UserCheck className="text-green-500 mb-3" size={48} />
            <DialogTitle className="text-2xl font-bold mb-2">Hoàn thiện hồ sơ</DialogTitle>
            <DialogDescription className="mb-4 text-base text-slate-600">Bạn cần hoàn thiện hồ sơ cá nhân (họ tên, số điện thoại, ngày sinh, giới tính, địa chỉ) để tiếp tục mua gói.</DialogDescription>
            <Button className="mt-2 w-full py-3 text-base font-semibold rounded-full bg-green-600 hover:bg-green-700 transition" onClick={() => { setShowProfileModal(false); router.push("/account/about-me"); }}>Hoàn thiện hồ sơ</Button>
          </DialogContent>
        </Dialog>
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