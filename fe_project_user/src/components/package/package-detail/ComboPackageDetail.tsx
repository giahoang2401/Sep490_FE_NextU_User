import { useEffect, useState, useRef } from "react";
import api from "@/utils/axiosConfig";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePickerModal } from "@/components/date-picker-modal";
import { isLogged } from "@/utils/auth";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/components/auth-context";
import { AlertCircle, UserCheck, Star, MapPin, Bed, Bath, Users, Wifi, CheckCircle, Calendar, Clock, Calendar as CalendarIcon, Zap, Award, Building, Eye, Maximize, X } from "lucide-react";
// Markdown rendering
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';



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
  
  // Room detail modal states
  const [showRoomDetail, setShowRoomDetail] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewingRoom, setViewingRoom] = useState<any>(null); // Room đang xem trong modal
  
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
        // Fetch combo info và basic packages trước
        console.log('[DEBUG] Fetching combo info...');
        const comboRes = await api.get(`/api/membership/ComboPlans/${id}`);
        const comboData = comboRes.data || comboRes;
        console.log('[DEBUG] Combo info fetched successfully:', comboData);
        setCombo(comboData);

        // Fetch all basic package details
        let basics: any[] = [];
        if (comboData.basicPlanIds && comboData.basicPlanIds.length > 0) {
          console.log('[DEBUG] Fetching basic package details...');
          basics = await Promise.all(
            comboData.basicPlanIds.map(async (bid: string) => {
              try {
                const res = await api.get(`/api/membership/BasicPlans/${bid}`);
                const basicData = res.data || res;
                
                // Fetch entitlements for each basic plan
                if (basicData.entitlements && basicData.entitlements.length > 0) {
                  const entitlementsWithDetails = await Promise.all(
                    basicData.entitlements.map(async (ent: any) => {
                      try {
                        // Use entitlementId from the entitlements array
                        const entitlementRes = await api.get(`/api/membership/EntitlementRule/${ent.entitlementId}`);
                        const entitlementData = entitlementRes.data || entitlementRes;
                        return {
                          ...ent,
                          ...entitlementData
                        };
                      } catch (err) {
                        console.error(`[ERROR] Failed to fetch entitlement rule ${ent.entitlementId}:`, err);
                        return ent;
                      }
                    })
                  );
                  basicData.entitlements = entitlementsWithDetails;
                }
                
                return basicData;
              } catch {
                console.error(`[ERROR] Failed to fetch basic plan ${bid}`);
                return null;
              }
            })
          );
          setBasicDetails(basics.filter(Boolean));
          console.log('[DEBUG] Basic package details fetched:', basics.filter(Boolean));
        } else {
          setBasicDetails([]);
        }

        // Fetch rooms separately - nếu lỗi thì không ảnh hưởng combo và basic info
        try {
          console.log('[DEBUG] Fetching rooms for accommodation basics...');
          // Fetch rooms & durations for each accommodation basic (serviceType = 0)
          const accommodationBasics = basics.filter(b => b && b.serviceType === 0 && Array.isArray(b.acomodations) && b.acomodations.length > 0);
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
                console.log(`[DEBUG] Rooms fetched for basic ${b.id}:`, roomsWithAddOn);
              } catch (roomErr) {
                console.error(`[ERROR] Failed to fetch rooms for basic ${b.id}:`, roomErr);
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
        } catch (roomsErr) {
          console.error('[ERROR] Failed to fetch rooms (but combo info is OK):', roomsErr);
          setBasicRooms({});
          setDuration({});
        }

      } catch (err) {
        console.error('[ERROR] Failed to fetch combo info:', err);
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
    
    console.log('[DEBUG] checkAllRoomsAvailability called for basicId:', basicId, { from, to, roomsCount: rooms.length });
    
    const results: any = {};
    await Promise.all(
      rooms.map(async (room: any) => {
        try {
          const params: any = { roomId: room.id };
          
          // Convert date format from yyyy-MM-dd to MM/dd/yyyy
          if (from) {
            // Parse date string directly to avoid timezone issues
            const [year, month, day] = from.split('-');
            params.startDate = `${month}/${day}/${year}`;
          }
          if (to) {
            // Parse date string directly to avoid timezone issues
            const [year, month, day] = to.split('-');
            params.endDate = `${month}/${day}/${year}`;
          }
          
          console.log(`Checking room ${room.id} with params:`, params);
          
          const res = await api.get(`/api/membership/Bookings/availability`, { params });
          const data = res.data || res;
          
          if (data.available) {
            results[room.id] = {
              viewedBookingStatus: data.message || 'Available',
              from: from || '',
              to: to || '',
              available: true,
              message: data.message || 'Available',
            };
          } else {
            results[room.id] = {
              viewedBookingStatus: data.message || 'Not available',
              from: from || '',
              to: to || '',
              available: false,
              message: data.message || 'Not available',
              availableFrom: data.availableFrom,
              blockingBookingId: data.blockingBookingId,
              blockingStatus: data.blockingStatus,
            };
          }
        } catch (error) {
          console.error(`Error checking room ${room.id}:`, error);
          results[room.id] = { 
            viewedBookingStatus: 'unknown', 
            from: from || '', 
            to: to || '', 
            available: false,
            message: 'Error checking availability'
          };
        }
      })
    );
    
    console.log('Availability results for basicId:', basicId, results);
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

  // Sắp xếp basicDetails: Non-booking (serviceType=1) trước, Booking (serviceType=0) sau
  const sortedBasics = [
    ...basicDetails.filter(b => b.serviceType === 1), // Non-booking services (Lifestyle Services, Workplace Activities)
    ...basicDetails.filter(b => b.serviceType === 0)  // Booking services (Accommodation, Workspace)
  ];
  const accommodationBasic = sortedBasics.find(b => b.serviceType === 0 && basicRooms[b.id] && basicRooms[b.id].length > 0);
  const accommodationBasicId = accommodationBasic?.id;
  const accommodationRooms = accommodationBasic ? basicRooms[accommodationBasic.id] : [];
  const accommodationSelectedDates = accommodationBasic ? selectedDates[accommodationBasic.id] : undefined;
  // Đảm bảo accommodationRoomAvailability là object
  const accommodationRoomAvailability = accommodationBasic && roomAvailability[accommodationBasic.id] ? roomAvailability[accommodationBasic.id] : {};
  const accommodationDuration = accommodationBasic ? duration[accommodationBasic.id] : null;

  // Calculate total price using API totalPrice
  const calculateTotalPrice = () => {
    // 1. Tổng giá các package Non-booking (serviceType = 1)
    const nonBookingPackages = sortedBasics.filter(b => b.serviceType === 1);
    const nonBookingTotal = nonBookingPackages.reduce((sum, pkg) => sum + (pkg.price || 0), 0);
    
    // 2. Giá package Booking (serviceType = 0)
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
    
    // Tính toán giá gốc (trước discount)
    const originalPrice = nonBookingTotal + accommodationTotal + addonCost;
    
    // Tính discount amount
    const discountRate = combo?.discountRate || 0;
    const discountAmount = originalPrice * discountRate;
    
    // Giá cuối sau khi áp dụng discount
    const finalPrice = originalPrice - discountAmount;
    
    return {
      nonBookingTotal,
      accommodationTotal,
      addonCost,
      subtotal: originalPrice,
      discountAmount,
      finalPrice
    };
  };

  // Calculate room price with addon for display (even when room not selected)
  const calculateRoomPriceWithAddon = (room: any) => {
    if (!room || !accommodationDuration || !accommodationSelectedDates?.moveIn || !accommodationSelectedDates?.moveOut) {
      return accommodationBasic ? accommodationBasic.price || 0 : 0;
    }
    
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
    
    const basePrice = accommodationBasic ? accommodationBasic.price || 0 : 0;
    const addonCost = (room.addOnFee || 0) * durationInDays;
    
    return basePrice + addonCost;
  };

  const priceBreakdown = calculateTotalPrice();

  // Function to normalize escaped strings from API
  const normalizeDescription = (text: string): string => {
    if (!text) return '';
    
    return text
      // Convert escaped newlines to actual newlines
      .replace(/\\n/g, '\n')
      // Convert escaped quotes
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      // Convert escaped backslashes
      .replace(/\\\\/g, '\\')
      // Convert Unicode escape sequences to actual characters
      .replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
      // Convert other common escape sequences
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r');
  };

  const handleRoomClick = (room: any) => {
    // Chỉ mở modal, không set selectedRoom
    setViewingRoom(room);
    setCurrentImageIndex(0);
    setShowRoomDetail(true);
  };

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
          nonBookingTotal: priceBreakdown.nonBookingTotal,
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
                { key: "details", label: "Overview" }, 
                { key: "packages", label: "Package Info" }, 
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

          {/* Main Content Box - All sections combined */}
          <div className="bg-white rounded-2xl shadow border border-slate-200 p-8 mb-10">
            {/* Package Details Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-6">Package Details</h3>
              <div className="flex items-stretch mb-8">
                {/* Left Column - 3 fields */}
                <div className="flex-1 pr-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <Users className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-slate-500 font-medium">Total Packages</div>
                        <div className="text-slate-800 font-semibold">{basicDetails.length} packages</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-slate-500 font-medium">Minimum Duration</div>
                        <div className="text-slate-800 font-semibold">3 months min.</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <Award className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-slate-500 font-medium">Plan Level</div>
                        <div className="text-slate-800 font-semibold">{combo.planLevelName}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Center Divider */}
                <div className="w-px bg-slate-200 mx-4"></div>
                
                {/* Right Column - 2 fields */}
                <div className="flex-1 pl-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <span className="text-slate-600 font-bold text-lg">#</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-slate-500 font-medium">Package Code</div>
                        <div className="text-slate-800 font-semibold">{combo.code}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <span className="text-slate-600 font-bold text-lg">%</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-slate-500 font-medium">Discount Rate</div>
                        <div className="text-slate-800 font-semibold">{(combo.discountRate * 100).toFixed(0)}% off</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Package Entitlements - Grouped by Service Type */}
              <div className="space-y-8">
                {/* Non-booking services group (serviceType = 1) */}
                {(() => {
                  const nonBookingBasics = sortedBasics.filter(b => b.serviceType === 1);
                  if (nonBookingBasics.length === 0) return null;
                  
                  return (
                    <div>
                      <div className="flex items-center gap-2 mb-6">
                        <Zap className="h-5 w-5 text-green-500" />
                        <span className="text-xl font-semibold text-green-700">{nonBookingBasics[0]?.nextUServiceName || 'Lifestyle Services'}</span>
                      </div>
                      
                      <div className="flex gap-6">
                        {/* Left Column */}
                        <div className="flex-1">
                          {nonBookingBasics.slice(0, Math.ceil(nonBookingBasics.length / 2)).map((basic, idx) => (
                            <div key={basic.id || idx} className="pb-4 border-b border-slate-200 last:border-b-0">
                              <div className="font-bold text-base text-slate-800 mb-2">{basic.name}</div>
                              <div className="flex gap-4 text-xs text-slate-500 mb-3">
                                <span>Code: {basic.code}</span>
                                <span>Price: ₫{basic.price?.toLocaleString()}</span>
                              </div>
                              {basic.entitlements && basic.entitlements.length > 0 && (
                                <div>
                                  {basic.entitlements.map((ent: any, i: number) => (
                                    <div key={i} className="bg-slate-50 rounded p-3">
                                      <div className="font-medium text-slate-700 mb-2 text-center text-sm">{ent.entittlementRuleName || 'Entitlement'}</div>
                                      <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="text-center">
                                          <div className="font-medium text-slate-600 mb-1">Period</div>
                                          <div className="text-slate-800 font-semibold">{ent.period === 0 ? 'Weekly' : 'Monthly'}</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="font-medium text-slate-600 mb-1">Limit</div>
                                          <div className="text-slate-800 font-semibold">{ent.limitPerPeriod || 'N/A'}</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="font-medium text-slate-600 mb-1">Credit</div>
                                          <div className="text-slate-800 font-semibold">{ent.creditAmount || 'N/A'}</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Center Divider */}
                        <div className="w-px bg-slate-200"></div>
                        
                        {/* Right Column */}
                        <div className="flex-1">
                          {nonBookingBasics.slice(Math.ceil(nonBookingBasics.length / 2)).map((basic, idx) => (
                            <div key={basic.id || idx} className="pb-4 border-b border-slate-200 last:border-b-0">
                              <div className="font-bold text-base text-slate-800 mb-2">{basic.name}</div>
                              <div className="flex gap-4 text-xs text-slate-500 mb-3">
                                <span>Code: {basic.code}</span>
                                <span>Price: ₫{basic.price?.toLocaleString()}</span>
                              </div>
                              {basic.entitlements && basic.entitlements.length > 0 && (
                                <div>
                                  {basic.entitlements.map((ent: any, i: number) => (
                                    <div key={i} className="bg-slate-50 rounded p-3">
                                      <div className="font-medium text-slate-700 mb-2 text-center text-sm">{ent.entittlementRuleName || 'Entitlement'}</div>
                                      <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="text-center">
                                          <div className="font-medium text-slate-600 mb-1">Period</div>
                                          <div className="text-slate-800 font-semibold">{ent.period === 0 ? 'Weekly' : 'Monthly'}</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="font-medium text-slate-600 mb-1">Limit</div>
                                          <div className="text-slate-800 font-semibold">{ent.limitPerPeriod || 'N/A'}</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="font-medium text-slate-600 mb-1">Credit</div>
                                          <div className="text-slate-800 font-semibold">{ent.creditAmount || 'N/A'}</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Divider between service types */}
                <hr className="border-slate-200" />

                {/* Booking services group (serviceType = 0) */}
                {(() => {
                  const bookingBasics = sortedBasics.filter(b => b.serviceType === 0);
                  if (bookingBasics.length === 0) return null;
                  
                  return (
                    <div>
                      <div className="flex items-center gap-2 mb-6">
                        <Bed className="h-5 w-5 text-blue-500" />
                        <span className="text-xl font-semibold text-blue-700">{bookingBasics[0]?.nextUServiceName || 'Accommodation'}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                          {bookingBasics.slice(0, Math.ceil(bookingBasics.length / 2)).map((basic, idx) => (
                            <div key={basic.id || idx} className="pb-6 border-b border-slate-200 last:border-b-0">
                              <div className="font-bold text-lg text-slate-800 mb-3">{basic.name}</div>
                              <div className="flex gap-6 text-sm text-slate-500 mb-4">
                                <span>Code: {basic.code}</span>
                                <span>Price: ₫{basic.price?.toLocaleString()}</span>
                              </div>
                              {basic.acomodations && basic.acomodations.length > 0 && (
                                <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-4">
                                  <div className="font-medium text-slate-700 mb-2">Room Type:</div>
                                  <div className="text-slate-800">{basic.acomodations[0].roomType} - {basic.acomodations[0].accomodationDescription}</div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Center Divider */}
                        <div className="w-px bg-slate-200 mx-4"></div>
                        
                        {/* Right Column */}
                        <div className="space-y-6">
                          {bookingBasics.slice(Math.ceil(bookingBasics.length / 2)).map((basic, idx) => (
                            <div key={basic.id || idx} className="pb-6 border-b border-slate-200 last:border-b-0">
                              <div className="font-bold text-lg text-slate-800 mb-3">{basic.name}</div>
                              <div className="flex gap-6 text-sm text-slate-500 mb-4">
                                <span>Code: {basic.code}</span>
                                <span>Price: ₫{basic.price?.toLocaleString()}</span>
                              </div>
                              {basic.acomodations && basic.acomodations.length > 0 && (
                                <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-4">
                                  <div className="font-medium text-slate-700 mb-2">Room Type:</div>
                                  <div className="text-slate-800">{basic.acomodations[0].roomType} - {basic.acomodations[0].accomodationDescription}</div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            {/* Divider */}
            <hr className="border-slate-200 mb-8" />
            
            {/* Combo Description Section */}
            <div ref={detailsRef} className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Description</h3>
              <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed">
                {combo.description ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                  >
                    {normalizeDescription(combo.description)}
                  </ReactMarkdown>
                ) : (
                  <p className="whitespace-pre-line">This combo package includes multiple services and accommodations for a complete living experience.</p>
                )}
              </div>
            </div>
            
            {/* Divider */}
            <hr className="border-slate-200 mb-8" />
            
            {/* Basic Package Information Section - Combined Descriptions */}
            <div ref={packagesRef} className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-6">Package Information</h3>
              <div className="space-y-6">
                {/* Non-booking services descriptions */}
                {sortedBasics.filter(b => b.serviceType === 1).map((basic, idx) => (
                  <div key={basic.id || idx} className="pb-6 border-b border-slate-200 last:border-b-0">
                    <div className="mb-4">
                      <h4 className="font-semibold text-slate-800 text-lg mb-3">{basic.name}</h4>
                      <div className="text-slate-600 text-sm leading-relaxed">
                        {(() => {
                          const description = basic.description || 'No description available';
                          const isLong = description.length > 200;
                          
                          if (!isLong) {
                            return <div>{description}</div>;
                          }
                          
                          return (
                            <div>
                              <div className="mb-3">
                                {description.slice(0, 200)}...
                              </div>
                              <button
                                onClick={() => {
                                  const element = document.getElementById(`desc-${basic.id}`);
                                  if (element) {
                                    element.style.display = element.style.display === 'none' ? 'block' : 'none';
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                View more
                              </button>
                              <div id={`desc-${basic.id}`} className="mt-3 hidden">
                                {description}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Booking services descriptions */}
                {sortedBasics.filter(b => b.serviceType === 0).map((basic, idx) => (
                  <div key={basic.id || idx} className="pb-6 border-b border-slate-200 last:border-b-0">
                    <div className="mb-4">
                      <h4 className="font-semibold text-slate-800 text-lg mb-3">{basic.name}</h4>
                      <div className="text-slate-600 text-sm leading-relaxed">
                        {(() => {
                          const description = basic.description || 'No description available';
                          const isLong = description.length > 200;
                          
                          if (!isLong) {
                            return <div>{description}</div>;
                          }
                          
                          return (
                            <div>
                              <div className="mb-3">
                                {description.slice(0, 200)}...
                              </div>
                              <button
                                onClick={() => {
                                  const element = document.getElementById(`desc-${basic.id}`);
                                  if (element) {
                                    element.style.display = element.style.display === 'none' ? 'block' : 'none';
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                View more
                              </button>
                              <div id={`desc-${basic.id}`} className="mt-3 hidden">
                                {description}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Divider */}
            <hr className="border-slate-200 mb-8" />

            {/* Rooms Section */}
            {accommodationBasic && (
              <div ref={roomsRef} className="mb-8">
                {/* Header row: title/desc left, button right */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
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
                
                {/* Room list */}
                <div className="space-y-4">
                  {accommodationRooms.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-slate-500 mb-2">No rooms available for this package.</div>
                      <div className="text-sm text-slate-400">
                        This might be due to system error or no rooms configured yet.
                      </div>
                    </div>
                  )}
                  {accommodationRooms.map((room: any, idx: number) => {
                    const isSelected = selectedRoom && selectedRoom.id === room.id;
                    const availability = accommodationRoomAvailability[room.id] || {};
                    const status = availability.viewedBookingStatus || '';
                    const isAvailable = availability.available === true;
                    
                    // Calculate room price: package price + (addOnFee * 30 * duration)
                    const durationValue = accommodationDuration ? Number(accommodationDuration.planDurationValue) : 1;
                    const roomPrice = accommodationBasic.price + (room.addOnFee * 30 * durationValue);
                    
                    return (
                      <div key={room.id} className={`p-6 ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-slate-50'} rounded-lg transition-all`}>
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Left: Room Image */}
                          <div className="w-64 h-40 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                            {room.medias && room.medias.length > 0 ? (
                              <img 
                                src={room.medias[0].url} 
                                alt={room.roomName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Building className="w-16 h-16" />
                              </div>
                            )}
                          </div>
                          
                          {/* Right: Room Details */}
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                              {/* Room Info */}
                              <div className="flex-1">
                                <div className="font-bold text-lg text-slate-800 mb-2">{room.roomName || room.roomTypeName}</div>
                                
                                {/* Room Specifications Grid */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Maximize className="h-4 w-4 text-slate-400" />
                                    <span>{room.areaInSquareMeters}m²</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Bed className="h-4 w-4 text-slate-400" />
                                    <span>{room.numberOfBeds} beds</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-slate-400" />
                                    <span>{room.roomViewName}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-slate-400" />
                                    <span>{room.roomFloorName}</span>
                                  </div>
                                </div>
                                
                                {/* Room Status */}
                                <div className="mt-3 text-sm">
                                  {isAvailable && <span className="text-green-600 font-semibold">{status}</span>}
                                  {!isAvailable && status && <span className="text-orange-600 font-semibold">{status}</span>}
                                </div>
                              </div>
                              
                              {/* Price and Actions */}
                              <div className="flex flex-col items-end gap-3">
                                <div className="text-right">
                                  <div className="text-sm text-slate-500 mb-1">Total Price</div>
                                  <div className="text-2xl font-bold text-blue-700">₫{roomPrice.toLocaleString()}</div>
                                  <div className="text-xs text-slate-500">
                                    Base: ₫{accommodationBasic.price?.toLocaleString()} + Add-on: ₫{(room.addOnFee * 30 * durationValue).toLocaleString()}
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button
                                    className="rounded-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow hover:shadow-lg transition"
                                    onClick={() => handleRoomClick(room)}
                                    variant="outline"
                                  >
                                    View Details
                                  </Button>
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
                                      ? (hoveredRoomId === room.id ? 'Deselect' : 'Selected')
                                      : isAvailable ? 'Select Room' : 'Cannot Select'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Divider between rooms (except for last room) */}
                        {idx < accommodationRooms.length - 1 && (
                          <hr className="border-slate-200 mt-4" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Divider */}
            <hr className="border-slate-200 mb-8" />

            {/* Reviews Section */}
            <div ref={reviewsRef} className="mb-8">
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
          </div> {/* Close main content box */}
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
                    onClick={() => {
                      if (accommodationBasic && accommodationSelectedDates?.moveIn && accommodationSelectedDates?.moveOut) {
                        // Scroll to rooms section
                        if (roomsRef.current) {
                          roomsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }
                    }}
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
                    
                    {/* Combo Request Notice */}
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Combo packages require staff approval</span>
                      </div>
                      <div className="text-blue-600 text-xs mt-1">
                        Your request will be reviewed by our team
                      </div>
                    </div>
                    
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
                      {/* Non-booking packages */}
                      {sortedBasics.filter(b => b.serviceType === 1).map((basic, idx) => (
                        <div key={basic.id || idx} className="flex justify-between items-center text-sm text-slate-600">
                          <span>{basic.name}</span>
                          <span>₫{basic.price?.toLocaleString()}</span>
                        </div>
                      ))}
                      
                                             {/* Booking package với tên phòng nếu đã chọn */}
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
                           <span>₫{selectedRoom ? calculateRoomPriceWithAddon(selectedRoom).toLocaleString() : (priceBreakdown.accommodationTotal + priceBreakdown.addonCost).toLocaleString()}</span>
                         </div>
                       )}
                      
                                             {priceBreakdown.addonCost > 0 && (
                         <div className="flex justify-between items-center text-sm text-slate-600">
                           <span>Subtotal </span>
                           <span>₫{priceBreakdown.subtotal?.toLocaleString()}</span>
                         </div>
                       )}
                       
                       {/* Hiển thị discount nếu có */}
                       {priceBreakdown.discountAmount > 0 && (
                         <div className="flex justify-between items-center text-sm text-green-600">
                           <span>Discount ({(combo.discountRate * 100).toFixed(0)}% off)</span>
                           <span>-₫{priceBreakdown.discountAmount.toLocaleString()}</span>
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
                      {isPaying ? "Processing..." : "Send Request"}
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

      {/* Room Detail Modal */}
      <Dialog open={showRoomDetail} onOpenChange={setShowRoomDetail}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Building className="h-5 w-5" />
            Room Information
          </DialogTitle>
          
          {viewingRoom && (
            <div className="space-y-6">
              {/* Room Information */}
              <div className="bg-white border rounded-lg p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Image Gallery */}
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden border bg-slate-100">
                      {viewingRoom.medias && viewingRoom.medias.length > 0 ? (
                        <>
                          <img 
                            src={viewingRoom.medias[currentImageIndex].url} 
                            alt={viewingRoom.medias[currentImageIndex].description || 'Room image'}
                            className="w-full h-full object-cover"
                          />
                          {/* Image Counter */}
                          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {currentImageIndex + 1}/{viewingRoom.medias.length}
                          </div>
                          {/* Navigation Arrows */}
                          {viewingRoom.medias.length > 1 && (
                            <>
                                                              <button 
                                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 p-2 rounded-full shadow-lg transition-all"
                                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? viewingRoom.medias.length - 1 : prev - 1))}
                                >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                                                              <button 
                                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 p-2 rounded-full shadow-lg transition-all"
                                  onClick={() => setCurrentImageIndex((prev) => (prev === viewingRoom.medias.length - 1 ? 0 : prev + 1))}
                                >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Thumbnail Navigation */}
                    {viewingRoom.medias && viewingRoom.medias.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {viewingRoom.medias.slice(0, 8).map((media: any, idx: number) => (
                          <div 
                            key={idx} 
                            className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                              currentImageIndex === idx ? 'border-blue-500' : 'border-transparent hover:border-blue-300'
                            }`}
                            onClick={() => setCurrentImageIndex(idx)}
                          >
                            <img 
                              src={media.url} 
                              alt={media.description || `Room thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {/* Show "+.." indicator if there are more than 8 images */}
                        {viewingRoom.medias.length > 8 && (
                          <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                            <span className="text-gray-500 text-sm font-medium">+{viewingRoom.medias.length - 8}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Room Details */}
                  <div className="space-y-4">
                    {/* Combined Description and Room Specifications */}
                    <div className="bg-white border rounded-lg p-4">
                      {/* Description Section */}
                      <div className="mb-4">
                        <h5 className="font-semibold text-slate-800 mb-3">Description</h5>
                        <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700">
                          {viewingRoom.descriptionDetails || 'No description available'}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-slate-200 mb-4"></div>

                      {/* Room Specifications Section */}
                      <div>
                        <h5 className="font-semibold text-slate-800 mb-3">Room Specifications</h5>
                        
                        {/* Room Specifications in 4 rows with 2 columns each */}
                        <div className="space-y-3 text-sm">
                          {/* Row 1: Room Code | Room Type */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex justify-between items-center gap-3">
                              <span className="text-slate-500">Room Code:</span>
                              <span className="font-medium">{viewingRoom.roomCode}</span>
                            </div>
                            <div className="flex justify-between items-center gap-3">
                              <span className="text-slate-500">Room Type:</span>
                              <span 
                                className="font-medium text-right truncate min-w-0 max-w-[70%] cursor-pointer hover:text-blue-600 transition-colors" 
                                title={`Click to see full: ${viewingRoom.roomTypeName}`}
                                onClick={() => {
                                  if (viewingRoom.roomTypeName.length > 15) {
                                    alert(`Full Room Type: ${viewingRoom.roomTypeName}`);
                                  }
                                }}
                              >
                                {viewingRoom.roomTypeName}
                              </span>
                            </div>
                          </div>

                          {/* Row 2: Area | View */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Area:</span>
                              <span className="font-medium">{viewingRoom.areaInSquareMeters} m²</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">View:</span>
                              <span className="font-medium">{viewingRoom.roomViewName}</span>
                            </div>
                          </div>

                          {/* Row 3: Size | Floor */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Size:</span>
                              <span className="font-medium">{viewingRoom.roomSizeName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Floor:</span>
                              <span className="font-medium">{viewingRoom.roomFloorName}</span>
                            </div>
                          </div>

                          {/* Row 4: Bed Type | Number of Beds */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Bed Type:</span>
                              <span className="font-medium">{viewingRoom.bedTypeName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Number of Beds:</span>
                              <span className="font-medium">{viewingRoom.numberOfBeds}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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