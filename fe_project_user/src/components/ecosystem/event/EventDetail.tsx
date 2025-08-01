'use client'

import { useState } from 'react'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  Heart, 
  Share2, 
  BookOpen,
  CheckCircle,
  AlertCircle,
  Info,
  Tag,
  ArrowLeft,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Event, eventCategories, eventTypes, eventLevels } from '@/data/ecosystem/event-data'

interface EventDetailProps {
  event: Event
}

export default function EventDetail({ event }: EventDetailProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const category = eventCategories[event.category]
  const type = eventTypes[event.type]
  const level = eventLevels[event.requirements.level]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: event.currency,
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getAvailabilityColor = () => {
    const percentage = (event.capacity.available / event.capacity.total) * 100
    if (percentage <= 20) return 'text-red-600'
    if (percentage <= 50) return 'text-orange-600'
    return 'text-green-600'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Button>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600 ml-2">{category.name}</span>
        <span className="text-gray-400 ml-2">/</span>
        <span className="text-gray-900 ml-2">{event.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Event Images */}
          <div className="mb-8">
            <div className="relative">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-96 object-cover rounded-lg"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                {event.featured && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    Nổi bật
                  </Badge>
                )}
                {event.earlyBirdDiscount && (
                  <Badge className="bg-red-500 text-white border-0">
                    -{event.earlyBirdDiscount.percentage}%
                  </Badge>
                )}
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-white/80 hover:bg-white"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-white/80 hover:bg-white"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Thumbnail Images */}
            {event.images.length > 0 && (
              <div className="flex gap-2 mt-4">
                {event.images.slice(0, 4).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${event.title} ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Event Info */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-2">
                <Badge variant="secondary">
                  <category.icon className="h-3 w-3 mr-1" />
                  {category.name}
                </Badge>
                <Badge variant="outline">
                  <type.icon className="h-3 w-3 mr-1" />
                  {type.name}
                </Badge>
              </div>
              <Badge variant="outline" className={level.color}>
                {level.name}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
            
            <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(event.date)} • {event.time}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {event.duration}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {event.location}
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                <span className={getAvailabilityColor()}>
                  Còn {event.capacity.available}/{event.capacity.total} chỗ
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                <span className="font-medium">{event.rating}</span>
                <span className="text-gray-500 ml-1">({event.reviewCount} đánh giá)</span>
              </div>
              <div className="flex gap-1">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="schedule">Lịch trình</TabsTrigger>
              <TabsTrigger value="instructor">Giảng viên</TabsTrigger>
              <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Mô tả</h3>
                  <p className="text-gray-600 leading-relaxed">{event.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Điều kiện tham gia</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Info className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm">Độ tuổi: {event.requirements.age}</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">Trình độ: {level.name}</span>
                    </div>
                    {event.requirements.equipment && (
                      <div className="flex items-start col-span-2">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Cần mang theo:</span>
                          <ul className="text-sm text-gray-600 mt-1">
                            {event.requirements.equipment.map((item, index) => (
                              <li key={index}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    {event.requirements.healthDeclaration && (
                      <div className="flex items-center col-span-2">
                        <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                        <span className="text-sm">Cần khai báo y tế trước khi tham gia</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Tiện ích bao gồm</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {event.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="mt-6">
              <div className="space-y-4">
                {event.schedule.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                            </div>
                            <h4 className="font-medium">{item.activity}</h4>
                          </div>
                          <p className="text-gray-600 text-sm ml-11">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{item.time}</div>
                          <div className="text-xs text-gray-500">{item.duration} phút</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="instructor" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <Avatar className="h-16 w-16 mr-4">
                      <AvatarImage src={event.instructor.avatar} />
                      <AvatarFallback className="text-lg">
                        {event.instructor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{event.instructor.name}</h3>
                      <p className="text-gray-600 mb-4">{event.instructor.bio}</p>
                      <div>
                        <h4 className="font-medium mb-2">Chuyên môn:</h4>
                        <div className="flex flex-wrap gap-2">
                          {event.instructor.expertise.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-4">
                {event.reviews.length > 0 ? (
                  event.reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarImage src={review.userAvatar} />
                              <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{review.userName}</p>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Chưa có đánh giá nào</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            {/* Pricing Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Đăng ký tham gia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Giá vé:</span>
                  <div className="text-right">
                    {event.originalPrice && (
                      <div className="text-sm text-gray-500 line-through">
                        {formatPrice(event.originalPrice)}
                      </div>
                    )}
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(event.price)}
                    </div>
                  </div>
                </div>

                {event.earlyBirdDiscount && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center text-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">
                        Giảm {event.earlyBirdDiscount.percentage}% khi đăng ký trước {new Date(event.earlyBirdDiscount.validUntil).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                )}

                {event.groupDiscount && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center text-blue-700">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">
                        Giảm {event.groupDiscount.percentage}% khi đăng ký từ {event.groupDiscount.minPeople} người
                      </span>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tình trạng:</span>
                    <span className={getAvailabilityColor()}>
                      Còn {event.capacity.available} chỗ
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tối thiểu:</span>
                    <span>{event.capacity.minParticipants} người</span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  Đăng ký ngay
                </Button>

                <Button variant="outline" size="lg" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Chia sẻ sự kiện
                </Button>
              </CardContent>
            </Card>

            {/* Add-ons */}
            {event.addOns.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Dịch vụ bổ sung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.addOns.map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{addon.name}</p>
                        <p className="text-xs text-gray-500">{addon.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatPrice(addon.price)}</p>
                        <Button size="sm" variant="outline" className="mt-1">
                          Thêm
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Địa điểm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                    <div>
                      <p className="font-medium">{event.location}</p>
                      <p className="text-sm text-gray-600">{event.address}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Xem bản đồ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 