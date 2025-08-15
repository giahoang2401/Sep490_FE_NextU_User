import { useEffect, useState, useRef } from "react";
import api from "@/utils/axiosConfig";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePickerModal } from "@/components/date-picker-modal";
import { isLogged } from "@/utils/auth";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/components/auth-context";
import { AlertCircle, UserCheck, Star, MapPin, Bed, Bath, Users, Wifi, CheckCircle, Calendar, Clock, Calendar as CalendarIcon, Zap, Award } from "lucide-react";



export default function ComboPackageDetail({ id, router }: { id: string, router: any }) {
  const [combo, setCombo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [basicDetails, setBasicDetails] = useState<any[]>([]);
  const [basicRooms, setBasicRooms] = useState<{ [basicId: string]: any[] }>({});
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);
  // Thêm state cho message
  const [message, setMessage] = useState<string | null>(null);
  // State cho từng basic living
  const [selectedDates, setSelectedDates] = useState<{ [basicId: string]: { moveIn: Date | null; moveOut: Date | null } }>({});
  const [availabilityDates, setAvailabilityDates] = useState<{ [basicId: string]: { from: string; to: string } }>({});
  const [showDatePicker, setShowDatePicker] = useState<{ [basicId: string]: boolean }>({});
  const [datePickerSource, setDatePickerSource] = useState<{ [basicId: string]: 'left' | 'right' | null }>({});
  const [duration, setDuration] = useState<{ [basicId: string]: any }>({});
  const [roomAvailability, setRoomAvailability] = useState<{ [basicId: string]: { [roomId: string]: any } }>({});
  const { isLoggedIn } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("details");
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  
  // Refs for sections
  const detailsRef = useRef<HTMLDivElement>(null);
  const packagesRef = useRef<HTMLDivElement>(null);
  const roomsRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // Fetch combo, basics, rooms, durations
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const comboRes = await api.get(`/api/membership/ComboPlans/${id}`);
        const comboData = comboRes.data || comboRes;
        setCombo(comboData);
        // Fetch all basic package details
        let basics: any[] = [];
        if (comboData.basicPlanIds && comboData.basicPlanIds.length > 0) {
          basics = await Promise.all(
            comboData.basicPlanIds.map(async (bid: string) => {
              try {
                const res = await api.get(`/api/membership/BasicPlans/${bid}`);
                return res.data || res;
              } catch {
                return null;
              }
            })
          );
          setBasicDetails(basics.filter(Boolean));
        } else {
          setBasicDetails([]);
        }
        // Fetch rooms & durations for each accommodation basic
        const accommodationBasics = basics.filter(b => b && (b.basicPlanType === 'Accommodation' || b.basicPlanTypeCode === 'ACCOMMODATION') && Array.isArray(b.acomodations) && b.acomodations.length > 0);
        const roomsMap: { [basicId: string]: any[] } = {};
        const durationMap: { [basicId: string]: any } = {};
        await Promise.all(accommodationBasics.map(async (b: any) => {
          const acc = b.acomodations && b.acomodations[0];
          if (acc && acc.accomodationId) {
            try {
              const res = await api.get(`/api/membership/RoomInstances/by-option/${acc.accomodationId}`);
              const roomsData = res.data || [];
              
              // Fetch addOnFee for each room - room already has this info from the API
              const roomsWithAddOn = roomsData.map((room: any) => ({
                ...room,
                addOnFee: room.addOnFee || 0
              }));
              
              roomsMap[b.id] = roomsWithAddOn;
            } catch {
              roomsMap[b.id] = [];
            }
          } else {
            roomsMap[b.id] = [];
          }
          // Lấy duration mặc định
          if (b.planDurations && b.planDurations.length > 0) {
            durationMap[b.id] = b.planDurations[0];
          }
        }));
        setBasicRooms(roomsMap);
        setDuration(durationMap);
      } catch (err) {
        setCombo(null);
        setBasicDetails([]);
        setBasicRooms({});
        setDuration({});
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  // Check availability cho từng basic living
  const checkAllRoomsAvailability = async (basicId: string, from?: string, to?: string) => {
    const rooms = basicRooms[basicId] || [];
    if (!rooms || rooms.length === 0) return;
    const results: any = {};
    await Promise.all(
      rooms.map(async (room: any) => {
        try {
          const params: any = {};
          if (from) params.from = from;
          if (to) params.to = to;
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
          results[room.id] = { viewedBookingStatus: 'unknown', from: from || '', to: to || '', startDate: null, endDate: null };
        }
      })
    );
    setRoomAvailability(prev => ({ ...prev, [basicId]: results }));
  };

  // Khi chọn lịch cho từng basic living
  const handleDateRangeSelect = async (basicId: string, dates: { moveIn: Date | null; moveOut: Date | null }) => {
    let moveOut: Date | null = null;
    const dur = duration[basicId];
    if (dates.moveIn && dur) {
      moveOut = new Date(dates.moveIn);
      if (dur.planDurationUnit === 'Month') {
        moveOut.setMonth(moveOut.getMonth() + Number(dur.planDurationValue));
      } else if (dur.planDurationUnit === 'Year') {
        moveOut.setFullYear(moveOut.getFullYear() + Number(dur.planDurationValue));
      }
    }
    setSelectedDates(prev => ({ ...prev, [basicId]: { moveIn: dates.moveIn, moveOut } }));
    setAvailabilityDates(prev => ({
      ...prev,
      [basicId]: {
        from: dates.moveIn ? dates.moveIn.toISOString().slice(0, 10) : '',
        to: moveOut ? moveOut.toISOString().slice(0, 10) : '',
      }
    }));
    setShowDatePicker(prev => ({ ...prev, [basicId]: false }));
    setDatePickerSource(prev => ({ ...prev, [basicId]: null }));
    // Save selected dates to localStorage nếu muốn
    if (dates.moveIn && moveOut) {
      localStorage.setItem(`combo_selectedDates_${basicId}`, JSON.stringify({
        moveIn: dates.moveIn.toISOString(),
        moveOut: moveOut.toISOString()
      }));
      await checkAllRoomsAvailability(
        basicId,
        dates.moveIn.toISOString().slice(0, 10),
        moveOut.toISOString().slice(0, 10)
      );
    }
  };

  // Khi load trang hoặc có availabilityDates mới, check trạng thái phòng cho từng basic living
  useEffect(() => {
    Object.keys(availabilityDates).forEach(basicId => {
      const dates = availabilityDates[basicId];
      if (dates && (dates.from || dates.to)) {
        checkAllRoomsAvailability(basicId, dates.from, dates.to);
      }
    });
    // eslint-disable-next-line
  }, [JSON.stringify(availabilityDates), JSON.stringify(basicRooms)]);

  // On mount, restore selected dates cho từng basic living
  useEffect(() => {
    const restored: any = {};
    const avail: any = {};
    basicDetails.forEach(basic => {
      const saved = localStorage.getItem(`combo_selectedDates_${basic.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const restoredDates = {
            moveIn: parsed.moveIn ? new Date(parsed.moveIn) : null,
            moveOut: parsed.moveOut ? new Date(parsed.moveOut) : null
          };
          restored[basic.id] = restoredDates;
          avail[basic.id] = {
            from: restoredDates.moveIn ? restoredDates.moveIn.toISOString().slice(0, 10) : '',
            to: restoredDates.moveOut ? restoredDates.moveOut.toISOString().slice(0, 10) : '',
          };
        } catch {}
      }
    });
    setSelectedDates(restored);
    setAvailabilityDates(avail);
    // eslint-disable-next-line
  }, [basicDetails.length]);

  // Sắp xếp basicDetails: Life Activities trước, Accommodation sau
  const sortedBasics = [
    ...basicDetails.filter(b => b.basicPlanType === 'Life Activity' || b.basicPlanTypeCode === 'LIFEACTIVITIES'),
    ...basicDetails.filter(b => b.basicPlanType === 'Accommodation' || b.basicPlanTypeCode === 'ACCOMMODATION')
  ];
  const accommodationBasic = sortedBasics.find(b => (b.basicPlanType === 'Accommodation' || b.basicPlanTypeCode === 'ACCOMMODATION') && basicRooms[b.id] && basicRooms[b.id].length > 0);
  const accommodationBasicId = accommodationBasic?.id;
  const accommodationRooms = accommodationBasic ? basicRooms[accommodationBasic.id] : [];
  const accommodationSelectedDates = accommodationBasic ? selectedDates[accommodationBasic.id] : undefined;
  // Đảm bảo accommodationRoomAvailability là object
  const accommodationRoomAvailability = accommodationBasic && roomAvailability[accommodationBasic.id] ? roomAvailability[accommodationBasic.id] : {};
  const accommodationDuration = accommodationBasic ? duration[accommodationBasic.id] : null;

  // Calculate total price using API totalPrice
  const calculateTotalPrice = () => {
    // 1. Tổng giá các package Life Activity
    const lifeActivityPackages = sortedBasics.filter(b => b.basicPlanType === 'Life Activity' || b.basicPlanTypeCode === 'LIFEACTIVITIES');
    const lifeActivityTotal = lifeActivityPackages.reduce((sum, pkg) => sum + (pkg.price || 0), 0);
    
    // 2. Giá package Accommodation
    const accommodationTotal = accommodationBasic ? (accommodationBasic.price || 0) : 0;
    
    // 3. Addon * duration (1 month = 30 days)
    let addonCost = 0;
    if (accommodationDuration && accommodationSelectedDates?.moveIn && accommodationSelectedDates?.moveOut) {
      const durationValue = parseInt(accommodationDuration.planDurationValue) || 1;
      const durationUnit = accommodationDuration.planDurationUnit || 'Month';
      
      let durationInDays = 0;
      if (durationUnit === 'Month') {
        durationInDays = durationValue * 30; // 1 month = 30 days
      } else if (durationUnit === 'Year') {
        durationInDays = durationValue * 365;
      } else if (durationUnit === 'Day') {
        durationInDays = durationValue;
      }
      
      // Addon cost calculation - addOnFee per night * duration in days
      if (selectedRoom && selectedRoom.addOnFee) {
        const addOnFeePerNight = selectedRoom.addOnFee || 0;
        addonCost = addOnFeePerNight * durationInDays;
      }
    }
    
    // Sử dụng totalPrice từ API thay vì tính toán lại
    const apiTotalPrice = combo?.totalPrice || 0;
    const finalPrice = apiTotalPrice + addonCost; // Chỉ cộng thêm addon cost
    
    return {
      lifeActivityTotal,
      accommodationTotal,
      addonCost,
      subtotal: apiTotalPrice,
      discountAmount: 0, // Không tính discount vì API đã bao gồm
      finalPrice
    };
  };

  const priceBreakdown = calculateTotalPrice();

  const handleSelectRoom = (room: any) => {
    setSelectedRoom(room);
  };

  const handleTabClick = (tabKey: string) => {
    setActiveTab(tabKey);
    let ref = null;
    switch (tabKey) {
      case "details": ref = detailsRef; break;
      case "packages": ref = packagesRef; break;
      case "rooms": ref = roomsRef; break;
      case "reviews": ref = reviewsRef; break;
      default: break;
    }
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const checkProfileComplete = async () => {
    try {
      const res = await api.get("/api/user/profiles/profileme");
      const data = res.data || res;
      if (!data.fullName || !data.phone || !data.dob || !data.gender || !data.address) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const handlePayNow = async () => {
    if (!selectedRoom || !accommodationBasic || !accommodationSelectedDates?.moveIn) return;
    setIsPaying(true);
    setMessage(null);
    if (!isLoggedIn) {
      setShowAuthModal(true);
      setIsPaying(false);
      return;
    }
    const isProfileComplete = await checkProfileComplete();
    if (!isProfileComplete) {
      setShowProfileModal(true);
      setIsPaying(false);
      return;
    }
    try {
      const res = await api.post("/api/user/memberships/requestMember", {
        packageId: combo.id,
        packageType: "combo",
        selectedStartDate: accommodationSelectedDates.moveIn.toISOString(),
        requireBooking: true,
        roomInstanceId: selectedRoom.id,
        messageToStaff: "",
        redirectUrl: window.location.origin + "/profile",
        // Thêm thông tin giá tính toán
        priceBreakdown: {
          lifeActivityTotal: priceBreakdown.lifeActivityTotal,
          accommodationTotal: priceBreakdown.accommodationTotal,
          addonCost: priceBreakdown.addonCost,
          subtotal: priceBreakdown.subtotal,
          discountAmount: priceBreakdown.discountAmount,
          finalPrice: priceBreakdown.finalPrice
        }
      });
      if (res.data && res.data.success) {
        router.push("/request-success");
      } else {
        setMessage("Yêu cầu mua combo thất bại. Vui lòng thử lại.");
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Yêu cầu mua combo thất bại. Vui lòng thử lại.";
      setMessage(errorMsg);
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg">Đang tải dữ liệu...</div>;
  if (!combo) return <div className="min-h-screen flex items-center justify-center text-lg text-red-500">Không tìm thấy combo này.</div>;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#e8f9fc] via-[#f0fbfd] to-[#cce9fa]">
      {/* Hiển thị message nếu có */}
      {message && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-blue-200 shadow-lg rounded-xl px-6 py-3 text-blue-800 font-semibold text-center animate-fade-in">
          {message}
        </div>
      )}
      
      {/* Back button */}
      <div className="max-w-7xl mx-auto">
        <button
          className="mb-6 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold shadow hover:bg-slate-100 transition"
          onClick={() => router.push('/packages')}
        >
          ← Back to Packages
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái: Thông tin combo + sections */}
        <div className="lg:col-span-2">
          {/* Header + Info */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{combo.name}</h1>
            <div className="flex flex-col gap-2 text-slate-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8</span>
                  <span>(24 reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{combo.propertyName || "Property Location"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">Type:</span>
                  <span>Combo Package</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-slate-700 font-semibold">Total Price: <span className="text-blue-700 font-bold">₫{combo.totalPrice?.toLocaleString()}</span></div>
                <div className="text-slate-700 font-semibold">Discount: <span className="text-green-700 font-bold">{(combo.discountRate * 100).toFixed(0)}%</span></div>
              </div>
            </div>
          </div>

          {/* Tabs bar - sticky on scroll */}
          <div className="w-full border-b border-slate-200 mb-6 sticky top-16 z-30 bg-[#f0fbfd]">
            <nav className="flex flex-row gap-6 px-2 overflow-x-auto">
              {[
                { key: "details", label: "Details" }, 
                { key: "packages", label: "Packages" }, 
                { key: "rooms", label: "Rooms" }, 
                { key: "reviews", label: "Reviews" }
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`relative py-3 px-1 text-base font-medium transition-colors duration-150 focus:outline-none
                    ${activeTab === tab.key ? 'text-slate-900 font-semibold' : 'text-slate-500'}
                    hover:text-slate-900`}
                  style={{ background: 'none', border: 'none' }}
                  onClick={() => handleTabClick(tab.key)}
                >
                  {tab.label}
                  <span className={`absolute left-0 right-0 -bottom-1 h-0.5 rounded bg-orange-500 transition-all duration-200 ${activeTab === tab.key ? 'opacity-100' : 'opacity-0'} pointer-events-none`}></span>
                </button>
              ))}
            </nav>
          </div>

          {/* Details Section */}
          <div ref={detailsRef} className="bg-white rounded-2xl shadow border border-slate-200 p-8 mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:gap-8 gap-4 mb-6">
              <div className="flex items-center gap-2 text-slate-700 text-base"><Users className="h-5 w-5 mr-1" /> {basicDetails.length} packages</div>
              <div className="flex items-center gap-2 text-slate-700 text-base"><Calendar className="h-5 w-5 mr-1" /> 3 months min.</div>
              <div className="flex items-center gap-2 text-slate-700 text-base"><Award className="h-5 w-5 mr-1" /> {combo.planLevelName}</div>
            </div>
            <hr className="my-4" />
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Description</h3>
                <p className="text-slate-600 leading-relaxed">{combo.description || 'This combo package includes multiple services and accommodations for a complete living experience.'}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Package Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-slate-600">Level: {combo.planLevelName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-slate-600">Target: {combo.targetAudienceName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-slate-600">Discount: {combo.discountRate * 100}% off</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-slate-600">Code: {combo.code}</span>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Packages Section */}
          <div ref={packagesRef} className="bg-white rounded-2xl shadow border border-slate-200 p-8 mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Included Packages</h2>
            <hr className="w-12 border-slate-300 mb-6" />
            
            <div className="space-y-6">
              {/* Life Activities first */}
              {sortedBasics.filter(b => b.basicPlanType === 'Life Activity' || b.basicPlanTypeCode === 'LIFEACTIVITIES').map((basic, idx) => (
                <Card key={basic.id || idx} className="border border-slate-200 rounded-xl shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-5 w-5 text-green-500" />
                          <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Life Activity</span>
                        </div>
                        <div className="font-bold text-lg text-slate-800 mb-1">{basic.name}</div>
                        <div className="text-slate-600 mb-2">{basic.description}</div>
                        <div className="flex gap-4 text-sm text-slate-500">
                          <span>Code: {basic.code}</span>
                          <span>Price: ₫{basic.price?.toLocaleString()}</span>
                        </div>
                        {basic.entitlements && basic.entitlements.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm font-medium text-slate-700 mb-2">Entitlements:</div>
                            <div className="flex flex-wrap gap-2">
                              {basic.entitlements.map((ent: any, i: number) => (
                                <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                  {ent.nextUSerName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Accommodation packages */}
              {sortedBasics.filter(b => b.basicPlanType === 'Accommodation' || b.basicPlanTypeCode === 'ACCOMMODATION').map((basic, idx) => (
                <Card key={basic.id || idx} className="border border-slate-200 rounded-xl shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Bed className="h-5 w-5 text-blue-500" />
                          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Accommodation</span>
                        </div>
                        <div className="font-bold text-lg text-slate-800 mb-1">{basic.name}</div>
                        <div className="text-slate-600 mb-2">{basic.description}</div>
                        <div className="flex gap-4 text-sm text-slate-500">
                          <span>Code: {basic.code}</span>
                          <span>Price: ₫{basic.price?.toLocaleString()}</span>
                        </div>
                        {basic.acomodations && basic.acomodations.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm font-medium text-slate-700 mb-2">Room Type:</div>
                            <div className="text-sm text-slate-600">
                              {basic.acomodations[0].roomType} - {basic.acomodations[0].accomodationDescription}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Rooms Section */}
          {accommodationBasic && (
            <div ref={roomsRef} className="bg-white/90 rounded-2xl shadow border border-slate-200 p-6 mb-8">
              {/* Header row: title/desc left, button right */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Room options</h2>
                  <div className="text-slate-600">Choose your room in this accommodation package.</div>
                </div>
                <div className="mt-2 md:mt-0">
                  {(!accommodationSelectedDates || !accommodationSelectedDates.moveIn || !accommodationSelectedDates.moveOut) ? (
                    <Button
                      className="rounded-full px-8 py-3 text-base font-semibold bg-black text-white hover:bg-slate-800"
                      onClick={() => setShowDatePicker(prev => ({ ...prev, [accommodationBasicId]: true }))}
                    >
                      Check availability
                    </Button>
                  ) : (
                    <button
                      type="button"
                      className="flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-3 text-base font-semibold text-slate-700 shadow-sm min-w-[280px]"
                      onClick={() => setShowDatePicker(prev => ({ ...prev, [accommodationBasicId]: true }))}
                    >
                      {accommodationSelectedDates.moveIn?.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })} -&gt; {accommodationSelectedDates.moveOut?.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                    </button>
                  )}
                </div>
              </div>
              <hr className="my-4" />
              {/* Private rooms section as a card/box */}
              <div className="bg-slate-50 rounded-xl border border-slate-100 shadow-sm p-4">
                <div className="grid grid-cols-1 gap-6">
                  {accommodationRooms.length === 0 && <div className="text-slate-500">Không có phòng nào khả dụng cho gói này.</div>}
                  {accommodationRooms.map((room: any, idx: number) => {
                    const isSelected = selectedRoom && selectedRoom.id === room.id;
                    const availability = accommodationRoomAvailability[room.id] || {};
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
                            {room.addOnFee > 0 && (
                              <div className="text-slate-500 text-sm mb-1">Addon: ₫{room.addOnFee?.toLocaleString()}/night</div>
                            )}
                            {/* Trạng thái phòng */}
                            <div className="mt-2 text-sm">
                              {isAvailable && <span className="text-green-600 font-semibold">Available</span>}
                              {availableFrom && <span className="text-orange-600 font-semibold">{status}</span>}
                              {!isAvailable && !availableFrom && status && <span className="text-gray-500">{status}</span>}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 items-center">
                            <div className="text-xl font-bold text-blue-700 mb-2">₫{(priceBreakdown.accommodationTotal + priceBreakdown.addonCost).toLocaleString()}</div>
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
          )}

          {/* Reviews Section */}
          <div ref={reviewsRef} className="bg-white rounded-2xl shadow border border-slate-200 p-8 mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Reviews</h2>
            <hr className="w-12 border-slate-300 mb-6" />
            <div className="text-center py-8">
              <div className="text-5xl font-bold text-slate-800 mb-2">4.8</div>
              <div className="flex items-center justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <div className="font-semibold text-green-600 text-lg mb-1">Excellent!</div>
              <div className="text-slate-500">Based on 24 reviews</div>
            </div>
          </div>
        </div>

        {/* Cột phải: Box booking */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 rounded-2xl border-0 shadow-lg">
            <CardContent className="p-6">
              {!selectedRoom || !accommodationBasic ? (
                // UI khi chưa chọn phòng: hiển thị nút chọn lịch/check availability
                <div>
                  <div className="text-center mb-4">
                    <div className="text-lg font-bold mb-2">Select room and dates</div>
                    <div className="bg-green-100 text-green-700 rounded-lg py-2 px-4 mb-4 font-semibold">Book now - Pay at the property</div>
                  </div>
                  {accommodationBasic && (
                    <div className="flex flex-row gap-2 justify-center mb-4">
                      {(!accommodationSelectedDates || !accommodationSelectedDates.moveIn || !accommodationSelectedDates.moveOut)
                        ? (
                          <Button
                            className="px-6 py-2 rounded-md font-semibold text-base"
                            variant="secondary"
                            onClick={() => setShowDatePicker(prev => ({ ...prev, [accommodationBasicId]: true }))}
                          >
                            Check availability
                          </Button>
                        )
                        : (
                          <button
                            type="button"
                            className="flex items-center gap-2 px-6 py-2 rounded-full border border-slate-300 bg-white shadow min-w-[280px]"
                            onClick={() => setShowDatePicker(prev => ({ ...prev, [accommodationBasicId]: true }))}
                          >
                            <CalendarIcon className="h-5 w-5 text-blue-600" />
                            <span>{accommodationSelectedDates?.moveIn?.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })} -&gt; {accommodationSelectedDates?.moveOut?.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </button>
                        )
                      }
                    </div>
                  )}
                  <Button 
                    className="w-full bg-black text-white font-bold py-3 text-lg rounded-full" 
                    disabled={!accommodationBasic || !accommodationSelectedDates?.moveIn || !accommodationSelectedDates?.moveOut}
                  >
                    Select Room
                  </Button>
                </div>
              ) : (
                // Đã chọn phòng và lịch, nút là Buy
                <>
                  <div className="text-center mb-6">
                    {/* Combo package name at top */}
                    <div className="text-2xl font-bold text-slate-800 mb-1">{combo.name}</div>
                    {/* Room name indented below if selected */}
                    {selectedRoom && (
                      <div className="text-lg text-slate-600 mb-2 ml-4">
                        ↳ {selectedRoom.roomName || selectedRoom.roomTypeName}
                      </div>
                    )}
                    <div className="text-3xl font-bold text-blue-700">₫{priceBreakdown.finalPrice?.toLocaleString()}</div>
                    <div className="text-slate-600">per month</div>
                    
                    {/* Dates smaller below room section */}
                    <div className="flex gap-2 mt-4 justify-center">
                      <div className="text-xs text-slate-500 px-3 py-1 bg-slate-100 rounded-full">
                        {accommodationSelectedDates?.moveIn ? accommodationSelectedDates.moveIn.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Move in'} 
                        → 
                        {accommodationSelectedDates?.moveOut ? accommodationSelectedDates.moveOut.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : 'Move out'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    {/* Price breakdown với tên từng package */}
                    <div className="space-y-2 mb-4">
                      {/* Life Activity packages */}
                      {sortedBasics.filter(b => b.basicPlanType === 'Life Activity' || b.basicPlanTypeCode === 'LIFEACTIVITIES').map((basic, idx) => (
                        <div key={basic.id || idx} className="flex justify-between items-center text-sm text-slate-600">
                          <span>{basic.name}</span>
                          <span>₫{basic.price?.toLocaleString()}</span>
                        </div>
                      ))}
                      
                      {/* Accommodation package với tên phòng nếu đã chọn */}
                      {accommodationBasic && (
                        <div className="flex justify-between items-center text-sm text-slate-600">
                          <span>
                            {selectedRoom ? selectedRoom.roomName || selectedRoom.roomTypeName : accommodationBasic.name}
                            {selectedRoom && priceBreakdown.addonCost > 0 && (
                              <span className="text-xs text-slate-400 block">
                                (₫{priceBreakdown.accommodationTotal?.toLocaleString()} + ₫{priceBreakdown.addonCost?.toLocaleString()} addon)
                              </span>
                            )}
                          </span>
                          <span>₫{(priceBreakdown.accommodationTotal + priceBreakdown.addonCost).toLocaleString()}</span>
                        </div>
                      )}
                      
                      {priceBreakdown.addonCost > 0 && (
                        <div className="flex justify-between items-center text-sm text-slate-600">
                          <span>Subtotal (from API)</span>
                          <span>₫{priceBreakdown.subtotal?.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center font-semibold text-slate-800 pt-2 border-t border-slate-200">
                      <span>Total</span>
                      <span>₫{priceBreakdown.finalPrice?.toLocaleString()}</span>
                    </div>
                    <button
                      className="mt-6 w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={handlePayNow}
                      disabled={isPaying || !selectedRoom || !accommodationSelectedDates?.moveIn}
                    >
                      {isPaying ? "Processing..." : "Buy"}
                    </button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* DatePickerModal cho accommodation basic */}
      {accommodationBasic && (
        <DatePickerModal
          key={accommodationBasic.id}
          open={!!showDatePicker[accommodationBasic.id]}
          onOpenChange={open => setShowDatePicker(prev => ({ ...prev, [accommodationBasic.id]: open }))}
          onDatesSelect={dates => handleDateRangeSelect(accommodationBasic.id, dates)}
        />
      )}
      {showAuthModal && (
        <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
          <DialogContent className="max-w-sm p-8 text-center flex flex-col items-center">
            <AlertCircle className="text-blue-500 mb-3" size={48} />
            <DialogTitle className="text-2xl font-bold mb-2">Bạn cần đăng nhập</DialogTitle>
            <DialogDescription className="mb-4 text-base text-slate-600">Vui lòng đăng nhập để sử dụng chức năng này và tiếp tục quá trình mua combo.</DialogDescription>
            <Button className="mt-2 w-full py-3 text-base font-semibold rounded-full bg-blue-600 hover:bg-blue-700 transition" onClick={() => { setShowAuthModal(false); router.push("/login"); }}>Đăng nhập</Button>
          </DialogContent>
        </Dialog>
      )}
      {showProfileModal && (
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent className="max-w-sm p-8 text-center flex flex-col items-center">
            <UserCheck className="text-green-500 mb-3" size={48} />
            <DialogTitle className="text-2xl font-bold mb-2">Hoàn thiện hồ sơ</DialogTitle>
            <DialogDescription className="mb-4 text-base text-slate-600">Bạn cần hoàn thiện hồ sơ cá nhân (họ tên, số điện thoại, ngày sinh, giới tính, địa chỉ) để tiếp tục mua combo.</DialogDescription>
            <Button className="mt-2 w-full py-3 text-base font-semibold rounded-full bg-green-600 hover:bg-green-700 transition" onClick={() => { setShowProfileModal(false); router.push("/account/about-me"); }}>Hoàn thiện hồ sơ</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 