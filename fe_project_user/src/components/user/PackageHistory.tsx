"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Package, MapPin, Clock, CheckCircle, CreditCard, XCircle, Download, QrCode, Layers, ChevronDown, Check } from "lucide-react"
import { PaymentModal } from "@/components/payment-modal"
import api from '@/utils/axiosConfig'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface PackageHistory {
  requestId: string;
  fullName: string;
  requestedPackageName: string;
  packageType: string;
  amount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentTime?: string;
  staffNote?: string;
  approvedAt?: string;
  messageToStaff?: string;
  createdAt: string;
  locationName: string;
  moveInDate?: string;
  expireAt?: string;
  startDate?: string;
  services?: any[]; // Added for combo packages
  packageId?: string; // Thêm dòng này để fix linter
}

export default function PackageList() {
  const [packageRequests, setPackageRequests] = useState<PackageHistory[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<PackageHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetail, setShowDetail] = useState(false)
  const [detailPackage, setDetailPackage] = useState<PackageHistory | null>(null)
  const [tab, setTab] = useState('all')
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailData, setDetailData] = useState<any>(null)
  const [expandedBasicPlans, setExpandedBasicPlans] = useState<{ [id: string]: boolean }>({})
  const [basicPlanDetails, setBasicPlanDetails] = useState<{ [id: string]: any }>({})
  const [loadingBasicDetail, setLoadingBasicDetail] = useState<{ [id: string]: boolean }>({})

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true)
      try {
        const res = await api.get('/api/user/memberships/history')
        setPackageRequests(res.data || [])
      } catch (err) {
        setPackageRequests([])
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  // Fetch detail when showDetail changes
  useEffect(() => {
    async function fetchDetail() {
      if (!showDetail || !detailPackage) return;
      setDetailLoading(true)
      setDetailData(null)
      try {
        if (detailPackage.packageType?.toLowerCase() === 'basic') {
          const res = await api.get(`/api/membership/BasicPlans/${detailPackage.packageId}`)
          setDetailData(res.data)
        } else if (detailPackage.packageType?.toLowerCase() === 'combo') {
          const res = await api.get(`/api/membership/ComboPlans/${detailPackage.packageId}`)
          const combo = res.data
          // Fetch all basic plans in combo
          if (combo.basicPlanIds && combo.basicPlanIds.length > 0) {
            const basicDetails = await Promise.all(
              combo.basicPlanIds.map((id: string) => api.get(`/api/membership/BasicPlans/${id}`).then(r => r.data))
            )
            combo.basicPlans = basicDetails
          }
          setDetailData(combo)
        }
      } catch (e) {
        setDetailData(null)
      } finally {
        setDetailLoading(false)
      }
    }
    fetchDetail()
  }, [showDetail, detailPackage])

  // Fetch accommodation or entitlement info for a basic plan (dùng cho cả basic lẻ)
  async function fetchBasicPlanDetail(basic: any) {
    if (!basic || !basic.id) return;
    setLoadingBasicDetail(prev => ({ ...prev, [basic.id]: true }))
    try {
      let detail: any = {}
      // Nếu có acom, fetch accom detail
      if (basic.acomodations && Array.isArray(basic.acomodations) && basic.acomodations.length > 0) {
        const accomDetails = await Promise.all(
          basic.acomodations.map(async (a: any) => {
            if (a.accomodationId) {
              const res = await api.get(`/api/membership/AccommodationOptions/${a.accomodationId}`)
              return res.data
            }
            return null
          })
        )
        detail.acomodations = accomDetails.filter(Boolean)
      }
      // Nếu là entitlement, fetch entitlement detail
      if (basic.basicPlanTypeCode === 'LIFEACTIVITIES' && basic.entitlements && Array.isArray(basic.entitlements) && basic.entitlements.length > 0) {
        const entDetails = await Promise.all(
          basic.entitlements.map(async (e: any) => {
            if (e.entitlementId) {
              const res = await api.get(`/api/membership/EntitlementRule/${e.entitlementId}`)
              return res.data
            }
            return null
          })
        )
        detail.entitlements = entDetails.filter(Boolean)
      }
      setBasicPlanDetails(prev => ({ ...prev, [basic.id]: detail }))
    } catch {
      setBasicPlanDetails(prev => ({ ...prev, [basic.id]: null }))
    } finally {
      setLoadingBasicDetail(prev => ({ ...prev, [basic.id]: false }))
    }
  }

  function handleToggleBasicCollapse(basic: any) {
    setExpandedBasicPlans(prev => {
      const next = { ...prev, [basic.id]: !prev[basic.id] }
      if (!prev[basic.id] && !basicPlanDetails[basic.id]) {
        fetchBasicPlanDetail(basic)
      }
      return next
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "paid":
      case "Completed":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "paid":
      case "Completed":
        return <CreditCard className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handlePayment = (packageRequest: PackageHistory) => {
    setSelectedPackage(packageRequest)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    setSelectedPackage(null)
    // Refetch history after payment
    setLoading(true)
    api.get('/user/memberships/history').then(res => {
      setPackageRequests(res.data || [])
      setLoading(false)
    })
  }

  const handleInitPayment = async (request: PackageHistory) => {
    try {
      const res = await api.post('/api/payments/create', {
        RequestId: request.requestId,
        PaymentMethod: 'VNPAY',
        ReturnUrl: '',
        IsDirectMembership: false
      });
      const redirectUrl = res.data?.Data?.redirectUrl;
      if (redirectUrl) {
        if (typeof window !== 'undefined') {
          window.location.href = redirectUrl;
        }
      } else {
        alert('Không lấy được link thanh toán!');
      }
    } catch (err) {
      alert('Khởi tạo thanh toán thất bại!');
    }
  }

  const handleShowDetail = (pkg: PackageHistory) => {
    setDetailPackage(pkg)
    setShowDetail(true)
  }

  const filterPackages = (list: PackageHistory[]) => {
    switch(tab) {
      case 'basic': return list.filter(p => p.packageType?.toLowerCase() === 'basic')
      case 'combo': return list.filter(p => p.packageType?.toLowerCase() === 'combo')
      case 'pending': return list.filter(p => p.status?.toLowerCase() === 'pending')
      case 'completed': return list.filter(p => p.status?.toLowerCase() === 'completed')
      default: return list
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="combo">Combo</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>
      {filterPackages(packageRequests).length === 0 ? (
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Packages</h3>
            <p className="text-slate-600 mb-6">You haven't purchased any packages yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filterPackages(packageRequests).map((request) => (
            <Card key={request.requestId} className={`rounded-2xl border-0 shadow-lg cursor-pointer transition hover:shadow-xl ${request.packageType?.toLowerCase() === 'combo' ? 'bg-purple-50' : 'bg-blue-50'}`} onClick={() => handleShowDetail(request)}>
              <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                <div className="flex items-center gap-3">
                  {request.packageType?.toLowerCase() === 'combo' ? <Layers className="h-8 w-8 text-purple-500" /> : <Package className="h-8 w-8 text-blue-500" />}
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      {request.requestedPackageName}
                      <Badge className={`text-xs px-3 py-1 ${request.packageType?.toLowerCase() === 'combo' ? 'bg-purple-500' : 'bg-blue-500'} text-white`}>{request.packageType?.toUpperCase()}</Badge>
                    </CardTitle>
                    <p className="text-slate-600 capitalize text-sm flex items-center gap-1"><MapPin className="h-4 w-4" />{request.locationName}</p>
                  </div>
                </div>
                <Badge className={
                  `${
                    request.packageType?.toLowerCase() === 'combo' && request.status?.toLowerCase() === 'pending'
                      ? 'bg-purple-500'
                      : getStatusColor(request.status)
                  } text-white text-xs px-3 py-1`}
                >
                  {getStatusIcon(request.status)}
                  <span className="ml-1 capitalize">{request.status}</span>
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <div>
                    <span className="block text-xs text-slate-500">Amount</span>
                    <span className="font-bold text-base">₫{request.amount?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Purchase Date</span>
                    <span className="font-bold text-base">{new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Start Date</span>
                    <span className="font-bold text-base">{request.startDate ? new Date(request.startDate).toLocaleDateString() : '-'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Expire At</span>
                    <span className="font-bold text-base">{request.expireAt ? new Date(request.expireAt).toLocaleDateString() : '-'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Payment Method</span>
                    <span className="font-bold text-base">{request.paymentMethod || '-'}</span>
                  </div>
                </div>
                {/* Nếu là combo, hiển thị dịch vụ/phòng đi kèm nếu có */}
                {request.packageType?.toLowerCase() === 'combo' && request.services && request.services.length > 0 && (
                  <div className="mt-2">
                    <span className="block text-xs text-purple-700 font-semibold mb-1">Included Services:</span>
                    <ul className="list-disc list-inside text-sm text-purple-900">
                      {request.services.map((s: any, idx: number) => <li key={idx}>{s.name}</li>)}
                    </ul>
                  </div>
                )}
                {/* Completed Package */}
                {request.status?.toLowerCase() === "completed" && (
                  <div className="space-y-2 mt-2">
                    <Alert className="bg-blue-50 border-blue-200">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>Payment completed. Welcome to Next Universe!</AlertDescription>
                    </Alert>
                    {request.paymentTime && (
                      <p className="text-xs text-blue-700 ml-1">Paid at: {new Date(request.paymentTime).toLocaleString()}</p>
                    )}
                  </div>
                )}
                {/* Pending Payment - cho cả basic và combo */}
                {request.status?.toLowerCase() === 'pendingpayment' && (
                  <div className="space-y-2 mt-2">
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <Clock className="h-4 w-4" />
                      <AlertDescription>Your package is pending payment. Please proceed to payment.</AlertDescription>
                    </Alert>
                    <Button
                      className="rounded-full bg-blue-600 hover:bg-blue-700"
                      onClick={e => { e.stopPropagation(); handleInitPayment(request); }}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                  </div>
                )}
                {/* Combo Pending (chỉ đổi màu, không có nút thanh toán) */}
                {request.packageType?.toLowerCase() === 'combo' && request.status?.toLowerCase() === 'pending' && (
                  <div className="space-y-2 mt-2">
                    <Alert className="bg-purple-50 border-purple-200">
                      <Clock className="h-4 w-4" />
                      <AlertDescription>Your combo package is pending approval.</AlertDescription>
                    </Alert>
                    <p className="text-xs text-purple-700 ml-1">Waiting for staff approval.</p>
                  </div>
                )}
                {/* Basic Pending (chỉ thông báo) */}
                {request.packageType?.toLowerCase() === 'basic' && request.status?.toLowerCase() === 'pending' && (
                  <div className="space-y-2 mt-2">
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <Clock className="h-4 w-4" />
                      <AlertDescription>Your basic package is pending approval.</AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-0">
                <Button variant="outline" onClick={e => { e.stopPropagation(); handleShowDetail(request); }}>View Details</Button>
                {/* Nếu cần thêm action khác, thêm ở đây */}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        packageData={selectedPackage}
        onPaymentSuccess={handlePaymentSuccess}
      />
      {/* Popup detail package */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Package Details</DialogTitle>
            <DialogDescription>
              {detailLoading && <div className="text-center py-8 text-slate-400">Loading...</div>}
              {!detailLoading && detailData && detailPackage && (
                <div className="space-y-4 mt-2">
                  {/* Header nổi bật: thông tin từ history */}
                  <div className="flex items-center gap-2 mb-2">
                    {detailPackage.packageType?.toLowerCase() === 'combo' ? <Layers className="h-6 w-6 text-purple-500" /> : <Package className="h-6 w-6 text-blue-500" />}
                    <span className="font-bold text-xl">{detailData.name || detailPackage.requestedPackageName}</span>
                    <Badge className={`text-xs px-2 py-1 ${detailPackage.packageType?.toLowerCase() === 'combo' ? 'bg-purple-500' : 'bg-blue-500'} text-white`}>{detailPackage.packageType?.toUpperCase()}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs bg-gray-100 rounded px-2 py-1">Status: <b>{detailPackage.status}</b></span>
                    <span className="text-xs bg-gray-100 rounded px-2 py-1">Amount: <b>₫{detailPackage.amount?.toLocaleString()}</b></span>
                    <span className="text-xs bg-gray-100 rounded px-2 py-1">Location: <b>{detailPackage.locationName}</b></span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <span className="text-xs">Purchase Date: <b>{new Date(detailPackage.createdAt).toLocaleDateString()}</b></span>
                    <span className="text-xs">Start Date: <b>{detailPackage.startDate ? new Date(detailPackage.startDate).toLocaleDateString() : '-'}</b></span>
                    <span className="text-xs">Expire At: <b>{detailPackage.expireAt ? new Date(detailPackage.expireAt).toLocaleDateString() : '-'}</b></span>
                    <span className="text-xs">Payment Method: <b>{detailPackage.paymentMethod || '-'}</b></span>
                    <span className="text-xs">Payment Time: <b>{detailPackage.paymentTime ? new Date(detailPackage.paymentTime).toLocaleString() : '-'}</b></span>
                  </div>
                  {/* Divider */}
                  <div className="border-t border-gray-200 my-2"></div>
                  {/* Chi tiết gói (từ api basic/comboplan) */}
                  <div className="space-y-2">
                    {/* Basic package detail */}
                    {detailPackage.packageType?.toLowerCase() === 'basic' && (
                      <>
                        {/* Collapse detail cho basic, fetch accom/entitlement detail giống combo */}
                        {(detailData.acomodations && Array.isArray(detailData.acomodations) && detailData.acomodations.length > 0) || (detailData.basicPlanTypeCode === 'LIFEACTIVITIES' && detailData.entitlements && Array.isArray(detailData.entitlements) && detailData.entitlements.length > 0) ? (
                          <div className="mt-2">
                            <span className="block text-xs text-blue-700 font-semibold mb-1">Details:</span>
                            <div className="space-y-2">
                              <div className="flex items-center mb-2">
                                <Check className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0" />
                                <span className="flex items-center cursor-pointer group text-blue-900 font-semibold" onClick={() => handleToggleBasicCollapse(detailData)}>
                                  {detailData.name}
                                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${expandedBasicPlans[detailData.id] ? 'rotate-180' : ''}`} />
                                </span>
                              </div>
                              {expandedBasicPlans[detailData.id] && (
                                <div className="ml-7 mt-1 text-xs text-slate-600 space-y-3">
                                  {loadingBasicDetail[detailData.id] && <div className="text-slate-400">Loading...</div>}
                                  {!loadingBasicDetail[detailData.id] && basicPlanDetails[detailData.id] && (
                                    <>
                                      {/* Hiển thị accom detail nếu có */}
                                      {basicPlanDetails[detailData.id].acomodations && basicPlanDetails[detailData.id].acomodations.length > 0 && basicPlanDetails[detailData.id].acomodations.map((a: any, idx: number) => (
                                        <div key={a.id || idx} className="mb-2">
                                          <div><span className="font-semibold">Room:</span> {a.roomTypeName || a.roomType}</div>
                                          <div><span className="font-semibold">Capacity:</span> {a.capacity}</div>
                                          <div><span className="font-semibold">Price/night:</span> {a.pricePerNight?.toLocaleString()}₫</div>
                                          <div><span className="font-semibold">Description:</span> {a.description}</div>
                                        </div>
                                      ))}
                                      {/* Hiển thị entitlement detail nếu có */}
                                      {basicPlanDetails[detailData.id].entitlements && basicPlanDetails[detailData.id].entitlements.length > 0 && basicPlanDetails[detailData.id].entitlements.map((e: any, idx: number) => (
                                        <div key={e.id || idx} className="mb-2">
                                          <div><span className="font-semibold">Service:</span> {e.nextUServiceName}</div>
                                          <div><span className="font-semibold">Price:</span> {e.price}</div>
                                          <div><span className="font-semibold">Credit Amount:</span> {e.creditAmount}</div>
                                          <div><span className="font-semibold">Period:</span> {e.period}</div>
                                          <div><span className="font-semibold">Note:</span> {e.note}</div>
                                        </div>
                                      ))}
                                      {/* Nếu không có gì */}
                                      {!basicPlanDetails[detailData.id].acomodations && !basicPlanDetails[detailData.id].entitlements && (
                                        <div className="italic text-slate-400">No detail info</div>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </>
                    )}
                    {/* Combo package detail */}
                    {detailPackage.packageType?.toLowerCase() === 'combo' && (
                      <>
                        {/* Included Basic Plans */}
                        {detailData.basicPlans && detailData.basicPlans.length > 0 && (
                          <div className="mt-2">
                            <span className="block text-xs text-purple-700 font-semibold mb-1">Included Basic Plans:</span>
                            <div className="space-y-2">
                              {detailData.basicPlans.map((b: any, idx: number) => (
                                <div key={b.id}>
                                  <div className="flex items-center mb-2">
                                    <Check className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0" />
                                    <span className="flex items-center cursor-pointer group text-purple-900 font-semibold" onClick={() => handleToggleBasicCollapse(b)}>
                                      {b.name}
                                      <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${expandedBasicPlans[b.id] ? 'rotate-180' : ''}`} />
                                    </span>
                                  </div>
                                  {expandedBasicPlans[b.id] && (
                                    <div className="ml-7 mt-1 text-xs text-slate-600 space-y-3">
                                      {loadingBasicDetail[b.id] && <div className="text-slate-400">Loading...</div>}
                                      {!loadingBasicDetail[b.id] && basicPlanDetails[b.id] && (
                                        <>
                                          {/* Hiển thị accom detail nếu có */}
                                          {basicPlanDetails[b.id].acomodations && basicPlanDetails[b.id].acomodations.length > 0 && basicPlanDetails[b.id].acomodations.map((a: any, idx: number) => (
                                            <div key={a.id || idx} className="mb-2">
                                              <div><span className="font-semibold">Room:</span> {a.roomTypeName || a.roomType}</div>
                                              <div><span className="font-semibold">Capacity:</span> {a.capacity}</div>
                                              <div><span className="font-semibold">Price/night:</span> {a.pricePerNight?.toLocaleString()}₫</div>
                                              <div><span className="font-semibold">Description:</span> {a.description}</div>
                                            </div>
                                          ))}
                                          {/* Hiển thị entitlement detail nếu có */}
                                          {basicPlanDetails[b.id].entitlements && basicPlanDetails[b.id].entitlements.length > 0 && basicPlanDetails[b.id].entitlements.map((e: any, idx: number) => (
                                            <div key={e.id || idx} className="mb-2">
                                              <div><span className="font-semibold">Service:</span> {e.nextUServiceName}</div>
                                              <div><span className="font-semibold">Price:</span> {e.price}</div>
                                              <div><span className="font-semibold">Credit Amount:</span> {e.creditAmount}</div>
                                              <div><span className="font-semibold">Period:</span> {e.period}</div>
                                              <div><span className="font-semibold">Note:</span> {e.note}</div>
                                            </div>
                                          ))}
                                          {/* Nếu không có gì */}
                                          {!basicPlanDetails[b.id].acomodations && !basicPlanDetails[b.id].entitlements && (
                                            <div className="italic text-slate-400">No detail info</div>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

