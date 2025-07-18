"use client";
import { useEffect, useState } from "react";
import api from "@/utils/axiosConfig";
import { useMemo } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, MapPin, Star, Clock, Zap, Shield, Award, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation";

interface PackageSectionProps {
  showHero?: boolean;
  showLocationFilter?: boolean;
  showTypeFilter?: boolean;
  maxPackages?: number;
  className?: string;
  isPreview?: boolean; // Add isPreview prop
}

export default function PackageSection({ 
  showHero = true, 
  showLocationFilter = true, 
  showTypeFilter = true,
  maxPackages,
  className = "",
  isPreview = true // Default to true
}: PackageSectionProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>("Hà Nội");
  const [comboPlans, setComboPlans] = useState<any[]>([]);
  const [basicPlans, setBasicPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showType, setShowType] = useState<'combo' | 'basic'>("basic");
  const [nextServiceNames, setNextServiceNames] = useState<{ [pkgId: string]: string[] }>({});
  const [loadingNext, setLoadingNext] = useState<{ [pkgId: string]: boolean }>({});
  const [requestingPackageId, setRequestingPackageId] = useState<string | null>(null);
  const router = useRouter();
  const [accommodationInfo, setAccommodationInfo] = useState<{ [accommodationId: string]: any }>({});
  const [loadingAccommodation, setLoadingAccommodation] = useState<{ [accommodationId: string]: boolean }>({});
  const [expandedAccommodations, setExpandedAccommodations] = useState<{ [key: string]: boolean }>({});

  const locations = ["Hà Nội", "Hải Phòng"];

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [combosRes, basicsRes] = await Promise.all([
          api.get("/api/membership/ComboPlans"),
          api.get("/api/membership/BasicPlans"),
        ]);
        let combos = combosRes.data || combosRes;
        let basics = basicsRes.data || basicsRes;

        // Lấy duration cho từng basic plan
        basics = await Promise.all(basics.map(async (b: any) => {
          try {
            const durationRes = await api.get(`/api/membership/BasicPlans/${b.id}/duration`);
            b.durations = durationRes.data || durationRes;
          } catch {
            b.durations = [];
          }
          return b;
        }));

        // Lấy duration cho từng combo plan
        combos = await Promise.all(combos.map(async (c: any) => {
          try {
            const durationRes = await api.get(`/api/membership/ComboPlans/${c.id}/duration`);
            c.durations = durationRes.data || durationRes;
          } catch {
            c.durations = [];
          }
          return c;
        }));

        setComboPlans(combos);
        setBasicPlans(basics);
      } catch (err) {
        setComboPlans([]);
        setBasicPlans([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter packages by selected location
  const filteredCombos = Array.isArray(comboPlans) ? comboPlans.filter((c) => c.locationName === selectedLocation) : [];
  const filteredBasic = Array.isArray(basicPlans) ? basicPlans.filter((b) => b.locationName === selectedLocation) : [];

  // Get nextService names for each package
  async function fetchNextServiceNames(ids: string[], pkgId: string) {
    if (!ids || ids.length === 0) return;
    setLoadingNext((prev) => ({ ...prev, [pkgId]: true }));
    try {
      const names: string[] = [];
      for (const id of ids) {
        const res = await api.get(`/api/membership/NextUServices/${id}`);
        const data = res.data || res;
        if (data && data.name) names.push(data.name);
      }
      setNextServiceNames((prev) => ({ ...prev, [pkgId]: names }));
    } catch (err) {
      console.log('NextUserService fetch error', err);
      setNextServiceNames((prev) => ({ ...prev, [pkgId]: [] }));
    } finally {
      setLoadingNext((prev) => ({ ...prev, [pkgId]: false }));
    }
  }

  useEffect(() => {
    const list = showType === 'basic' ? filteredBasic : filteredCombos;
    list.forEach(pkg => {
      console.log('DEBUG package:', pkg);
      const ids = pkg.serviceIds || pkg.nextUServiceIds || pkg.nextUserServiceIds || pkg.nextServiceIds || [];
      if (ids.length > 0 && !nextServiceNames[pkg.id]) {
        fetchNextServiceNames(ids, pkg.id);
      }
    });
    // eslint-disable-next-line
  }, [showType, filteredBasic, filteredCombos]);

  async function handleRequestPackage(packageIdToRequest: string, cardId: string, type: 'basic' | 'combo') {
    if (!packageIdToRequest) {
      alert('Không tìm thấy ID gói để yêu cầu.');
      return;
    }
    setRequestingPackageId(cardId);
    try {
      if (type === 'basic') {
        // Chuyển sang trang detail gói basic
        router.push(`/packages/basic/${packageIdToRequest}`);
        return;
      }
      const body: any = {
        packageId: packageIdToRequest,
        packageType: 'Combo',
        messageToStaff: 'Yêu cầu đăng ký gói này.'
      };
      body.redirectUrl = (typeof window !== 'undefined' ? window.location.origin : '') + '/combo-payment-success';
      const response = await api.post('/api/user/memberships/requestMember', body);
      const resData = response.data;
      if (resData.success) {
        alert(resData.message || 'Yêu cầu của bạn đã được gửi. Vui lòng chờ đội ngũ xét duyệt.');
      } else {
        alert(resData.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
      }
    } catch (error: any) {
      console.error('Request package error:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      alert(errorMessage);
    } finally {
      setRequestingPackageId(null);
    }
  }

  // Fetch accommodation info for basic packages
  async function fetchAccommodationInfo(accommodationId: string) {
    if (!accommodationId) return;
    setLoadingAccommodation((prev) => ({ ...prev, [accommodationId]: true }));
    try {
      const res = await api.get(`/api/membership/AccommodationOptions/${accommodationId}`);
      setAccommodationInfo((prev) => ({ ...prev, [accommodationId]: res.data || res }));
    } catch (err) {
      setAccommodationInfo((prev) => ({ ...prev, [accommodationId]: null }));
    } finally {
      setLoadingAccommodation((prev) => ({ ...prev, [accommodationId]: false }));
    }
  }

  // Limit packages if maxPackages is specified, or if isPreview is true, limit to 3
  const limitedCombos = isPreview ? filteredCombos.slice(0, 3) : (maxPackages ? filteredCombos.slice(0, maxPackages) : filteredCombos);
  const limitedBasic = isPreview ? filteredBasic.slice(0, 3) : (maxPackages ? filteredBasic.slice(0, maxPackages) : filteredBasic);

  // Auto-fetch accommodation info for all basic packages
  useEffect(() => {
    console.log("limitedBasic", limitedBasic);
    limitedBasic.forEach(pkg => {
      console.log("pkg.acomodations", pkg.acomodations);
      if (pkg.acomodations && Array.isArray(pkg.acomodations)) {
        pkg.acomodations.forEach((a: any) => {
          const accommodationId = a.accomodationId;
          console.log("accommodationId to fetch:", accommodationId, "already in state?", !!accommodationInfo[accommodationId]);
          if (accommodationId && !accommodationInfo[accommodationId]) {
            fetchAccommodationInfo(accommodationId);
          }
        });
      }
      // Auto-fetch entitlement detail for LIFEACTIVITIES
      if (pkg.basicPlanTypeCode === 'LIFEACTIVITIES' && pkg.entitlements && Array.isArray(pkg.entitlements)) {
        pkg.entitlements.forEach((e: any) => {
          const entitlementId = e.entitlementId;
          if (entitlementId && !accommodationInfo[entitlementId] && !loadingAccommodation[entitlementId]) {
            setLoadingAccommodation(prev => ({ ...prev, [entitlementId]: true }));
            api.get(`/api/membership/EntitlementRule/${entitlementId}`)
              .then(res => setAccommodationInfo(prev => ({ ...prev, [entitlementId]: res.data || res })))
              .catch(() => setAccommodationInfo(prev => ({ ...prev, [entitlementId]: null })))
              .finally(() => setLoadingAccommodation(prev => ({ ...prev, [entitlementId]: false })));
          }
        });
      }
    });
    // eslint-disable-next-line
  }, [limitedBasic]);

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-[#e8f9fc] via-[#f0fbfd] to-[#cce9fa] ${className}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#28c4dd] mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Loading packages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#e8f9fc] via-[#f0fbfd] to-[#cce9fa] ${className}`}>
      {/* Hero Section - Only show if showHero is true */}
      {showHero && (
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#e8f9fc] via-[#f0fbfd] to-[#cce9fa]" />
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] bg-cover bg-center opacity-5" />
          
          <div className="relative max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <Badge className="mb-4 bg-white/20 text-slate-700 border-white/30 backdrop-blur-sm">
                🌟 Mindful Co-living Experience
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-8 leading-tight">
              Find Your{" "}
              <span className="text-7xl font-black bg-gradient-to-r from-[#28c4dd] via-[#5661b3] to-[#0c1f47] bg-clip-text text-transparent tracking-tight">
                Perfect Package
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Discover mindful co-living spaces that nurture your <strong className="text-[#28c4dd]">body</strong>, <strong className="text-[#5661b3]">mind</strong>, and <strong className="text-[#0c1f47]">creativity</strong>. 
              Join a community of like-minded individuals in beautiful locations across Vietnam.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-800">
                  50+
                </div>
                <div className="text-slate-600">Available Packages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-800">
                  2
                </div>
                <div className="text-slate-600">Cities Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-800">
                  4.8★
                </div>
                <div className="text-slate-600">Customer Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-800">
                  98%
                </div>
                <div className="text-slate-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Compact Selection Controls Section */}
      {(showLocationFilter || showTypeFilter) && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            {/* Compact Combined Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              
              {/* Location Selection - Compact */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="h-5 w-5 text-[#28c4dd]" />
                  <span className="font-semibold">Location:</span>
                </div>
                <div className="flex gap-2">
                  {locations.map((location) => (
                    <Button
                      key={location}
                      variant={selectedLocation === location ? 'default' : 'outline'}
                      size="sm"
                      className={`rounded-full px-6 py-2 font-medium text-sm transition-all duration-300 ${
                        selectedLocation === location 
                          ? 'bg-gradient-to-r from-[#28c4dd] to-[#5661b3] text-white shadow-md' 
                          : 'text-slate-600 hover:text-slate-800 border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedLocation(location)}
                    >
                      {location}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Package Type Selection - Compact */}
              {showTypeFilter && (
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-700">Package Type:</span>
                  <div className="flex gap-1 bg-slate-100 rounded-full p-1">
                    <Button
                      variant={showType === 'basic' ? 'default' : 'ghost'}
                      size="sm"
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                        showType === 'basic' 
                          ? 'bg-slate-800 text-white shadow-sm' 
                          : 'text-slate-600 hover:bg-white hover:text-slate-800'
                      }`}
                      onClick={() => setShowType('basic')}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Basic
                    </Button>
                    <Button
                      variant={showType === 'combo' ? 'default' : 'ghost'}
                      size="sm"
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                        showType === 'combo' 
                          ? 'bg-slate-800 text-white shadow-sm' 
                          : 'text-slate-600 hover:bg-white hover:text-slate-800'
                      }`}
                      onClick={() => setShowType('combo')}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Combo
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Regional Availability Info */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
                <MapPin className="h-4 w-4" />
                <span>
                  Showing packages available in <strong>{selectedLocation}</strong>
                  {selectedLocation === "Hải Phòng" && " (Coming Soon)"}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Packages Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Empty State for Hai Phong */}
          {selectedLocation === "Hải Phòng" && (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl">
                <MapPin className="h-20 w-20 text-[#28c4dd] mx-auto mb-6" />
                <h3 className="text-3xl font-bold text-slate-800 mb-4">Coming Soon to Hai Phong</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  We're excited to bring our mindful co-living experience to Hai Phong. 
                  Currently, our packages are only available in Hanoi.
                </p>
                <Button 
                  className="rounded-full px-8 py-3 bg-gradient-to-r from-[#28c4dd] to-[#5661b3] text-white hover:shadow-lg transition-all duration-300" 
                  onClick={() => setSelectedLocation("Hà Nội")}
                >
                  Explore Hanoi Packages
                </Button>
              </div>
            </div>
          )}

          {/* Packages Grid - Only show for Hanoi */}
          {selectedLocation === "Hà Nội" && (
          <>
            {showType === 'basic' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-center">
                {limitedBasic.length === 0 && (
                  <div className="w-full text-center py-12">
                    <div className="text-slate-500 text-lg">No basic packages available for {selectedLocation}.</div>
                  </div>
                )}
                {limitedBasic.map((pkg, idx) => (
                  <Card key={pkg.id} className={`w-full max-w-sm relative overflow-hidden rounded-3xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                    idx === 0 ? 'ring-2 ring-blue-500 scale-105' : ''
                  }`}>
                    {/* Popular Badge */}
                    {idx === 0 && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-2 rounded-bl-2xl">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1" />
                          <span className="font-bold text-sm">Most Popular</span>
                        </div>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4 bg-gradient-to-br from-slate-50 to-white">
                      <CardTitle className="text-2xl font-bold text-slate-800 mb-2">{pkg.name}</CardTitle>
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-4xl font-bold text-slate-800">{pkg.price?.toLocaleString()}</span>
                        <span className="text-2xl text-slate-600 ml-1">$</span>
                      </div>
                      <div className="text-slate-600 font-medium">Basic package</div>
                      <p className="text-slate-600 mt-3 text-sm leading-relaxed">{pkg.description}</p>
                      {/* Thông tin bổ sung */}
                      <div className="mt-2 text-xs text-slate-500 space-y-1 text-left">
                        {pkg.locationName && <div><span className="font-semibold">Location:</span> {pkg.locationName}</div>}
                        {pkg.basicPlanTypeCode && <div><span className="font-semibold">Type:</span> {pkg.basicPlanTypeCode}</div>}
                       
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6 p-6">
                      {/* Package Details */}
                      <div className="bg-slate-50 rounded-2xl p-4">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                          <Award className="h-4 w-4 mr-2 text-blue-600" />
                          Package Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Code:</span>
                            <span className="font-semibold text-slate-800">{pkg.code}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Duration:</span>
                            <span className="font-semibold text-slate-800">
                              {(() => {
                                if (Array.isArray(pkg.durations) && pkg.durations.length > 0) {
                                  return pkg.durations.map((d: any) =>
                                    d.value && d.unit ? `${d.value} ${d.unit}` : d.durationName || ''
                                  ).join(', ');
                                }
                                if (pkg.durations && typeof pkg.durations === 'object' && pkg.durations.value && pkg.durations.unit) {
                                  return `${pkg.durations.value} ${pkg.durations.unit}`;
                                }
                                return 'N/A';
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Services */}
                      <div>
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                          <Zap className="h-4 w-4 mr-2 text-blue-600" />
                          Included Services
                        </h4>
                        {pkg.acomodations && pkg.acomodations.length > 0 ? (
                          <div className="space-y-2">
                            {pkg.acomodations.map((a: any, i: number) => {
                              const accommodationId = a.accomodationId;
                              const info = accommodationInfo[accommodationId];
                              const loading = loadingAccommodation[accommodationId];
                              const expanded = expandedAccommodations[accommodationId];
                              const hasDetail = info && (info.capacity !== undefined || info.pricePerNight !== undefined || info.description);
                              return (
                                <div key={accommodationId || i} className="flex flex-col">
                                  <div className="flex items-center text-sm group">
                                    {loading ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                        <span className="text-slate-500">Loading...</span>
                                      </>
                                    ) : info ? (
                                      <>
                                        <Check className="h-4 w-4 text-teal-500 mr-2 flex-shrink-0" />
                                        <span className="text-slate-700 font-semibold">{info.roomTypeName || a.roomType || "Room"}</span>
                                        {hasDetail && (
                                          <span
                                            className={`ml-2 cursor-pointer transition-transform ${expanded ? 'rotate-180' : ''}`}
                                            onClick={() => setExpandedAccommodations(prev => ({ ...prev, [accommodationId]: !prev[accommodationId] }))}
                                          >▼</span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-slate-500 italic">No info</span>
                                    )}
                                  </div>
                                  {expanded && info && (
                                    <div className="ml-6 mt-1 text-xs text-slate-600 space-y-1">
                                      {typeof info.capacity !== 'undefined' && (
                                        <div>
                                          <span className="font-semibold">Capacity:</span> {info.capacity}
                                        </div>
                                      )}
                                      {typeof info.pricePerNight !== 'undefined' && (
                                        <div>
                                          <span className="font-semibold">Price/night:</span> {info.pricePerNight.toLocaleString()}₫
                                        </div>
                                      )}
                                      {info.description && (
                                        <div>
                                          <span className="font-semibold">Description:</span> {info.description}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : pkg.basicPlanTypeCode === 'LIFEACTIVITIES' && pkg.entitlements && pkg.entitlements.length > 0 ? (
                          <div className="space-y-2">
                            {pkg.entitlements.map((e: any, i: number) => {
                              const entitlementId = e.entitlementId;
                              const info = accommodationInfo[entitlementId];
                              const loading = loadingAccommodation[entitlementId];
                              const expanded = expandedAccommodations[entitlementId];
                              return (
                                <div key={entitlementId || i} className="flex flex-col">
                                  <div className="flex items-center text-sm group cursor-pointer" onClick={() => {
                                    setExpandedAccommodations(prev => ({ ...prev, [entitlementId]: !prev[entitlementId] }));
                                    if (!info && !loading) {
                                      setLoadingAccommodation(prev => ({ ...prev, [entitlementId]: true }));
                                      api.get(`/api/membership/EntitlementRule/${entitlementId}`)
                                        .then(res => setAccommodationInfo(prev => ({ ...prev, [entitlementId]: res.data || res })))
                                        .catch(() => setAccommodationInfo(prev => ({ ...prev, [entitlementId]: null })))
                                        .finally(() => setLoadingAccommodation(prev => ({ ...prev, [entitlementId]: false })));
                                    }
                                  }}>
                                    <Check className="h-4 w-4 text-teal-500 mr-2 flex-shrink-0" />
                                    <span className="text-slate-700 font-semibold">
                                      {(info && info.nextUServiceName) ? info.nextUServiceName : e.nextUServiceName}
                                    </span>
                                    <span className={`ml-2 transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
                                  </div>
                                  {expanded && (
                                    loading ? (
                                      <div className="ml-6 mt-1 text-xs text-slate-500">Loading...</div>
                                    ) : info && (
                                      <div className="ml-6 mt-1 text-xs text-slate-600 space-y-1">
                                        {typeof info.price !== 'undefined' && (
                                          <div>
                                            <span className="font-semibold">Price:</span> {info.price}
                                          </div>
                                        )}
                                        {typeof info.creditAmount !== 'undefined' && (
                                          <div>
                                            <span className="font-semibold">Credit Amount:</span> {info.creditAmount}
                                          </div>
                                        )}
                                        {typeof info.period !== 'undefined' && (
                                          <div>
                                            <span className="font-semibold">Period:</span> {info.period}
                                          </div>
                                        )}
                                        {info.note && (
                                          <div>
                                            <span className="font-semibold">Note:</span> {info.note}
                                          </div>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-slate-500 text-sm italic">No included services</div>
                        )}
                      </div>

                      {/* CTA Button */}
                      <Button
                        className="w-full rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white font-semibold py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => handleRequestPackage(pkg.id, pkg.id, 'basic')}
                        disabled={requestingPackageId === pkg.id}
                      >
                        {requestingPackageId === pkg.id ? 'Requesting...' : 'Detail package'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {/* View all button for preview mode */}
                {isPreview && (
                  <div className="col-span-full flex justify-center mt-8">
                    <Link href="/packages/all">
                      <Button className="rounded-full px-8 py-3 bg-gradient-to-r from-[#28c4dd] to-[#5661b3] text-white hover:shadow-lg transition-all duration-300">
                        View all packages
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {showType === 'combo' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-center">
                {limitedCombos.length === 0 && (
                  <div className="w-full text-center py-12">
                    <div className="text-slate-500 text-lg">No combo packages available for {selectedLocation}.</div>
                  </div>
                )}
                {limitedCombos.map((pkg, idx) => (
                  <Card key={pkg.id} className={`w-full max-w-md relative overflow-hidden rounded-3xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                    idx === 0 ? 'ring-2 ring-teal-500 scale-105' : ''
                  }`}>
                    {/* Popular Badge */}
                    {idx === 0 && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-4 py-2 rounded-bl-2xl">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1" />
                          <span className="font-bold text-sm">Most Popular</span>
                        </div>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4 bg-gradient-to-br from-teal-50 to-blue-50">
                      <CardTitle className="text-2xl font-bold text-slate-800 mb-2">{pkg.name}</CardTitle>
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-4xl font-bold text-slate-800">{pkg.totalPrice?.toLocaleString()}</span>
                        <span className="text-2xl text-slate-600 ml-1">₫</span>
                      </div>
                      <div className="text-slate-600 font-medium">Combo package</div>
                      <p className="text-slate-600 mt-3 text-sm leading-relaxed">{pkg.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                      {/* Combo Details */}
                      <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-4">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                          <Award className="h-4 w-4 mr-2 text-teal-600" />
                          Combo Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Discount:</span>
                            <span className="font-bold text-teal-600 bg-teal-100 px-2 py-1 rounded-full">
                              {pkg.discountRate * 100}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Location:</span>
                            <span className="font-semibold text-slate-800">{pkg.locationName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Level:</span>
                            <span className="font-semibold text-slate-800">{pkg.packageLevelName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Basic Packages:</span>
                            <span className="font-semibold text-slate-800">{Array.isArray(pkg.basicPlanIds) ? pkg.basicPlanIds.length : 0}</span>
                          </div>
                        </div>
                      </div>
                      {/* CTA Button */}
                      <Button
                        className="w-full rounded-2xl bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-semibold py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => router.push(`/packages/combo/${pkg.id}`)}
                      >
                        Detail combo
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {/* View all button for preview mode */}
                {isPreview && (
                  <div className="col-span-full flex justify-center mt-8">
                    <Link href="/packages/all">
                      <Button className="rounded-full px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white hover:shadow-lg transition-all duration-300">
                        View all packages
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        </div>
      </section>
    </div>
  )
} 