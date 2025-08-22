"use client";
import { useEffect, useState } from "react";
import api from "@/utils/axiosConfig";
import { useMemo } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, MapPin, Star, Clock, Zap, Shield, Award, Sparkles, Building2, MapPinIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";

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
  // --- FILTER STATE ---
  const [cities, setCities] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedProperty, setSelectedProperty] = useState<string>("");

  // --- LOAD CITIES ON MOUNT ---
  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await api.get("/api/user/cities");
        const data = res.data || res;
        setCities(data);
        // Auto-select first city
        if (data && data.length > 0) {
          setSelectedCity(data[0].id);
        }
      } catch {
        setCities([]);
      }
    }
    fetchCities();
  }, []);

  // --- LOAD LOCATIONS WHEN CITY CHANGES ---
  useEffect(() => {
    if (!selectedCity) {
      setLocations([]);
      setSelectedLocation("");
      return;
    }
    async function fetchLocations() {
      try {
        const res = await api.get(`/api/user/locations/by-city/${selectedCity}`);
        const data = res.data || res;
        setLocations(data);
        // Auto-select first location
        if (data && data.length > 0) {
          setSelectedLocation(data[0].id);
        }
      } catch {
        setLocations([]);
        setSelectedLocation("");
      }
    }
    fetchLocations();
    setProperties([]);
    setSelectedProperty("");
  }, [selectedCity]);

  // --- LOAD PROPERTIES WHEN LOCATION CHANGES ---
  useEffect(() => {
    if (!selectedLocation) {
      setProperties([]);
      setSelectedProperty("");
      return;
    }
    async function fetchProperties() {
      try {
        const res = await api.get(`/api/user/locations/propertyby-location/${selectedLocation}`);
        const data = res.data || res;
        setProperties(data);
        // Auto-select first property
        if (data && data.length > 0) {
          setSelectedProperty(data[0].id);
        }
      } catch {
        setProperties([]);
        setSelectedProperty("");
      }
    }
    fetchProperties();
  }, [selectedLocation]);

  // --- UI FILTERS ---
  const [comboPlans, setComboPlans] = useState<any[]>([]);
  const [basicPlans, setBasicPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showType, setShowType] = useState<'combo' | 'basic'>(() => {
    // Check URL params first, then localStorage, then default to "basic"
    if (typeof window !== 'undefined') {
      const urlType = new URLSearchParams(window.location.search).get('type');
      if (urlType === 'combo' || urlType === 'basic') {
        return urlType as 'combo' | 'basic';
      }
      
      const savedType = localStorage.getItem('packageType');
      if (savedType === 'combo' || savedType === 'basic') {
        return savedType as 'combo' | 'basic';
      }
    }
    return "basic";
  });
  

  const [nextServiceNames, setNextServiceNames] = useState<{ [pkgId: string]: string[] }>({});
  const [loadingNext, setLoadingNext] = useState<{ [pkgId: string]: boolean }>({});
  const [requestingPackageId, setRequestingPackageId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accommodationInfo, setAccommodationInfo] = useState<{ [accommodationId: string]: any }>({});
  const [loadingAccommodation, setLoadingAccommodation] = useState<{ [accommodationId: string]: boolean }>({});
  const [expandedAccommodations, setExpandedAccommodations] = useState<{ [key: string]: boolean }>({});
  const [basicPlanDetails, setBasicPlanDetails] = useState<{ [planId: string]: any }>({});
  const [loadingBasicPlans, setLoadingBasicPlans] = useState<{ [planId: string]: boolean }>({});
  const [durationDetails, setDurationDetails] = useState<{ [durationId: string]: any }>({});
  const [loadingDurations, setLoadingDurations] = useState<{ [durationId: string]: boolean }>({});
  const [fetchedBasicPlans, setFetchedBasicPlans] = useState<Set<string>>(new Set());
  const [fetchedDurations, setFetchedDurations] = useState<Set<string>>(new Set());
  
  // --- FILTER BASIC PLANS BY PROPERTY ---
  const filteredBasic = useMemo(() => {
    if (!selectedProperty) return [];
    return Array.isArray(basicPlans)
      ? basicPlans.filter((b) => b.propertyId === selectedProperty)
      : [];
  }, [basicPlans, selectedProperty]);

  // --- FILTER COMBO PLANS BY PROPERTY ---
  const filteredCombo = useMemo(() => {
    if (!selectedProperty) {
      return [];
    }
    
    if (!Array.isArray(comboPlans)) {
      return [];
    }
    
    const filtered = comboPlans.filter((c) => {
      // Check if combo plan has propertyId that matches selectedProperty
      return c.propertyId === selectedProperty;
    });
    
    return filtered;
  }, [comboPlans, selectedProperty]);

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
    const list = showType === 'basic' ? filteredBasic : filteredCombo;
    list.forEach(pkg => {
      const ids = pkg.serviceIds || pkg.nextUServiceIds || pkg.nextUserServiceIds || pkg.nextServiceIds || [];
      if (ids.length > 0 && !nextServiceNames[pkg.id]) {
        fetchNextServiceNames(ids, pkg.id);
      }
    });
    // eslint-disable-next-line
  }, [showType, filteredBasic, filteredCombo]);

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
      if (type === 'combo') {
        // Chuyển sang trang detail gói combo
        router.push(`/packages/combo/${packageIdToRequest}`);
        return;
      }
    } catch (error: any) {
      console.error('Navigation error:', error);
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

  // Fetch basic plan details for combo packages
  async function fetchBasicPlanDetails(planId: string) {
    if (!planId || fetchedBasicPlans.has(planId)) return;
    
    setFetchedBasicPlans(prev => new Set(Array.from(prev).concat([planId])));
    setLoadingBasicPlans((prev) => ({ ...prev, [planId]: true }));
    
    try {
      const res = await api.get(`/api/membership/BasicPlans/${planId}`);
      setBasicPlanDetails((prev) => ({ ...prev, [planId]: res.data || res }));
    } catch (err) {
      setBasicPlanDetails((prev) => ({ ...prev, [planId]: null }));
    } finally {
      setLoadingBasicPlans((prev) => ({ ...prev, [planId]: false }));
    }
  }

  // Fetch duration details for combo packages
  async function fetchDurationDetails(durationId: string) {
    if (!durationId || fetchedDurations.has(durationId)) return;
    
    setFetchedDurations(prev => new Set(Array.from(prev).concat([durationId])));
    setLoadingDurations((prev) => ({ ...prev, [durationId]: true }));
    
    try {
      // Use the correct API endpoint for PackageDuration
      const res = await api.get(`/api/membership/PackageDuration/${durationId}`);
      setDurationDetails((prev) => ({ ...prev, [durationId]: res.data || res }));
    } catch (err) {
      console.log('Duration fetch error for ID:', durationId, err);
      setDurationDetails((prev) => ({ ...prev, [durationId]: null }));
    } finally {
      setLoadingDurations((prev) => ({ ...prev, [durationId]: false }));
    }
  }

  // Limit packages if maxPackages is specified, or if isPreview is true, limit to 3
  const limitedCombos = isPreview ? filteredCombo.slice(0, 3) : (maxPackages ? filteredCombo.slice(0, maxPackages) : filteredCombo);
  const limitedBasic = isPreview ? filteredBasic.slice(0, 3) : (maxPackages ? filteredBasic.slice(0, maxPackages) : filteredBasic);
  
  console.log('DEBUG Combo packages filtering:', {
    totalComboPlans: comboPlans?.length || 0,
    selectedProperty,
    filteredCombo: filteredCombo?.length || 0,
    limitedCombos: limitedCombos?.length || 0,
    comboPlansSample: comboPlans?.[0] || null
  });
  


  // Auto-fetch accommodation info for all basic packages
  useEffect(() => {
    limitedBasic.forEach(pkg => {
      if (pkg.acomodations && Array.isArray(pkg.acomodations)) {
        pkg.acomodations.forEach((a: any) => {
          const accommodationId = a.accomodationId;
          if (accommodationId && !accommodationInfo[accommodationId]) {
            fetchAccommodationInfo(accommodationId);
          }
        });
      }
      // Auto-fetch entitlement detail for serviceType = 1 (Non-booking services)
      if (pkg.serviceType === 1 && pkg.entitlements && Array.isArray(pkg.entitlements)) {
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

  // Auto-fetch basic plan details for combo packages
  useEffect(() => {
    const fetchData = async () => {
      const planIdsToFetch: string[] = [];
      const durationIdsToFetch: string[] = [];

      limitedCombos.forEach(pkg => {
        // Collect basic plan IDs that need fetching
        if (pkg.basicPlanIds && Array.isArray(pkg.basicPlanIds)) {
          pkg.basicPlanIds.forEach((planId: string) => {
            if (planId && !fetchedBasicPlans.has(planId) && !loadingBasicPlans[planId] && !planIdsToFetch.includes(planId)) {
              planIdsToFetch.push(planId);
            }
          });
        }
        
        // Collect duration IDs that need fetching
        if (pkg.packageDurations && Array.isArray(pkg.packageDurations)) {
          pkg.packageDurations.forEach((duration: any) => {
            const durationId = duration.durationId;
            if (durationId && !fetchedDurations.has(durationId) && !loadingDurations[durationId] && !durationIdsToFetch.includes(durationId)) {
              durationIdsToFetch.push(durationId);
            }
          });
        }
      });

      // Fetch basic plans
      planIdsToFetch.forEach(planId => {
        fetchBasicPlanDetails(planId);
      });

      // Fetch durations
      durationIdsToFetch.forEach(durationId => {
        fetchDurationDetails(durationId);
      });
    };

    if (limitedCombos.length > 0) {
      fetchData();
    }
  }, [limitedCombos.length, limitedCombos.map(p => p.id).join(',')]);  // Only re-run when combo list actually changes

  // Function to update showType and persist it
  const updateShowType = (newType: 'combo' | 'basic') => {
    setShowType(newType);
    
    // Update URL without page refresh
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('type', newType);
      window.history.replaceState({}, '', url.toString());
      
      // Also save to localStorage as backup
      localStorage.setItem('packageType', newType);
    }
  };

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


      {/* Compact Filter Section */}
      {(showLocationFilter || showTypeFilter) && (
        <section className="py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/50">
              
              {/* Location Filters - Left Side */}
              {showLocationFilter && (
                <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
                  {/* City Select */}
                  <div className="relative">
                    <select
                      className="appearance-none bg-white rounded-lg px-4 py-2.5 pr-8 border border-slate-200 focus:ring-2 focus:ring-[#28c4dd]/20 focus:border-[#28c4dd] focus:outline-none text-slate-700 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                      value={selectedCity}
                      onChange={e => {
                        setSelectedCity(e.target.value);
                        setSelectedLocation("");
                        setSelectedProperty("");
                      }}
                      disabled={cities.length === 0}
                    >
                      <option value="">Hà Nội</option>
                      {cities.map(city => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                    <MapPinIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="text-slate-300 hidden sm:block">→</div>

                  {/* Location Select */}
                  <div className="relative">
                    <select
                      className="appearance-none bg-white rounded-lg px-4 py-2.5 pr-8 border border-slate-200 focus:ring-2 focus:ring-[#28c4dd]/20 focus:border-[#28c4dd] focus:outline-none text-slate-700 text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                      value={selectedLocation}
                      onChange={e => {
                        setSelectedLocation(e.target.value);
                        setSelectedProperty("");
                      }}
                      disabled={!selectedCity || locations.length === 0}
                    >
                      <option value="">Hoàng Cầu</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                    <MapPin className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="text-slate-300 hidden sm:block">→</div>

                  {/* Property Select */}
                  <div className="relative">
                    <select
                      className="appearance-none bg-white rounded-lg px-4 py-2.5 pr-8 border border-slate-200 focus:ring-2 focus:ring-[#28c4dd]/20 focus:border-[#28c4dd] focus:outline-none text-slate-700 text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                      value={selectedProperty}
                      onChange={e => setSelectedProperty(e.target.value)}
                      disabled={!selectedLocation || properties.length === 0}
                    >
                      <option value="">Hoàng Cầu Cơ sở 1</option>
                      {properties.map(prop => (
                        <option key={prop.id} value={prop.id}>{prop.name}</option>
                      ))}
                    </select>
                    <Building2 className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Package Type Toggle - Right Side */}
              {showTypeFilter && (
                <div className="flex-shrink-0">
                  <div className="bg-slate-800 rounded-lg p-1">
                    <div className="flex">
                      <button
                        onClick={() => updateShowType('basic')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                          showType === 'basic'
                            ? 'bg-[#28c4dd] text-white shadow-md'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                        Basic
                      </button>
                      <button
                        onClick={() => updateShowType('combo')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                          showType === 'combo'
                            ? 'bg-[#5661b3] text-white shadow-md'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        Combo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Location Info */}
            {selectedCity && selectedLocation && selectedProperty && (
              <div className="mt-3 text-center">
                <div className="inline-flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  <MapPin className="h-4 w-4" />
                  <span>
                    Showing packages for <strong>{properties.find(p => p.id === selectedProperty)?.name || ''}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Packages Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Show packages if selectedProperty is set OR if we have default data */}
          {(selectedProperty || (cities.length > 0 && locations.length > 0 && properties.length > 0)) ? (
            <>
              {/* Section Header */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 mb-1">
                  {showType === 'basic' ? 'Basic Packages' : 'Combo Packages'}
                </h2>
                <p className="text-slate-600 max-w-lg mx-auto text-sm">
                  {showType === 'basic' 
                    ? 'Choose from our carefully curated basic packages designed for your specific needs'
                    : 'Discover our value-packed combo deals that combine multiple services at discounted rates'
                  }
                </p>
              </div>

              {showType === 'basic' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                  {limitedBasic.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="bg-white/80 rounded-xl p-6 shadow-sm">
                        <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">No Basic Packages Available</h3>
                        <p className="text-slate-500 text-sm">No basic packages are currently available for the selected property.</p>
                      </div>
                    </div>
                  ) : (
                                         limitedBasic.map((pkg, idx) => (
                                               <Card key={pkg.id} className={`w-full relative overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 min-h-[480px] ${
                          idx === 0 ? 'ring-2 ring-[#28c4dd] border-[#28c4dd] shadow-2xl' : ''
                        }`}>
                          {/* Popular Badge */}
                          {idx === 0 && (
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-[#28c4dd] to-[#1ea5b8] text-white px-3 py-1.5 rounded-full text-xs font-semibold z-10 shadow-lg">
                              <div className="flex items-center">
                                <Star className="h-3 w-3 mr-1.5" />
                                <span>Most Popular</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Header Section with Gradient */}
                          <div className="relative h-48 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-[#28c4dd] rounded-full -translate-y-16 translate-x-16"></div>
                              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#1ea5b8] rounded-full translate-y-12 -translate-x-12"></div>
                            </div>
                            
                            {/* Content */}
                            <div className="relative z-10 p-6 text-center h-full flex flex-col justify-center">
                              <div className="mb-3">
                                <Badge className="bg-white/80 text-slate-700 border-0 px-3 py-1 text-xs font-medium">
                                  {pkg.nextUServiceName || 'Basic Package'}
                                </Badge>
                              </div>
                              <CardTitle className="text-xl font-bold text-slate-800 mb-3 leading-tight">{pkg.name}</CardTitle>
                              <div className="flex items-center justify-center mb-2">
                                <span className="text-3xl font-bold text-slate-800">{pkg.price?.toLocaleString()}</span>
                                <span className="text-lg text-slate-600 ml-1">$</span>
                              </div>
                              {pkg.planDurations && pkg.planDurations.length > 0 && (
                                <div className="text-slate-600 text-sm font-medium">
                                  {pkg.planDurations[0].planDurationDescription || `${pkg.planDurations[0].planDurationValue} ${pkg.planDurations[0].planDurationUnit}`}
                                </div>
                              )}
                            </div>
                          </div>
                         
                         <CardContent className="p-5 space-y-4">
                           {/* Package Details & Description */}
                           <div className="bg-slate-50 rounded-lg p-4">
                             <h4 className="font-semibold text-slate-800 mb-3 flex items-center text-sm">
                               <Award className="h-4 w-4 mr-2 text-[#28c4dd]" />
                               Package Details
                             </h4>
                             
                             {/* Info Grid */}
                             <div className="grid grid-cols-2 gap-3 mb-4">
                               {pkg.planCategoryName && (
                                 <div className="flex justify-between items-center">
                                   <span className="text-xs text-slate-500">Category:</span>
                                   <span className="text-sm font-medium text-slate-800">{pkg.planCategoryName}</span>
                                 </div>
                               )}
                               {pkg.planLevelName && (
                                 <div className="flex justify-between items-center">
                                   <span className="text-xs text-slate-500">Level:</span>
                                   <span className="text-sm font-medium text-slate-800">{pkg.planLevelName}</span>
                                 </div>
                               )}
                               {pkg.targetAudienceName && (
                                 <div className="flex justify-between items-center">
                                   <span className="text-xs text-slate-500">Target:</span>
                                   <span className="text-sm font-medium text-slate-800">{pkg.targetAudienceName}</span>
                                 </div>
                               )}
                               <div className="flex justify-between items-center">
                                 <span className="text-xs text-slate-500">Code:</span>
                                 <span className="text-sm font-medium text-slate-800 font-mono">{pkg.code}</span>
                               </div>
                             </div>
                             
                             {/* Divider */}
                             <div className="border-t border-slate-200 my-3"></div>
                             
                                                          {/* Description */}
                             <div className="h-[4rem]">
                               <div className="text-xs text-slate-500 mb-2">Description</div>
                               <div className="h-[3rem] overflow-hidden">
                                 <p className="text-slate-700 text-sm leading-relaxed line-clamp-3">
                                   {pkg.description || 'No description available'}
                                 </p>
                               </div>
                             </div>
                           </div>

                                                       {/* Services Section */}
                            <div>
                              <h4 className="font-semibold text-slate-800 mb-2 flex items-center text-sm">
                                <Zap className="h-4 w-4 mr-2 text-[#28c4dd]" />
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
                                     <div key={accommodationId || i} className="bg-white rounded-lg p-3 border border-slate-100">
                                       <div className="flex items-center justify-between">
                                         <div className="flex items-center">
                                           {loading ? (
                                             <>
                                               <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#28c4dd] mr-2"></div>
                                               <span className="text-slate-500 text-sm">Loading...</span>
                                             </>
                                           ) : info ? (
                                             <>
                                               <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                               <span className="text-slate-700 font-medium text-sm">{info.roomTypeName || a.roomType || "Room"}</span>
                                             </>
                                           ) : (
                                             <span className="text-slate-500 italic text-sm">No info</span>
                                           )}
                                         </div>
                                         {hasDetail && (
                                           <button
                                             className={`p-1 rounded-full hover:bg-slate-100 transition-all duration-200 ${expanded ? 'bg-slate-200' : ''}`}
                                             onClick={() => setExpandedAccommodations(prev => ({ ...prev, [accommodationId]: !prev[accommodationId] }))}
                                           >
                                             <span className={`transition-transform duration-200 text-slate-500 ${expanded ? 'rotate-180' : ''}`}>▼</span>
                                           </button>
                                         )}
                                       </div>
                                       {expanded && info && (
                                         <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                                           {typeof info.capacity !== 'undefined' && (
                                             <div className="flex justify-between text-xs">
                                               <span className="text-slate-500">Capacity:</span>
                                               <span className="font-medium text-slate-700">{info.capacity}</span>
                                             </div>
                                           )}
                                           {typeof info.pricePerNight !== 'undefined' && (
                                             <div className="flex justify-between text-xs">
                                               <span className="text-slate-500">Price/night:</span>
                                               <span className="font-medium text-slate-700">{info.pricePerNight.toLocaleString()}₫</span>
                                             </div>
                                           )}
                                           {info.description && (
                                             <div className="text-xs text-slate-600">{info.description}</div>
                                           )}
                                         </div>
                                       )}
                                     </div>
                                   );
                                 })}
                               </div>
                             ) : pkg.serviceType === 1 && pkg.entitlements && pkg.entitlements.length > 0 ? (
                               <div className="space-y-2">
                                 {pkg.entitlements.map((e: any, i: number) => {
                                   const entitlementId = e.entitlementId;
                                   const info = accommodationInfo[entitlementId];
                                   const loading = loadingAccommodation[entitlementId];
                                   const expanded = expandedAccommodations[entitlementId];
                                   return (
                                     <div key={entitlementId || i} className="bg-white rounded-lg p-3 border border-slate-100">
                                       <div className="flex items-center justify-between">
                                         <div className="flex items-center">
                                           {loading ? (
                                             <>
                                               <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#28c4dd] mr-2"></div>
                                               <span className="text-slate-500 text-sm">Loading...</span>
                                             </>
                                           ) : (
                                             <>
                                               <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                               <span className="text-slate-700 font-medium text-sm">
                                                 {(info && info.nextUServiceName) ? info.nextUServiceName : e.nextUSerName || e.nextUServiceName}
                                               </span>
                                             </>
                                           )}
                                         </div>
                                         <button
                                           className={`p-1 rounded-full hover:bg-slate-100 transition-all duration-200 ${expanded ? 'bg-slate-200' : ''}`}
                                           onClick={() => {
                                             setExpandedAccommodations(prev => ({ ...prev, [entitlementId]: !prev[entitlementId] }));
                                             if (!info && !loading) {
                                               setLoadingAccommodation(prev => ({ ...prev, [entitlementId]: true }));
                                               api.get(`/api/membership/EntitlementRule/${entitlementId}`)
                                                 .then(res => setAccommodationInfo(prev => ({ ...prev, [entitlementId]: res.data || res })))
                                                 .catch(() => setAccommodationInfo(prev => ({ ...prev, [entitlementId]: null })))
                                                 .finally(() => setLoadingAccommodation(prev => ({ ...prev, [entitlementId]: false })));
                                             }
                                           }}
                                         >
                                           <span className={`transition-transform duration-200 text-slate-500 ${expanded ? 'rotate-180' : ''}`}>▼</span>
                                         </button>
                                       </div>
                                       {expanded && (
                                         loading ? (
                                           <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">Loading...</div>
                                         ) : info && (
                                           <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                                             {typeof info.price !== 'undefined' && (
                                               <div className="flex justify-between text-xs">
                                                 <span className="text-slate-500">Price:</span>
                                                 <span className="font-medium text-slate-700">{info.price}</span>
                                               </div>
                                             )}
                                             {typeof info.creditAmount !== 'undefined' && (
                                               <div className="flex justify-between text-xs">
                                                 <span className="text-slate-500">Credit Amount:</span>
                                                 <span className="font-medium text-slate-700">{info.creditAmount}</span>
                                               </div>
                                             )}
                                             {typeof info.period !== 'undefined' && (
                                               <div className="flex justify-between text-xs">
                                                 <span className="text-slate-500">Period:</span>
                                                 <span className="font-medium text-slate-700">{info.period}</span>
                                               </div>
                                             )}
                                             {info.note && (
                                               <div className="text-xs text-slate-600">{info.note}</div>
                                             )}
                                           </div>
                                         )
                                       )}
                                     </div>
                                   );
                                 })}
                               </div>
                             ) : (
                               <div className="bg-slate-50 rounded-lg p-4 text-center">
                                 <div className="text-slate-400 text-sm">No included services</div>
                               </div>
                             )}
                           </div>

                           {/* CTA Button */}
                           <Button
                             className="w-full rounded-xl bg-gradient-to-r from-[#28c4dd] to-[#1ea5b8] hover:from-[#1ea5b8] hover:to-[#28c4dd] text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                             onClick={() => handleRequestPackage(pkg.id, pkg.id, 'basic')}
                             disabled={requestingPackageId === pkg.id}
                           >
                             {requestingPackageId === pkg.id ? (
                               <div className="flex items-center">
                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                 Processing...
                               </div>
                             ) : (
                               'View Details & Purchase'
                             )}
                           </Button>
                         </CardContent>
                       </Card>
                    ))
                  )}
                  
                  {/* View all button for preview mode */}
                  {isPreview && limitedBasic.length > 0 && (
                    <div className="col-span-full flex justify-center mt-6">
                      <Link href="/packages/all">
                        <Button className="rounded-lg px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white hover:shadow-md transition-all duration-200 text-sm">
                          View all packages
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {showType === 'combo' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                  {limitedCombos.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="bg-white/80 rounded-xl p-6 shadow-sm">
                        <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">No Combo Packages Available</h3>
                        <p className="text-slate-500 text-sm">No combo packages are currently available for the selected location.</p>
                      </div>
                    </div>
                  ) : (
                    limitedCombos.map((pkg, idx) => (
                      <Card key={pkg.id} className={`w-full relative overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 min-h-[480px] ${
                        idx === 0 ? 'ring-2 ring-[#5661b3] border-[#5661b3] shadow-2xl' : ''
                      }`}>
                        {/* Popular Badge */}
                        {idx === 0 && (
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-[#5661b3] to-[#4f5aa1] text-white px-3 py-1.5 rounded-full text-xs font-semibold z-10 shadow-lg">
                            <div className="flex items-center">
                              <Star className="h-3 w-3 mr-1.5" />
                              <span>Most Popular</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Header Section with Gradient */}
                        <div className="relative h-48 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 overflow-hidden">
                          {/* Background Pattern */}
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#5661b3] rounded-full -translate-y-16 translate-x-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#4f5aa1] rounded-full translate-y-12 -translate-x-12"></div>
                          </div>
                          
                          {/* Content */}
                          <div className="relative z-10 p-6 text-center h-full flex flex-col justify-center">
                            <div className="mb-3">
                              <Badge className="bg-white/80 text-slate-700 border-0 px-3 py-1 text-xs font-medium">
                                Combo Package
                              </Badge>
                            </div>
                            <CardTitle className="text-xl font-bold text-slate-800 mb-3 leading-tight">{pkg.name}</CardTitle>
                            <div className="flex items-center justify-center mb-2">
                              <span className="text-3xl font-bold text-slate-800">{pkg.totalPrice?.toLocaleString()}</span>
                              <span className="text-lg text-slate-600 ml-1">₫</span>
                            </div>
                            <div className="text-slate-600 text-sm font-medium mb-2">
                              <span className="bg-[#5661b3]/10 text-[#5661b3] px-2 py-1 rounded-full text-xs font-semibold">
                                {pkg.discountRate * 100}% discount
                              </span>
                            </div>
                            {/* Duration Display */}
                            {pkg.packageDurations && pkg.packageDurations.length > 0 && (
                              <div className="text-slate-600 text-sm font-medium">
                                {(() => {
                                  const duration = pkg.packageDurations[0];
                                  const durationId = duration.durationId;
                                  const durationInfo = durationDetails[durationId];
                                  const loading = loadingDurations[durationId];
                                  
                                  if (loading) {
                                    return <span className="text-xs text-slate-500">Loading duration...</span>;
                                  }
                                  
                                  if (durationInfo && durationInfo.value && durationInfo.unit) {
                                    return <span>{durationInfo.value} {durationInfo.unit}</span>;
                                  }
                                  
                                  return null;
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                       
                        <CardContent className="p-5 space-y-4">
                          {/* Package Details & Description */}
                          <div className="bg-slate-50 rounded-lg p-4">
                            <h4 className="font-semibold text-slate-800 mb-3 flex items-center text-sm">
                              <Award className="h-4 w-4 mr-2 text-[#5661b3]" />
                              Package Details
                            </h4>
                            
                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              {pkg.basicPlanCategoryName && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">Category:</span>
                                  <span className="text-sm font-medium text-slate-800">{pkg.basicPlanCategoryName}</span>
                                </div>
                              )}
                              {pkg.planLevelName && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">Level:</span>
                                  <span className="text-sm font-medium text-slate-800">{pkg.planLevelName}</span>
                                </div>
                              )}
                              {pkg.targetAudienceName && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">Target:</span>
                                  <span className="text-sm font-medium text-slate-800">{pkg.targetAudienceName}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Code:</span>
                                <span className="text-sm font-medium text-slate-800 font-mono">{pkg.code}</span>
                              </div>
                            </div>
                            
                            {/* Divider */}
                            <div className="border-t border-slate-200 my-3"></div>
                            
                            {/* Description */}
                            <div className="h-[4rem]">
                              <div className="text-xs text-slate-500 mb-2">Description</div>
                              <div className="h-[3rem] overflow-hidden">
                                <p className="text-slate-700 text-sm leading-relaxed line-clamp-3">
                                  {pkg.description || 'No description available'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Included Packages Section */}
                          <div>
                            <h4 className="font-semibold text-slate-800 mb-2 flex items-center text-sm">
                              <Sparkles className="h-4 w-4 mr-2 text-[#5661b3]" />
                              Included Packages
                            </h4>
                            {pkg.basicPlanIds && pkg.basicPlanIds.length > 0 ? (
                              <div className="space-y-2">
                                {/* Group basic plans by type */}
                                {(() => {
                                  const plansByType: { [key: string]: any[] } = {};
                                  
                                  pkg.basicPlanIds.forEach((planId: string) => {
                                    const planDetail = basicPlanDetails[planId];
                                    if (planDetail) {
                                      const type = planDetail.nextUServiceName || 'Other';
                                      if (!plansByType[type]) {
                                        plansByType[type] = [];
                                      }
                                      plansByType[type].push(planDetail);
                                    }
                                  });

                                  return Object.entries(plansByType).map(([type, plans]) => (
                                    <div key={type} className="bg-white rounded-lg p-3 border border-slate-100">
                                      {/* Type Header */}
                                      <div className="flex items-center mb-2">
                                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                        <span className="text-slate-700 font-semibold text-sm">{type}</span>
                                      </div>
                                      
                                      {/* Plans under this type */}
                                      <div className="ml-6 space-y-1">
                                        {plans.map((plan, planIdx) => (
                                          <div key={planIdx} className="flex items-center">
                                            <div className="w-2 h-2 bg-slate-300 rounded-full mr-2 flex-shrink-0"></div>
                                            <span className="text-slate-600 text-xs">{plan.name}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ));
                                })()}
                                
                                {/* Show loading for plans that haven't been fetched yet */}
                                {pkg.basicPlanIds.some((planId: string) => loadingBasicPlans[planId]) && (
                                  <div className="bg-white rounded-lg p-3 border border-slate-100">
                                    <div className="flex items-center">
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#5661b3] mr-2"></div>
                                      <span className="text-slate-500 text-sm">Loading package details...</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="bg-slate-50 rounded-lg p-4 text-center">
                                <div className="text-slate-400 text-sm">No included packages</div>
                              </div>
                            )}
                          </div>

                          {/* CTA Button */}
                          <Button
                            className="w-full rounded-xl bg-gradient-to-r from-[#5661b3] to-[#4f5aa1] hover:from-[#4f5aa1] hover:to-[#5661b3] text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                            onClick={() => handleRequestPackage(pkg.id, pkg.id, 'combo')}
                            disabled={requestingPackageId === pkg.id}
                          >
                            {requestingPackageId === pkg.id ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                              </div>
                            ) : (
                              'View Details & Purchase'
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                  
                  {/* View all button for preview mode */}
                  {isPreview && limitedCombos.length > 0 && (
                    <div className="col-span-full flex justify-center mt-6">
                      <Link href="/packages/all">
                        <Button className="rounded-lg px-6 py-2 bg-[#5661b3] hover:bg-[#4f5aa1] text-white hover:shadow-md transition-all duration-200 text-sm">
                          View all packages
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white/80 rounded-xl p-8 shadow-sm max-w-xl mx-auto">
                <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-3">No Location Selected</h3>
                <p className="text-slate-500 mb-4 text-sm">Please select a city, location, and property above to view available packages.</p>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>Available cities: {cities.length}</p>
                  <p>Available locations: {locations.length}</p>
                  <p>Available properties: {properties.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
} 