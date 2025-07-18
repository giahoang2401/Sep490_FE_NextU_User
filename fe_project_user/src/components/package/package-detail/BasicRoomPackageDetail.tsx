import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Bed, Bath, Users, Wifi, CheckCircle, Calendar, Clock, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePickerModal } from "@/components/date-picker-modal";
// import { DurationModal } from "@/components/duration-modal";
import api from "@/utils/axiosConfig";
import { useRouter } from "next/navigation";
import { isLogged } from "@/utils/auth";
// Thêm import cho date
import { format } from 'date-fns';

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
  // Đồng bộ availabilityDates (dạng yyyy-MM-dd) cho check availability API
  const [availabilityDates, setAvailabilityDates] = useState<{ from: string; to: string }>({ from: '', to: '' });
  // Xác định bên nào đang mở modal (left/right)
  const [datePickerSource, setDatePickerSource] = useState<'left' | 'right' | null>(null);
  const [duration, setDuration] = useState<any>(null); // duration object
  const [activeTab, setActiveTab] = useState<string>("details");
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [roomAvailability, setRoomAvailability] = useState<any>({}); // { [roomId]: { viewedBookingStatus, from, to } }

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
        // Lấy accommodationId từ pkgData.acomodations[0].accomodationId (đúng key)
        let accommodationId = undefined;
        if (pkgData.acomodations && pkgData.acomodations.length > 0) {
          accommodationId = pkgData.acomodations[0].accomodationId;
        }
        let roomsData = [];
        if (accommodationId) {
          console.log('[DEBUG] Call API get rooms with accommodationId:', accommodationId);
          const roomsRes = await api.get(`/api/membership/RoomInstances/by-option/${accommodationId}`);
          roomsData = roomsRes.data || roomsRes;
        } else {
          console.log('[DEBUG] accommodationId not found, skip fetch rooms');
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
      const errorMsg = err?.response?.data?.message || "Payment request failed. Please try again.";
      if (errorMsg.toLowerCase().includes("profile") || errorMsg.toLowerCase().includes("account") || errorMsg.toLowerCase().includes("cập nhật thông tin") || errorMsg.toLowerCase().includes("update your information")) {
        setMessage("Vui lòng cập nhật thông tin tài khoản để tiếp tục.");
        setTimeout(() => {
          router.push("/account");
        }, 1800);
        return;
      }
      setMessage(errorMsg);
      // alert(err?.response?.data?.message || "Payment request failed. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  // Hàm check trạng thái tất cả phòng
  const checkAllRoomsAvailability = async (from?: string, to?: string) => {
    console.log('[DEBUG] checkAllRoomsAvailability called', { from, to, roomsCount: rooms.length });
    if (!rooms || rooms.length === 0) return;
    
    console.log('Calling checkAllRoomsAvailability with:', { from, to, roomsCount: rooms.length });
    
    const results: any = {};
    await Promise.all(
      rooms.map(async (room: any) => {
        try {
          const params: any = {};
          if (from) params.from = from;
          if (to) params.to = to;
          
          console.log(`Checking room ${room.id} with params:`, params);
          
          const res = await api.get(`/api/membership/Bookings/room/${room.id}`, { params });
          if (Array.isArray(res.data) && res.data.length > 0) {
            results[room.id] = {
              viewedBookingStatus: res.data[0].viewedBookingStatus,
              from: from || '',
              to: to || '',
              startDate: from ? res.data[0].startDate : null,
              endDate: from ? res.data[0].endDate : null,
            };
          } else {
            results[room.id] = { viewedBookingStatus: 'unknown', from: from || '', to: to || '', startDate: null, endDate: null };
          }
        } catch (error) {
          console.error(`Error checking room ${room.id}:`, error);
          results[room.id] = { viewedBookingStatus: 'unknown', from: from || '', to: to || '', startDate: null, endDate: null };
        }
      })
    );
    
    console.log('Availability results:', results);
    setRoomAvailability(results);
  };

  // Khi load trang hoặc có availabilityDates mới, check trạng thái tất cả phòng
  useEffect(() => {
    console.log('[DEBUG] useEffect triggered', { rooms, availabilityDates });
    if (rooms && rooms.length > 0) {
      checkAllRoomsAvailability(availabilityDates.from, availabilityDates.to);
    }
  }, [rooms, availabilityDates.from, availabilityDates.to]);

  // Khi chọn lịch, chỉ nhận moveIn, tự động tính moveOut dựa vào duration
  const handleDateRangeSelect = async (dates: { moveIn: Date | null; moveOut: Date | null }) => {
    let moveOut: Date | null = null;
    if (dates.moveIn && duration) {
      moveOut = new Date(dates.moveIn);
      if (duration.planDurationUnit === 'Month') {
        moveOut.setMonth(moveOut.getMonth() + Number(duration.planDurationValue));
      } else if (duration.planDurationUnit === 'Year') {
        moveOut.setFullYear(moveOut.getFullYear() + Number(duration.planDurationValue));
      }
    }
    setSelectedDates({ moveIn: dates.moveIn, moveOut });
    setAvailabilityDates({
      from: dates.moveIn ? dates.moveIn.toISOString().slice(0, 10) : '',
      to: moveOut ? moveOut.toISOString().slice(0, 10) : '',
    });
    setShowDatePicker(false);
    setDatePickerSource(null);
    // Save selected dates to localStorage
    if (dates.moveIn && moveOut) {
      localStorage.setItem('room_selectedDates', JSON.stringify({
        moveIn: dates.moveIn.toISOString(),
        moveOut: moveOut.toISOString()
      }));
      // Gọi API check availability với lịch mới, dùng await để đảm bảo tuần tự
      await checkAllRoomsAvailability(
        dates.moveIn.toISOString().slice(0, 10),
        moveOut.toISOString().slice(0, 10)
      );
    }
  };

  // On mount, restore selected dates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('room_selectedDates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const restoredDates = {
          moveIn: parsed.moveIn ? new Date(parsed.moveIn) : null,
          moveOut: parsed.moveOut ? new Date(parsed.moveOut) : null
        };
        setSelectedDates(restoredDates);
        setAvailabilityDates({
          from: restoredDates.moveIn ? restoredDates.moveIn.toISOString().slice(0, 10) : '',
          to: restoredDates.moveOut ? restoredDates.moveOut.toISOString().slice(0, 10) : '',
        });
      } catch {}
    }
  }, []);

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
      {message && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-blue-200 shadow-lg rounded-xl px-6 py-3 text-blue-800 font-semibold text-center animate-fade-in">
          {message}
        </div>
      )}
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

          {/* Tabs bar - move outside card, horizontal nav with underline on active/hover */}
          <div className="w-full border-b border-slate-200 mb-6">
            <nav className="flex flex-row gap-6 px-2 overflow-x-auto">
              {[{ key: "details", label: "Details" }, { key: "rooms", label: "Rooms" }, { key: "community", label: "Community" }, { key: "location", label: "Location" }, { key: "tour", label: "Tour" }, { key: "reviews", label: "Reviews" }, { key: "faq", label: "FAQ" }].map(tab => (
                <button
                  key={tab.key}
                  className={`relative py-3 px-1 text-base font-medium transition-colors duration-150 focus:outline-none
                    ${activeTab === tab.key ? 'text-slate-900 font-semibold' : 'text-slate-500'}
                    hover:text-slate-900`}
                  style={{ background: 'none', border: 'none' }}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                  <span className={`absolute left-0 right-0 -bottom-1 h-0.5 rounded bg-orange-500 transition-all duration-200 ${activeTab === tab.key ? 'opacity-100' : 'opacity-0'} pointer-events-none`}></span>
                </button>
              ))}
            </nav>
          </div>
          {/* Card: summary, description, amenities */}
          <div className="bg-white rounded-2xl shadow border border-slate-200 p-8 mb-10">
            {/* Summary row */}
            <div className="flex flex-col md:flex-row md:items-center md:gap-8 gap-4 mb-6">
              <div className="flex items-center gap-2 text-slate-700 text-base"><Bed className="h-5 w-5 mr-1" /> 4 bedrooms</div>
              <div className="flex items-center gap-2 text-slate-700 text-base"><Bath className="h-5 w-5 mr-1" /> 2 baths</div>
              <div className="flex items-center gap-2 text-slate-700 text-base"><Users className="h-5 w-5 mr-1" /> 7 residents</div>
              <div className="flex items-center gap-2 text-slate-700 text-base"><Calendar className="h-5 w-5 mr-1" /> 3 months min.</div>
            </div>
            <hr className="my-4" />
            {/* Description and amenities (reuse DetailsTab) */}
            {activeTab === "details" && <DetailsTab pkg={pkg} amenities={amenities} />}
            {activeTab === "community" && <CommunityTab />}
            {activeTab === "reviews" && <ReviewsTab />}
            {activeTab === "faq" && <FAQTab />}
          </div>

         
          {/* Danh sách phòng hiển thị dọc dưới Tabs */}
          {/* Room options section as a card/box */}
          <div className="max-w-7xl mx-auto mt-10">
            <div className="bg-white/90 rounded-2xl shadow border border-slate-200 p-6 mb-8">
              {/* Header row: title/desc left, button right */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Room options</h2>
                  <div className="text-slate-600">You'll be sharing this coliving with up to 6 other residents.</div>
                </div>
                <div className="mt-2 md:mt-0">
                  {(!selectedDates.moveIn || !selectedDates.moveOut) ? (
                    <Button
                      className="rounded-full px-8 py-3 text-base font-semibold bg-black text-white hover:bg-slate-800"
                      onClick={() => { setShowDatePicker(true); setDatePickerSource('left'); }}
                    >
                      Check availability
                    </Button>
                  ) : (
                    <button
                      type="button"
                      className="flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-3 text-base font-semibold text-slate-700 shadow-sm min-w-[280px]"
                      onClick={() => { setShowDatePicker(true); setDatePickerSource('left'); }}
                    >
                      {selectedDates.moveIn?.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })} -&gt; {selectedDates.moveOut?.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                    </button>
                  )}
                </div>
              </div>
              <hr className="my-4" />
              {/* Private rooms section as a card/box */}
              <div className="bg-slate-50 rounded-xl border border-slate-100 shadow-sm p-4">
                {/* <h3 className="text-xl font-semibold mb-4">Private rooms</h3> */}
                {/* Room list as a grid of cards */}
                <div className="grid grid-cols-1 gap-6">
                  {rooms.length === 0 && <div className="text-slate-500">Không có phòng nào khả dụng cho gói này.</div>}
                  {rooms.map((room: any, idx: number) => {
                    const isSelected = selectedRoom && selectedRoom.id === room.id;
                    const availability = roomAvailability[room.id] || {};
                    const status = availability.viewedBookingStatus || '';
                    const isAvailable = status === 'available';
                    const availableFrom = status.startsWith('available from') ? status : '';
                    return (
                      <Card key={room.id} className={`border rounded-2xl shadow bg-white/80 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                        <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center">
                          <div className="flex-1 w-full">
                            <div className="font-bold text-lg text-slate-800 mb-2">{room.roomName || room.roomTypeName}</div>
                            <div className="text-slate-600 mb-1">{room.descriptionDetails}</div>
                            <div className="text-slate-500 text-sm mb-1">Tầng: {room.floor} | Mã phòng: {room.roomCode}</div>
                            <div className="text-slate-500 text-sm mb-1">Loại: {room.roomTypeName}</div>
                          
                            {/* Trạng thái phòng */}
                            <div className="mt-2 text-sm">
                              {isAvailable && <span className="text-green-600 font-semibold">Available</span>}
                              {availableFrom && <span className="text-orange-600 font-semibold">{status}</span>}
                              {!isAvailable && !availableFrom && status && <span className="text-gray-500">{status}</span>}
                            </div>
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
                              disabled={!isAvailable}
                            >
                              {isSelected
                                ? (hoveredRoomId === room.id ? 'Bỏ chọn' : 'Đã chọn')
                                : isAvailable ? 'Chọn phòng này' : 'Không thể chọn'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div> {/* Close left column */}

        {/* Cột phải: Box booking */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 rounded-2xl border-0 shadow-lg">
            <CardContent className="p-6">
              {!selectedRoom ? (
                // UI khi chưa chọn phòng: hiển thị nút chọn lịch/check availability hoặc range ngày, và nút Select Room
                <div>
                  <div className="text-center mb-4">
                    <div className="text-lg font-bold mb-2">Add dates for prices</div>
                    <div className="bg-green-100 text-green-700 rounded-lg py-2 px-4 mb-4 font-semibold">Book now - Pay at the property</div>
                  </div>
                  <div className="flex flex-row gap-2 justify-center mb-4">
                    {(!selectedDates.moveIn || !selectedDates.moveOut)
                      ? (
                        <Button
                          className="px-6 py-2 rounded-md font-semibold text-base"
                          variant="secondary"
                          onClick={() => { setShowDatePicker(true); setDatePickerSource('right'); }}
                        >
                          Check availability
                        </Button>
                      )
                      : (
                        <button
                          type="button"
                          className="flex items-center gap-2 px-6 py-2 rounded-full border border-slate-300 bg-white shadow min-w-[280px]"
                          onClick={() => { setShowDatePicker(true); setDatePickerSource('right'); }}
                        >
                          <CalendarIcon className="h-5 w-5 text-blue-600" />
                          <span>{selectedDates.moveIn.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })} -&gt; {selectedDates.moveOut.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </button>
                      )
                    }
                    {/* Modal chọn ngày range cho box phải */}
                    <DatePickerModal
                      open={showDatePicker && datePickerSource === 'right'}
                      onOpenChange={open => { setShowDatePicker(open); if (!open) setDatePickerSource(null); }}
                      onDatesSelect={(dates) => {
                        console.log('[DEBUG] DatePickerModal onDatesSelect:', dates);
                        handleDateRangeSelect(dates);
                      }}
                    />
                  </div>
                  <Button className="w-full bg-black text-white font-bold py-3 text-lg rounded-full" disabled={!selectedDates.moveIn || !selectedDates.moveOut}>Select Room</Button>
                </div>
              ) : (
                // Đã chọn phòng và lịch, nút là Buy
                <>
                  <div className="text-center mb-6">
                    <div className="text-2xl font-bold text-slate-800 mb-1">{selectedRoom.roomName || selectedRoom.roomTypeName}</div>
                    <div className="text-slate-600 text-sm mb-2">{selectedRoom.descriptionDetails}</div>
                    <div className="text-3xl font-bold text-blue-700">₫{pkg.price?.toLocaleString()}</div>
                    <div className="text-slate-600">per month</div>
                  </div>
                  <div className="flex gap-2 mb-4 justify-center">
                    <button type="button" className={`flex items-center gap-2 px-6 py-2 rounded-full border border-slate-300 bg-white shadow min-w-[140px]`} disabled>
                      <CalendarIcon className="h-4 w-4 text-blue-600" />
                      {selectedDates.moveIn ? selectedDates.moveIn.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }) : 'Move in'}
                    </button>
                    <button type="button" className={`flex items-center gap-2 px-6 py-2 rounded-full border border-slate-300 bg-white shadow min-w-[140px]`} disabled>
                      <CalendarIcon className="h-4 w-4 text-slate-400" />
                      {selectedDates.moveOut ? selectedDates.moveOut.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) : 'Move out'}
                    </button>
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
                      {isPaying ? "Processing..." : "Buy"}
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
              handleDateRangeSelect(dates);
            }}
          />
        </div>
      </div> {/* Close grid */}
    </div>
  );
}