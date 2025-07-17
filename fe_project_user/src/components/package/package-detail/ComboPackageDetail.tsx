import { useEffect, useState } from "react";
import api from "@/utils/axiosConfig";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function BasicMiniDetail({ basic, onSelectRoom, selectedRoomId, rooms }: { basic: any, onSelectRoom?: (room: any) => void, selectedRoomId?: string, rooms?: any[] }) {
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
            <div className="flex flex-wrap gap-2">
              {rooms.map((room: any) => (
                <Button
                  key={room.id}
                  variant={selectedRoomId === room.id ? 'default' : 'outline'}
                  className={selectedRoomId === room.id ? 'ring-2 ring-blue-500' : ''}
                  onClick={() => onSelectRoom && onSelectRoom(room)}
                >
                  {room.roomName || room.accomodationDescription || room.roomType || room.id}
                </Button>
              ))}
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
        // Fetch rooms for each living basic
        const livingBasics = basics.filter(b => b && b.basicPlanType === 'Living' && Array.isArray(b.acomodations) && b.acomodations.length > 0);
        const roomsMap: { [basicId: string]: any[] } = {};
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
        }));
        setBasicRooms(roomsMap);
      } catch (err) {
        setCombo(null);
        setBasicDetails([]);
        setBasicRooms({});
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  // Tìm basic living có phòng
  const livingBasic = basicDetails.find(b => b.basicPlanType === 'Living' && basicRooms[b.id] && basicRooms[b.id].length > 0);

  const handleSelectRoom = (room: any, basic: any) => {
    setSelectedRoom(room);
    setSelectedBasic(basic);
  };

  const handlePayNow = async () => {
    if (!selectedRoom || !selectedBasic || !combo) return;
    setIsPaying(true);
    try {
      const res = await api.post("/api/user/memberships/requestMember", {
        packageId: combo.id,
        packageType: "combo",
        selectedStartDate: new Date().toISOString(),
        requireBooking: true,
        roomInstanceId: selectedRoom.id,
        messageToStaff: "",
        redirectUrl: window.location.origin + "/profile"
      });
      if (res.data && res.data.success && res.data.data && res.data.data.paymentUrl && res.data.data.paymentUrl.redirectUrl) {
        window.location.href = res.data.data.paymentUrl.redirectUrl;
      } else {
        window.location.href = "/profile";
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Yêu cầu mua combo thất bại. Vui lòng thử lại.");
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg">Đang tải dữ liệu...</div>;
  if (!combo) return <div className="min-h-screen flex items-center justify-center text-lg text-red-500">Không tìm thấy combo này.</div>;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#e8f9fc] via-[#f0fbfd] to-[#cce9fa]">
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
            {basicDetails.length === 0 && <div className="text-slate-500">No basic packages found.</div>}
            {basicDetails.map((basic, idx) => (
              <BasicMiniDetail
                key={basic.id || idx}
                basic={basic}
                onSelectRoom={basic.basicPlanType === 'Living' ? (room) => handleSelectRoom(room, basic) : undefined}
                selectedRoomId={selectedRoom && selectedBasic && selectedBasic.id === basic.id ? selectedRoom.id : undefined}
                rooms={basicRooms[basic.id]}
              />
            ))}
          </div>
        </div>
        {/* Cột phải: Box thanh toán */}
        <div className="lg:col-span-1">
          {livingBasic && selectedRoom && (
            <Card className="sticky top-24 rounded-2xl border-0 shadow-lg max-w-md mx-auto">
              <CardContent className="p-8 flex flex-col items-center">
                <div className="text-2xl font-bold text-slate-800 mb-1">{selectedRoom.roomName || selectedRoom.accomodationDescription || selectedRoom.roomType || selectedRoom.accomodationId}</div>
                <div className="text-slate-600 text-center mb-2">{selectedRoom.descriptionDetails || selectedRoom.accomodationDescription}</div>
                <div className="text-3xl font-bold text-blue-700 mb-1">₫{combo.totalPrice?.toLocaleString()}</div>
                <div className="text-slate-600 mb-4">per month</div>
                <div className="flex gap-2 w-full mb-4">
                  <div className="flex-1 flex flex-col items-center bg-slate-50 rounded-xl py-3 border border-slate-200">
                    <span className="text-slate-500 text-sm">Selected room</span>
                    <span className="font-semibold text-slate-700">{selectedRoom.roomName || selectedRoom.accomodationId}</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center bg-slate-50 rounded-xl py-3 border border-slate-200">
                    <span className="text-slate-500 text-sm">Combo</span>
                    <span className="font-semibold text-slate-700">{combo.name}</span>
                  </div>
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
    </div>
  );
} 