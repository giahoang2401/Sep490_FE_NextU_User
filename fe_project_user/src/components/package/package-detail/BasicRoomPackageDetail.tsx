import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Bed, Bath, Users, Wifi, CheckCircle, Calendar, Clock, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePickerModal } from "@/components/date-picker-modal";
import { DurationModal } from "@/components/duration-modal";
import api from "@/utils/axiosConfig";
import { useRouter } from "next/navigation";

function DetailsTab({ pkg, amenities }: { pkg: any; amenities: string[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-3">Description</h3>
        <p className="text-slate-600 leading-relaxed">{pkg.description}</p>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Amenities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {amenities.map((amenity: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-slate-600">{amenity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommunityTab() {
  return <div className="text-slate-500 py-8">Community information and resident profiles...</div>;
}
function ReviewsTab() {
  return <div className="text-slate-500 py-8">Guest reviews and ratings...</div>;
}
function FAQTab() {
  return <div className="text-slate-500 py-8">Frequently asked questions...</div>;
}

export default function BasicRoomPackageDetail({ id, router }: { id: string, router: any }) {
  const [pkg, setPkg] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  // Booking states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDates, setSelectedDates] = useState<{ moveIn: Date | null; moveOut: Date | null }>({ moveIn: null, moveOut: null });
  const [duration, setDuration] = useState<any>(null); // duration object
  const [activeTab, setActiveTab] = useState<string>("details");
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

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
        // Fetch package info trước
        const pkgRes = await api.get(`/api/membership/BasicPlans/${id}`);
        const pkgData = pkgRes.data || pkgRes;
        setPkg(pkgData);
        // Lấy accomodationId từ pkg để fetch rooms
        let roomsData = [];
        if (pkgData && pkgData.accomodationId) {
          const roomsRes = await api.get(`/api/membership/RoomInstances/by-option/${pkgData.accomodationId}`);
          roomsData = roomsRes.data || roomsRes;
        }
        setRooms(roomsData);
        // Lấy duration mặc định từ gói
        if (pkgData && pkgData.planDurations && pkgData.planDurations.length > 0) {
          setDuration(pkgData.planDurations[0]);
        }
      } catch (err) {
        setPkg(null);
        setRooms([]);
        setDuration(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  // Khi chọn Move-in Date, tự động tính Move-out Date
  const handleMoveInDateChange = (date: Date | null) => {
    if (!duration || !date) {
      setSelectedDates({ moveIn: date, moveOut: null });
      return;
    }
    let moveOut = new Date(date);
    if (duration.planDurationUnit === 'Month') {
      moveOut.setMonth(moveOut.getMonth() + Number(duration.planDurationValue));
    } else if (duration.planDurationUnit === 'Year') {
      moveOut.setFullYear(moveOut.getFullYear() + Number(duration.planDurationValue));
    }
    setSelectedDates({ moveIn: date, moveOut });
  };

  // Handle payment
  const handlePayNow = async () => {
    if (!selectedRoom || !selectedDates.moveIn) {
      alert("Please select a room and move-in date before proceeding to payment.");
      return;
    }
    setIsPaying(true);
    try {
      const res = await api.post("/api/user/memberships/requestMember", {
        packageId: pkg.id,
        packageType: "basic",
        selectedStartDate: selectedDates.moveIn.toISOString(),
        requireBooking: true,
        roomInstanceId: selectedRoom.id,
        messageToStaff: "",
        redirectUrl: window.location.origin + "/profile" // fallback after payment
      });
      if (res.data && res.data.success && res.data.data && res.data.data.paymentUrl && res.data.data.paymentUrl.redirectUrl) {
        window.location.href = res.data.data.paymentUrl.redirectUrl;
      } else {
        alert("Payment request failed. Please try again later.");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Payment request failed. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg">Đang tải dữ liệu...</div>;
  if (!pkg) return <div className="min-h-screen flex items-center justify-center text-lg text-red-500">Không tìm thấy gói basic này.</div>;

  // Demo amenities nếu backend chưa có
  const amenities = pkg.amenities || [
    "High-speed WiFi",
    "Fully equipped kitchen",
    "Laundry facilities",
    "Gym access",
    "Rooftop terrace",
    "Co-working space",
    "24/7 security",
    "Cleaning service",
    "Air conditioning",
    "Parking available",
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#e8f9fc] via-[#f0fbfd] to-[#cce9fa]">
      <div className="max-w-7xl mx-auto">
        {/* Nút Back */}
        <button
          className="mb-6 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold shadow hover:bg-slate-100 transition"
          onClick={() => router.push('/packages')}
        >
          ← Back to Packages
        </button>
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái: Thông tin gói + danh sách phòng */}
        <div className="lg:col-span-2">
          {/* Header + Info giống trang room */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{pkg.name}</h1>
            <div className="flex items-center gap-4 text-slate-600">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4.8</span>
                <span>(24 reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{pkg.locationName || "City Center"}</span>
              </div>
            </div>
          </div>

          {/* Room Info (giả lập) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-2 text-slate-600">
              <Bed className="h-5 w-5" />
              <div>
                <div className="font-semibold">1</div>
                <div className="text-sm">Bedrooms</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Bath className="h-5 w-5" />
              <div>
                <div className="font-semibold">1</div>
                <div className="text-sm">Bathrooms</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="h-5 w-5" />
              <div>
                <div className="font-semibold">2</div>
                <div className="text-sm">Residents</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Wifi className="h-5 w-5" />
              <div>
                <div className="font-semibold">100 Mbps</div>
                <div className="text-sm">Internet</div>
              </div>
            </div>
          </div>

          {/* Tabs bar */}
          <div className="w-full">
            <div className="rounded-full bg-slate-100 mb-6 flex justify-between items-center overflow-x-auto" style={{minHeight: 56}}>
              {[
                { key: "details", label: "Details" },
                { key: "community", label: "Community" },
                { key: "reviews", label: "Reviews" },
                { key: "faq", label: "FAQ" },
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`flex-1 text-center px-0 py-2 font-semibold rounded-full transition-all duration-200 focus:outline-none ${activeTab === tab.key ? 'bg-white text-slate-800 shadow font-bold' : 'text-slate-600'}`}
                  style={{ minWidth: 0 }}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {/* Tab content */}
            <div>
              {activeTab === "details" && <DetailsTab pkg={pkg} amenities={amenities} />}
              {activeTab === "community" && <CommunityTab />}
              {activeTab === "reviews" && <ReviewsTab />}
              {activeTab === "faq" && <FAQTab />}
            </div>
          </div>

          {/* Danh sách phòng hiển thị dọc dưới Tabs */}
          <div className="mt-10">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Available Rooms</h3>
            <div className="flex flex-col gap-8">
              {rooms.length === 0 && <div className="text-slate-500">Không có phòng nào khả dụng cho gói này.</div>}
              {rooms.map((room: any, idx: number) => {
                const isSelected = selectedRoom && selectedRoom.id === room.id;
                return (
                  <Card key={room.id} className={`border rounded-2xl shadow bg-white/80 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center">
                      <div className="flex-1 w-full">
                        <div className="font-bold text-lg text-slate-800 mb-2">{room.roomName || room.roomTypeName}</div>
                        <div className="text-slate-600 mb-1">{room.descriptionDetails}</div>
                        <div className="text-slate-500 text-sm mb-1">Tầng: {room.floor} | Mã phòng: {room.roomCode}</div>
                        <div className="text-slate-500 text-sm mb-1">Loại: {room.roomTypeName}</div>
                        <div className="text-slate-500 text-sm mb-1">Trạng thái: {room.status}</div>
                      </div>
                      <div className="flex flex-col gap-2 items-center">
                        <div className="text-xl font-bold text-blue-700 mb-2">₫{pkg.price?.toLocaleString()}</div>
                        <Button
                          className="rounded-full px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold shadow hover:shadow-lg transition"
                          onClick={() => {
                            if (isSelected && hoveredRoomId === room.id) {
                              setSelectedRoom(null);
                            } else {
                              setSelectedRoom(room);
                            }
                          }}
                          variant={isSelected ? 'default' : 'outline'}
                          onMouseEnter={() => isSelected && setHoveredRoomId(room.id)}
                          onMouseLeave={() => isSelected && setHoveredRoomId(null)}
                        >
                          {isSelected
                            ? (hoveredRoomId === room.id ? 'Bỏ chọn' : 'Đã chọn')
                            : 'Chọn phòng này'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cột phải: Box booking */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 rounded-2xl border-0 shadow-lg">
            <CardContent className="p-6">
              {!selectedRoom ? (
                <div className="text-center text-slate-500 py-12">Vui lòng chọn phòng để đặt.</div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="text-2xl font-bold text-slate-800 mb-1">{selectedRoom.roomName || selectedRoom.roomTypeName}</div>
                    <div className="text-slate-600 text-sm mb-2">{selectedRoom.descriptionDetails}</div>
                    <div className="text-3xl font-bold text-blue-700">₫{pkg.price?.toLocaleString()}</div>
                    <div className="text-slate-600">per month</div>
                  </div>
                  {/* Chọn ngày kiểu coliving.com */}
                  <div className="flex gap-2 mb-4 justify-center">
                    {/* Move in */}
                    <div
                      className="flex items-center gap-2 px-4 py-2 border rounded-full bg-white shadow cursor-pointer min-w-[170px]"
                      onClick={() => setShowDatePicker(true)}
                    >
                      <CalendarIcon className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">
                        {selectedDates.moveIn
                          ? selectedDates.moveIn.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })
                          : "Move in"}
                      </span>
                    </div>
                    {/* Move out */}
                    <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-white shadow text-gray-500 min-w-[170px]">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="font-medium">
                        {selectedDates.moveOut
                          ? selectedDates.moveOut.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
                          : "Move out"}
                      </span>
                    </div>
                  </div>
                  {/* Duration readonly */}
                  <div className="w-full rounded-full justify-start px-4 py-2 border border-slate-200 bg-slate-50 text-slate-700 text-left mb-4">
                    Duration: {duration ? `${duration.planDurationValue} ${duration.planDurationUnit}${Number(duration.planDurationValue) > 1 ? 's' : ''}` : 'N/A'}
                  </div>
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
                      <span>Monthly rent</span>
                      <span>₫{pkg.price?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center font-semibold text-slate-800 pt-2 border-t border-slate-200">
                      <span>Total</span>
                      <span>₫{pkg.price?.toLocaleString()}</span>
                    </div>
                    <button
                      className="mt-6 w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={handlePayNow}
                      disabled={isPaying || !selectedRoom || !selectedDates.moveIn}
                    >
                      {isPaying ? "Processing..." : "Book & Pay now"}
                    </button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          {/* Modals */}
          <DatePickerModal
            open={showDatePicker}
            onOpenChange={setShowDatePicker}
            onDatesSelect={(dates: { moveIn: Date | null; moveOut: Date | null }) => {
              handleMoveInDateChange(dates.moveIn);
            }}
          />
        </div>
      </div>
    </div>
  );
} 