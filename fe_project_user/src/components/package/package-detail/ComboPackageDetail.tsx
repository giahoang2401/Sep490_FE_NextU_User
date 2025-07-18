import { useEffect, useState } from "react";
import api from "@/utils/axiosConfig";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePickerModal } from "@/components/date-picker-modal";
import { isLogged } from "@/utils/auth";

function BasicMiniDetail({ basic, onSelectRoom, selectedRoomId, rooms, selectedDates, onShowDatePicker, roomAvailability }: { basic: any, onSelectRoom?: (room: any) => void, selectedRoomId?: string, rooms?: any[], selectedDates?: { moveIn: Date | null; moveOut: Date | null }, onShowDatePicker?: () => void, roomAvailability?: { [roomId: string]: any } }) {
  if (!basic) return null;
  const hasRooms = basic.basicPlanType === 'Living' && Array.isArray(rooms) && rooms.length > 0;
  return (
    <Card className="mb-4 border border-slate-200 rounded-xl shadow-sm">
      <CardContent className="p-4">
        <div className="font-bold text-lg text-slate-800 mb-1">{basic.name}</div>
        <div className="text-slate-600 mb-1">{basic.description}</div>
        <div className="text-slate-500 text-sm mb-1">Code: {basic.code}</div>
        <div className="text-slate-500 text-sm mb-1">Type: {basic.basicPlanType}</div>
        {hasRooms && (
          <div className="mt-4">
            <div className="font-semibold mb-2">Chọn phòng:</div>
            {/* Chọn ngày cho từng basic living */}
            <div className="mb-3">
              {(!selectedDates || !selectedDates.moveIn || !selectedDates.moveOut) ? (
                <Button
                  variant="secondary"
                  className="rounded-full px-6 py-2 font-semibold"
                  onClick={onShowDatePicker}
                >
                  Chọn ngày (Check availability)
                </Button>
              ) : (
                <button
                  type="button"
                  className="flex items-center gap-2 px-6 py-2 rounded-full border border-slate-300 bg-white shadow min-w-[220px] mb-2"
                  onClick={onShowDatePicker}
                >
                  <span>{selectedDates.moveIn.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })} -&gt; {selectedDates.moveOut.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {rooms.map((room: any) => {
                // Trạng thái phòng theo ngày đã chọn
                const availability = roomAvailability && roomAvailability[room.id] ? roomAvailability[room.id] : {};
                const status = availability.viewedBookingStatus || '';
                const isAvailable = status === 'available';
                const availableFrom = status.startsWith('available from') ? status : '';
                return (
                  <div key={room.id} className="flex flex-col items-center">
                    <Button
                      variant={selectedRoomId === room.id ? 'default' : 'outline'}
                      className={selectedRoomId === room.id ? 'ring-2 ring-blue-500' : ''}
                      onClick={() => onSelectRoom && onSelectRoom(room)}
                      disabled={selectedDates && (!selectedDates.moveIn || !selectedDates.moveOut) ? true : !isAvailable}
                    >
                      {room.roomName || room.accomodationDescription || room.roomType || room.id}
                    </Button>
                    {/* Trạng thái phòng */}
                    <span className={`text-xs mt-1 ${isAvailable ? 'text-green-600 font-semibold' : availableFrom ? 'text-orange-600 font-semibold' : status ? 'text-gray-500' : ''}`}>
                      {isAvailable && 'Available'}
                      {availableFrom && status}
                      {!isAvailable && !availableFrom && status && status}
                      {!status && selectedDates && selectedDates.moveIn && selectedDates.moveOut && 'Unknown'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ComboPackageDetail({ id, router }: { id: string, router: any }) {
  const [combo, setCombo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [basicDetails, setBasicDetails] = useState<any[]>([]);
  const [basicRooms, setBasicRooms] = useState<{ [basicId: string]: any[] }>({});
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedBasic, setSelectedBasic] = useState<any>(null);
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
        // Fetch rooms & durations for each living basic
        const livingBasics = basics.filter(b => b && b.basicPlanType === 'Living' && Array.isArray(b.acomodations) && b.acomodations.length > 0);
        const roomsMap: { [basicId: string]: any[] } = {};
        const durationMap: { [basicId: string]: any } = {};
        await Promise.all(livingBasics.map(async (b: any) => {
          const acc = b.acomodations && b.acomodations[0];
          if (acc && acc.accomodationId) {
            try {
              const res = await api.get(`/api/membership/RoomInstances/by-option/${acc.accomodationId}`);
              roomsMap[b.id] = res.data || [];
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

  // Sắp xếp basicDetails: các basic thường trước, basic living cuối cùng
  const sortedBasics = [
    ...basicDetails.filter(b => b.basicPlanType !== 'Living'),
    ...basicDetails.filter(b => b.basicPlanType === 'Living')
  ];
  const livingBasic = sortedBasics.find(b => b.basicPlanType === 'Living' && basicRooms[b.id] && basicRooms[b.id].length > 0);
  const livingBasicId = livingBasic?.id;
  const livingRooms = livingBasic ? basicRooms[livingBasic.id] : [];
  const livingSelectedDates = livingBasic ? selectedDates[livingBasic.id] : undefined;
  // Đảm bảo livingRoomAvailability là object
  const livingRoomAvailability = livingBasic && roomAvailability[livingBasic.id] ? roomAvailability[livingBasic.id] : {};
  const livingDuration = livingBasic ? duration[livingBasic.id] : null;

  const handleSelectRoom = (room: any, basic: any) => {
    setSelectedRoom(room);
    setSelectedBasic(basic);
  };

  const handlePayNow = async () => {
    if (!selectedRoom || !livingBasic || !livingSelectedDates || !livingSelectedDates.moveIn) return;
    setIsPaying(true);
    setMessage(null);
    // Kiểm tra đăng nhập trước khi gọi API
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
        packageId: combo.id,
        packageType: "combo",
        selectedStartDate: livingSelectedDates.moveIn.toISOString(),
        requireBooking: true,
        roomInstanceId: selectedRoom.id,
        messageToStaff: "",
        redirectUrl: window.location.origin + "/profile"
      });
      if (res.data && res.data.success) {
        router.push("/request-success");
      } else {
        setMessage("Yêu cầu mua combo thất bại. Vui lòng thử lại.");
      }
    } catch (err: any) {
      // Kiểm tra lỗi trả về từ API
      const errorMsg = err?.response?.data?.message || "Yêu cầu mua combo thất bại. Vui lòng thử lại.";
      // Nếu lỗi thiếu thông tin tài khoản
      if (errorMsg.toLowerCase().includes("profile") || errorMsg.toLowerCase().includes("account") || errorMsg.toLowerCase().includes("cập nhật thông tin") || errorMsg.toLowerCase().includes("update your information")) {
        setMessage("Vui lòng cập nhật thông tin tài khoản để tiếp tục.");
        setTimeout(() => {
          router.push("/account");
        }, 1800);
        return;
      }
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
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái: Thông tin combo + danh sách basic packages */}
        <div className="lg:col-span-2">
          <button
            className="mb-6 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold shadow hover:bg-slate-100 transition"
            onClick={() => router.push('/packages')}
          >
            ← Back to Packages
          </button>
          <Card className="rounded-2xl shadow border border-slate-200 p-8 mb-8">
            <CardContent>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">{combo.name}</h1>
              <div className="text-slate-600 mb-2">{combo.description}</div>
              <div className="flex gap-4 mb-4">
                <div className="text-slate-700 font-semibold">Total Price: <span className="text-blue-700 font-bold">₫{combo.totalPrice?.toLocaleString()}</span></div>
                <div className="text-slate-700 font-semibold">Discount: <span className="text-green-700 font-bold">{combo.discountRate * 100}%</span></div>
              </div>
              <div className="mb-4">
                <div className="text-slate-700 font-semibold">Location: {combo.locationName}</div>
                <div className="text-slate-700 font-semibold">Level: {combo.packageLevelName}</div>
              </div>
              <div className="mb-4">
                <div className="text-slate-700 font-semibold">Durations:</div>
                <ul className="list-disc ml-6">
                  {(combo.packageDurations || []).map((d: any, idx: number) => (
                    <li key={idx} className="text-slate-600">DurationId: {d.durationId}, Discount: {d.discountRate}%</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Included Basic Packages</h2>
            {sortedBasics.filter(b => b.basicPlanType !== 'Living').map((basic, idx) => (
              <Card key={basic.id || idx} className="mb-4 border border-slate-200 rounded-xl shadow-sm">
                <CardContent className="p-4">
                  <div className="font-bold text-lg text-slate-800 mb-1">{basic.name}</div>
                  <div className="text-slate-600 mb-1">{basic.description}</div>
                  <div className="text-slate-500 text-sm mb-1">Code: {basic.code}</div>
                  <div className="text-slate-500 text-sm mb-1">Type: {basic.basicPlanType}</div>
                </CardContent>
              </Card>
            ))}
            {/* Basic living package UI giống BasicRoomPackageDetail */}
            {livingBasic && (
              <div className="bg-white/90 rounded-2xl shadow border border-slate-200 p-6 mb-8">
                {/* Thông tin package living */}
                <div className="mb-6">
                  <div className="font-bold text-lg text-slate-800 mb-1">{livingBasic.name}</div>
                  <div className="text-slate-600 mb-1">{livingBasic.description}</div>
                  <div className="text-slate-500 text-sm mb-1">Code: {livingBasic.code}</div>
                  <div className="text-slate-500 text-sm mb-1">Type: {livingBasic.basicPlanType}</div>
                  {livingBasic.planDurations && livingBasic.planDurations.length > 0 && (
                    <div className="text-slate-500 text-sm mb-1">Duration: {livingBasic.planDurations[0].planDurationValue} {livingBasic.planDurations[0].planDurationUnit}</div>
                  )}
                </div>
                {/* Room options UI */}
                <div>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Room options</h2>
                      <div className="text-slate-600">You'll be sharing this coliving with up to 6 other residents.</div>
                    </div>
                    <div className="mt-2 md:mt-0">
                      {(!livingSelectedDates || !livingSelectedDates.moveIn || !livingSelectedDates.moveOut) ? (
                        <Button
                          className="rounded-full px-8 py-3 text-base font-semibold bg-black text-white hover:bg-slate-800"
                          onClick={() => setShowDatePicker(prev => ({ ...prev, [livingBasicId]: true }))}
                        >
                          Check availability
                        </Button>
                      ) : (
                        <button
                          type="button"
                          className="flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-3 text-base font-semibold text-slate-700 shadow-sm min-w-[280px]"
                          onClick={() => setShowDatePicker(prev => ({ ...prev, [livingBasicId]: true }))}
                        >
                          {livingSelectedDates.moveIn?.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })} -&gt; {livingSelectedDates.moveOut?.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                        </button>
                      )}
                    </div>
                  </div>
                  <hr className="my-4" />
                  <div className="bg-slate-50 rounded-xl border border-slate-100 shadow-sm p-4">
                    <div className="grid grid-cols-1 gap-6">
                      {livingRooms.length === 0 && <div className="text-slate-500">Không có phòng nào khả dụng cho gói này.</div>}
                      {livingRooms.map((room: any, idx: number) => {
                        const isSelected = selectedRoom && selectedRoom.id === room.id;
                        const availability = livingRoomAvailability[room.id] || {};
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
                                <div className="mt-2 text-sm">
                                  {isAvailable && <span className="text-green-600 font-semibold">Available</span>}
                                  {availableFrom && <span className="text-orange-600 font-semibold">{status}</span>}
                                  {!isAvailable && !availableFrom && status && <span className="text-gray-500">{status}</span>}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 items-center">
                                <div className="text-xl font-bold text-blue-700 mb-2">₫{combo.totalPrice?.toLocaleString()}</div>
                                <Button
                                  className="rounded-full px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold shadow hover:shadow-lg transition"
                                  onClick={() => setSelectedRoom(room)}
                                  variant={isSelected ? 'default' : 'outline'}
                                  disabled={!isAvailable}
                                >
                                  {isSelected ? 'Đã chọn' : isAvailable ? 'Chọn phòng này' : 'Không thể chọn'}
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
            )}
          </div>
        </div>
        {/* Cột phải: Box thanh toán */}
        <div className="lg:col-span-1">
          {livingBasic && selectedRoom && livingSelectedDates && livingSelectedDates.moveIn && livingSelectedDates.moveOut && (
            <Card className="sticky top-24 rounded-2xl border-0 shadow-lg max-w-md mx-auto">
              <CardContent className="p-8 flex flex-col items-center">
                <div className="text-2xl font-bold text-slate-800 mb-1">{selectedRoom.roomName || selectedRoom.accomodationDescription || selectedRoom.roomType || selectedRoom.accomodationId}</div>
                <div className="text-slate-600 text-center mb-2">{selectedRoom.descriptionDetails || selectedRoom.accomodationDescription}</div>
                <div className="text-3xl font-bold text-blue-700 mb-1">₫{combo.totalPrice?.toLocaleString()}</div>
                <div className="text-slate-600 mb-4">per month</div>
                <div className="flex gap-2 w-full mb-4">
                  <button type="button" className={`flex items-center gap-2 px-6 py-2 rounded-full border border-slate-300 bg-white shadow min-w-[140px]`} disabled>
                    <span>{livingSelectedDates.moveIn ? livingSelectedDates.moveIn.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }) : 'Move in'}</span>
                  </button>
                  <button type="button" className={`flex items-center gap-2 px-6 py-2 rounded-full border border-slate-300 bg-white shadow min-w-[140px]`} disabled>
                    <span>{livingSelectedDates.moveOut ? livingSelectedDates.moveOut.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) : 'Move out'}</span>
                  </button>
                </div>
                <hr className="w-full my-4" />
                <div className="flex justify-between items-center w-full text-sm text-slate-600 mb-2">
                  <span>Monthly rent</span>
                  <span>₫{combo.totalPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center w-full font-semibold text-slate-800 pt-2 border-t border-slate-200 mb-4">
                  <span>Total</span>
                  <span>₫{combo.totalPrice?.toLocaleString()}</span>
                </div>
                <button
                  className="mt-2 w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handlePayNow}
                  disabled={isPaying || !selectedRoom}
                >
                  {isPaying ? "Processing..." : "Buy"}
                </button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      {/* DatePickerModal cho từng basic living */}
      {livingBasic && (
        <DatePickerModal
          key={livingBasic.id}
          open={!!showDatePicker[livingBasic.id]}
          onOpenChange={open => setShowDatePicker(prev => ({ ...prev, [livingBasic.id]: open }))}
          onDatesSelect={dates => handleDateRangeSelect(livingBasic.id, dates)}
        />
      )}
    </div>
  );
} 