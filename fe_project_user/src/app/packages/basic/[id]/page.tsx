"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/axiosConfig";
import BasicRoomPackageDetail from "@/components/package/package-detail/BasicRoomPackageDetail";
import BasicLifeActivityPackageDetail from "@/components/package/package-detail/BasicLifeActivityPackageDetail";

export default function BasicPackageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [pkg, setPkg] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  // Booking states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [selectedDates, setSelectedDates] = useState<{ moveIn: Date | null; moveOut: Date | null }>({ moveIn: null, moveOut: null });
  const [duration, setDuration] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("details");
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);

  // Lưu selectedRoom vào localStorage để giữ khi reload
  useEffect(() => {
    if (selectedRoom) {
      localStorage.setItem(`selectedRoom_${id}`, JSON.stringify(selectedRoom));
    } else {
      localStorage.removeItem(`selectedRoom_${id}`);
    }
  }, [selectedRoom, id]);

  // Khi load trang, lấy lại phòng đã chọn nếu có
  useEffect(() => {
    const saved = localStorage.getItem(`selectedRoom_${id}`);
    if (saved) {
      try {
        const room = JSON.parse(saved);
        setSelectedRoom(room);
      } catch {}
    }
  }, [id]);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg">Đang tải dữ liệu...</div>;
  if (!pkg) return <div className="min-h-screen flex items-center justify-center text-lg text-red-500">Không tìm thấy gói basic này.</div>;

  // Phân biệt loại booking room dựa vào serviceType từ NextUService
  // serviceType = 0: Booking (Accommodation, Workspace) -> BasicRoomPackageDetail
  // serviceType = 1: Non-booking (Lifestyle Services, Workplace Activities) -> BasicLifeActivityPackageDetail
  if (pkg.serviceType === 0) {
    return (
      <BasicRoomPackageDetail id={id} router={router} />
    );
  }
  if (pkg.serviceType === 1) {
    return (
      <BasicLifeActivityPackageDetail id={id} router={router} />
    );
  }

  // TODO: Render loại service ở đây sau này
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg text-yellow-500 mb-4">Chưa hỗ trợ loại basic service.</div>
        <div className="text-sm text-gray-600">
          <div>ServiceType: {pkg.serviceType} ({typeof pkg.serviceType})</div>
          <div>NextUServiceName: {pkg.nextUServiceName}</div>
          <div>Package ID: {id}</div>
        </div>
      </div>
    </div>
  );
}   