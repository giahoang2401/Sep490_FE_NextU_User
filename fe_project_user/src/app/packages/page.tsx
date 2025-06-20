"use client";
import { useEffect, useState } from "react";
import api from "@/utils/axiosConfig";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, MapPin, Star, Clock, Zap, Shield, Award, Sparkles } from "lucide-react"
import Link from "next/link"

export default function PackagesPage() {
  const [selectedLocation, setSelectedLocation] = useState<string>("Hà Nội");
  const [comboPlans, setComboPlans] = useState<any[]>([]);
  const [basicPlans, setBasicPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showType, setShowType] = useState<'combo' | 'basic'>("basic");
  const [nextServiceNames, setNextServiceNames] = useState<{ [pkgId: string]: string[] }>({});
  const [loadingNext, setLoadingNext] = useState<{ [pkgId: string]: boolean }>({});

  const locations = ["Hà Nội", "Hải Phòng"];

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [combos, basics] = await Promise.all([
          fetch("http://localhost:5003/api/ComboPlans").then(res => res.json()),
          fetch("http://localhost:5003/api/BasicPlans").then(res => res.json()),
        ]);
        console.log('DEBUG basics:', basics);
        basics.forEach((b: any, i: number) => console.log('DEBUG basic package', i, b));
        console.log('DEBUG combos:', combos);
        combos.forEach((c: any, i: number) => console.log('DEBUG combo package', i, c));
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
        const res = await fetch(`http://localhost:5003/api/NextUServices/${id}`);
        if (res.ok) {
          const data = await res.json();
          console.log('NextUserService fetch', { id, data });
          if (data && data.name) names.push(data.name);
        } else {
          console.log('NextUserService fetch failed', { id, status: res.status });
        }
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
      const ids = pkg.nextUServiceIds || pkg.nextUserServiceIds || pkg.nextServiceIds || [];
      console.log('Package', pkg.id, 'nextUServiceIds:', pkg.nextUServiceIds, 'nextUserServiceIds:', pkg.nextUserServiceIds, 'nextServiceIds:', pkg.nextServiceIds, 'ids:', ids);
      if (ids.length > 0 && !nextServiceNames[pkg.id]) {
        fetchNextServiceNames(ids, pkg.id);
      }
      if (!pkg.nextUServiceIds && !pkg.nextUserServiceIds && !pkg.nextServiceIds) {
        console.log('Package', pkg.id, 'has NO nextUServiceIds, nextUserServiceIds or nextServiceIds');
      }
    });
    // eslint-disable-next-line
  }, [showType, filteredBasic, filteredCombos]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8f9fc] via-[#f0fbfd] to-[#cce9fa]">
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
    <div className="min-h-screen bg-gradient-to-br from-[#e8f9fc] via-[#f0fbfd] to-[#cce9fa]">
      {/* Hero Section - Matching Homepage Style */}
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

      {/* Selection Controls Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          {/* Location Selection - Now Primary */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8">Select Your Preferred Location</h2>
            <div className="flex justify-center gap-4">
              {locations.map((location) => (
                <Button
                  key={location}
                  variant={selectedLocation === location ? 'default' : 'outline'}
                  className={`rounded-full px-12 py-4 font-semibold text-lg transition-all duration-300 ${
                    selectedLocation === location 
                      ? 'bg-gradient-to-r from-[#28c4dd] to-[#5661b3] text-white shadow-lg transform scale-105' 
                      : 'text-slate-600 hover:text-slate-800 border-slate-300 bg-white/60 hover:bg-white/80'
                  }`}
                  onClick={() => setSelectedLocation(location)}
                >
                  <MapPin className="h-5 w-5 mr-3" />
                  {location}
                </Button>
              ))}
            </div>
          </div>

          {/* Package Type Selection - Now Secondary */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-700 mb-6">Choose Your Package Type</h3>
            <div className="flex justify-center gap-3 bg-white/60 rounded-full p-3 inline-flex shadow-lg backdrop-blur-sm">
              <Button
                variant={showType === 'basic' ? 'default' : 'ghost'}
                className={`rounded-full px-8 py-3 font-medium transition-all duration-300 ${
                  showType === 'basic' 
                    ? 'bg-slate-800 text-white shadow-lg' 
                    : 'text-slate-600 hover:bg-white/50 hover:text-slate-800'
                }`}
                onClick={() => setShowType('basic')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Basic Packages
              </Button>
              <Button
                variant={showType === 'combo' ? 'default' : 'ghost'}
                className={`rounded-full px-8 py-3 font-medium transition-all duration-300 ${
                  showType === 'combo' 
                    ? 'bg-slate-800 text-white shadow-lg' 
                    : 'text-slate-600 hover:bg-white/50 hover:text-slate-800'
                }`}
                onClick={() => setShowType('combo')}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Combo Packages
              </Button>
            </div>
          </div>
        </div>
      </section>

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
              <div className="flex flex-wrap justify-center gap-8">
                {filteredBasic.length === 0 && (
                  <div className="w-full text-center py-12">
                    <div className="text-slate-500 text-lg">No basic packages available for {selectedLocation}.</div>
                  </div>
                )}
                {filteredBasic.map((pkg, idx) => (
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
                            <span className="font-semibold text-slate-800">{pkg.packageDurationName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Services */}
                      <div>
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                          <Zap className="h-4 w-4 mr-2 text-blue-600" />
                          Included Services
                        </h4>
                        {loadingNext[pkg.id] ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                            <span className="text-slate-500 text-sm">Loading services...</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {(nextServiceNames[pkg.id] || []).length === 0 ? (
                              <div className="text-slate-500 text-sm italic">No included services</div>
                            ) : (
                              nextServiceNames[pkg.id].map((name, i) => (
                                <div key={i} className="flex items-center text-sm">
                                  <Check className="h-4 w-4 text-teal-500 mr-2 flex-shrink-0" />
                                  <span className="text-slate-700">{name}</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      {/* CTA Button */}
                      <Button className="w-full rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white font-semibold py-4 shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                        <Link href="/packages/request">
                          Request This Package
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {showType === 'combo' && (
              <div className="flex flex-wrap justify-center gap-8">
                {filteredCombos.length === 0 && (
                  <div className="w-full text-center py-12">
                    <div className="text-slate-500 text-lg">No combo packages available for {selectedLocation}.</div>
                  </div>
                )}
                {filteredCombos.map((pkg, idx) => (
                  <Card key={pkg.id} className={`w-full max-w-lg relative overflow-hidden rounded-3xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
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
                        <span className="text-2xl text-slate-600 ml-1">$</span>
                      </div>
                      <div className="text-slate-600 font-medium">Combo package</div>
                      <p className="text-slate-600 mt-3 text-sm leading-relaxed">{pkg.description}</p>
                    </CardHeader>
                    
                    <CardContent className="space-y-6 p-6">
                      {/* Package Details */}
                      <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-4">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                          <Award className="h-4 w-4 mr-2 text-teal-600" />
                          Package Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Code:</span>
                            <span className="font-semibold text-slate-800">{pkg.code}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Discount:</span>
                            <span className="font-bold text-teal-600 bg-teal-100 px-2 py-1 rounded-full">
                              {pkg.discountRate * 100}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Services */}
                      <div>
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                          <Sparkles className="h-4 w-4 mr-2 text-teal-600" />
                          Included Services
                        </h4>
                        {loadingNext[pkg.id] ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600 mr-2"></div>
                            <span className="text-slate-500 text-sm">Loading services...</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {(nextServiceNames[pkg.id] || []).length === 0 ? (
                              <div className="text-slate-500 text-sm italic">No included services</div>
                            ) : (
                              nextServiceNames[pkg.id].map((name, i) => (
                                <div key={i} className="flex items-center text-sm">
                                  <Check className="h-4 w-4 text-teal-500 mr-2 flex-shrink-0" />
                                  <span className="text-slate-700">{name}</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      {/* CTA Button */}
                      <Button className="w-full rounded-2xl bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-semibold py-4 shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                        <Link href="/packages/request">
                          Request This Package
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
        </div>
      </section>
    </div>
  )
}