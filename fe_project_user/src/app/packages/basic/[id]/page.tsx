"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/axiosConfig";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Bed, Bath, Users, Wifi, CheckCircle, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePickerModal } from "@/components/date-picker-modal";
import { DurationModal } from "@/components/duration-modal";

// Component cho từng tab
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
        const [pkgRes, roomsRes] = await Promise.all([
          api.get(`/api/membership/BasicPlans/${id}`),
          api.get(`/api/membership/RoomInstances/by-basicPlan/${id}`),
        ]);
        setPkg(pkgRes.data || pkgRes);
        setRooms(roomsRes.data || roomsRes);
      } catch (err) {
        setPkg(null);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

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
              {rooms.map((room, idx) => {
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
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full rounded-full justify-start"
                      onClick={() => setShowDatePicker(true)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {selectedDates.moveIn && selectedDates.moveOut
                        ? `${selectedDates.moveIn.toLocaleDateString()} - ${selectedDates.moveOut.toLocaleDateString()}`
                        : "Select dates"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-full justify-start"
                      onClick={() => setShowDurationPicker(true)}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {duration || "Duration"}
                    </Button>
                    <Button
                      className="w-full rounded-full bg-slate-800 hover:bg-slate-700"
                      // TODO: Thêm logic booking thực tế ở đây
                      onClick={() => alert('Đặt phòng thành công!')}
                    >
                      Đặt phòng
                    </Button>
                  </div>
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
                      <span>Monthly rent</span>
                      <span>₫{pkg.price?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
                      <span>Service fee</span>
                      <span>₫500,000</span>
                    </div>
                    <div className="flex justify-between items-center font-semibold text-slate-800 pt-2 border-t border-slate-200">
                      <span>Total</span>
                      <span>₫{(pkg.price + 500000).toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          {/* Modals */}
          <DatePickerModal open={showDatePicker} onOpenChange={setShowDatePicker} onDatesSelect={setSelectedDates} />
          <DurationModal open={showDurationPicker} onOpenChange={setShowDurationPicker} onDurationSelect={setDuration} />
        </div>
      </div>
    </div>
  );
}   