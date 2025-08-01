'use client'

import { useState } from 'react'
import { Calendar, Clock, Users, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Event, EventAddOn } from '@/data/ecosystem/event-data'

interface EventBookingProps {
  event: Event
  onClose: () => void
}

interface BookingForm {
  ticketType: string
  quantity: number
  attendees: Attendee[]
  addOns: string[]
  contactInfo: {
    name: string
    email: string
    phone: string
    emergencyContact: string
    dietaryRequirements?: string
  }
  paymentMethod: string
  agreeToTerms: boolean
}

interface Attendee {
  name: string
  email: string
  phone: string
  dietaryRequirements?: string
}

export default function EventBooking({ event, onClose }: EventBookingProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    ticketType: 'standard',
    quantity: 1,
    attendees: [],
    addOns: [],
    contactInfo: {
      name: '',
      email: '',
      phone: '',
      emergencyContact: '',
      dietaryRequirements: ''
    },
    paymentMethod: 'card',
    agreeToTerms: false
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: event.currency,
      minimumFractionDigits: 0,
    }).format(price)
  }

  const calculateTotal = () => {
    let total = event.price * bookingForm.quantity
    
    // Add add-ons
    bookingForm.addOns.forEach(addonId => {
      const addon = event.addOns.find(a => a.id === addonId)
      if (addon) {
        total += addon.price * bookingForm.quantity
      }
    })

    // Apply discounts
    if (event.earlyBirdDiscount) {
      const discount = total * (event.earlyBirdDiscount.percentage / 100)
      total -= discount
    }

    if (event.groupDiscount && bookingForm.quantity >= event.groupDiscount.minPeople) {
      const discount = total * (event.groupDiscount.percentage / 100)
      total -= discount
    }

    return total
  }

  const handleQuantityChange = (quantity: number) => {
    setBookingForm(prev => ({
      ...prev,
      quantity,
      attendees: Array(quantity).fill(null).map((_, index) => 
        prev.attendees[index] || { name: '', email: '', phone: '' }
      )
    }))
  }

  const handleAttendeeChange = (index: number, field: keyof Attendee, value: string) => {
    setBookingForm(prev => ({
      ...prev,
      attendees: prev.attendees.map((attendee, i) => 
        i === index ? { ...attendee, [field]: value } : attendee
      )
    }))
  }

  const handleAddOnToggle = (addonId: string) => {
    setBookingForm(prev => ({
      ...prev,
      addOns: prev.addOns.includes(addonId)
        ? prev.addOns.filter(id => id !== addonId)
        : [...prev.addOns, addonId]
    }))
  }

  const steps = [
    { id: 1, title: 'Chọn vé', description: 'Chọn loại vé và số lượng' },
    { id: 2, title: 'Thông tin', description: 'Điền thông tin người tham gia' },
    { id: 3, title: 'Bổ sung', description: 'Chọn dịch vụ bổ sung' },
    { id: 4, title: 'Thanh toán', description: 'Xác nhận và thanh toán' }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Đăng ký tham gia</h2>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center mt-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Chọn loại vé</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className={`cursor-pointer transition-all ${
                    bookingForm.ticketType === 'standard' ? 'ring-2 ring-blue-500' : ''
                  }`} onClick={() => setBookingForm(prev => ({ ...prev, ticketType: 'standard' }))}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Vé thường</h4>
                          <p className="text-sm text-gray-600">Bao gồm tất cả dịch vụ cơ bản</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatPrice(event.price)}</p>
                          {event.originalPrice && (
                            <p className="text-sm text-gray-500 line-through">
                              {formatPrice(event.originalPrice)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {event.addOns.some(addon => addon.type === 'private') && (
                    <Card className={`cursor-pointer transition-all ${
                      bookingForm.ticketType === 'vip' ? 'ring-2 ring-blue-500' : ''
                    }`} onClick={() => setBookingForm(prev => ({ ...prev, ticketType: 'vip' }))}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Vé VIP</h4>
                            <p className="text-sm text-gray-600">Bao gồm dịch vụ riêng tư</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatPrice(event.price * 1.5)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Số lượng vé</h3>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(Math.max(1, bookingForm.quantity - 1))}
                    disabled={bookingForm.quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="text-lg font-medium w-12 text-center">{bookingForm.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(bookingForm.quantity + 1)}
                    disabled={bookingForm.quantity >= event.capacity.available}
                  >
                    +
                  </Button>
                  <span className="text-sm text-gray-500">
                    Còn {event.capacity.available} chỗ
                  </span>
                </div>
              </div>

              {/* Summary */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Tóm tắt đơn hàng</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Vé thường x{bookingForm.quantity}</span>
                      <span>{formatPrice(event.price * bookingForm.quantity)}</span>
                    </div>
                    {event.earlyBirdDiscount && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá sớm ({event.earlyBirdDiscount.percentage}%)</span>
                        <span>-{formatPrice(event.price * bookingForm.quantity * (event.earlyBirdDiscount.percentage / 100))}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Tổng cộng</span>
                      <span>{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Thông tin liên hệ chính</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Họ và tên *</Label>
                    <Input
                      id="name"
                      value={bookingForm.contactInfo.name}
                      onChange={(e) => setBookingForm(prev => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, name: e.target.value }
                      }))}
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={bookingForm.contactInfo.email}
                      onChange={(e) => setBookingForm(prev => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, email: e.target.value }
                      }))}
                      placeholder="example@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      value={bookingForm.contactInfo.phone}
                      onChange={(e) => setBookingForm(prev => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, phone: e.target.value }
                      }))}
                      placeholder="0123456789"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency">Liên hệ khẩn cấp</Label>
                    <Input
                      id="emergency"
                      value={bookingForm.contactInfo.emergencyContact}
                      onChange={(e) => setBookingForm(prev => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, emergencyContact: e.target.value }
                      }))}
                      placeholder="Số điện thoại liên hệ khẩn cấp"
                    />
                  </div>
                </div>
              </div>

              {bookingForm.quantity > 1 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Thông tin người tham gia</h3>
                  <div className="space-y-4">
                    {bookingForm.attendees.map((attendee, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-3">Người tham gia {index + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Họ và tên *</Label>
                              <Input
                                value={attendee.name}
                                onChange={(e) => handleAttendeeChange(index, 'name', e.target.value)}
                                placeholder="Nhập họ và tên"
                              />
                            </div>
                            <div>
                              <Label>Email *</Label>
                              <Input
                                type="email"
                                value={attendee.email}
                                onChange={(e) => handleAttendeeChange(index, 'email', e.target.value)}
                                placeholder="example@email.com"
                              />
                            </div>
                            <div>
                              <Label>Số điện thoại</Label>
                              <Input
                                value={attendee.phone}
                                onChange={(e) => handleAttendeeChange(index, 'phone', e.target.value)}
                                placeholder="0123456789"
                              />
                            </div>
                            <div>
                              <Label>Yêu cầu ăn uống</Label>
                              <Input
                                value={attendee.dietaryRequirements || ''}
                                onChange={(e) => handleAttendeeChange(index, 'dietaryRequirements', e.target.value)}
                                placeholder="Chế độ ăn đặc biệt"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="dietary">Yêu cầu ăn uống (nếu có)</Label>
                <Textarea
                  id="dietary"
                  value={bookingForm.contactInfo.dietaryRequirements}
                  onChange={(e) => setBookingForm(prev => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, dietaryRequirements: e.target.value }
                  }))}
                  placeholder="Chế độ ăn đặc biệt, dị ứng thực phẩm..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && event.addOns.length > 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Dịch vụ bổ sung</h3>
                <div className="space-y-4">
                  {event.addOns.map((addon) => (
                    <Card key={addon.id} className={`cursor-pointer transition-all ${
                      bookingForm.addOns.includes(addon.id) ? 'ring-2 ring-blue-500' : ''
                    }`} onClick={() => handleAddOnToggle(addon.id)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Checkbox
                                checked={bookingForm.addOns.includes(addon.id)}
                                onChange={() => handleAddOnToggle(addon.id)}
                              />
                              <h4 className="font-medium">{addon.name}</h4>
                            </div>
                            <p className="text-sm text-gray-600">{addon.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatPrice(addon.price)}</p>
                            <p className="text-xs text-gray-500">mỗi người</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Updated Summary */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Tóm tắt đơn hàng</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Vé thường x{bookingForm.quantity}</span>
                      <span>{formatPrice(event.price * bookingForm.quantity)}</span>
                    </div>
                    {bookingForm.addOns.map(addonId => {
                      const addon = event.addOns.find(a => a.id === addonId)
                      return addon ? (
                        <div key={addonId} className="flex justify-between">
                          <span>{addon.name} x{bookingForm.quantity}</span>
                          <span>{formatPrice(addon.price * bookingForm.quantity)}</span>
                        </div>
                      ) : null
                    })}
                    {event.earlyBirdDiscount && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá sớm ({event.earlyBirdDiscount.percentage}%)</span>
                        <span>-{formatPrice(calculateTotal() * (event.earlyBirdDiscount.percentage / 100))}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Tổng cộng</span>
                      <span>{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Phương thức thanh toán</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className={`cursor-pointer transition-all ${
                    bookingForm.paymentMethod === 'card' ? 'ring-2 ring-blue-500' : ''
                  }`} onClick={() => setBookingForm(prev => ({ ...prev, paymentMethod: 'card' }))}>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-3" />
                        <div>
                          <h4 className="font-medium">Thẻ tín dụng</h4>
                          <p className="text-sm text-gray-600">Visa, Mastercard, JCB</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`cursor-pointer transition-all ${
                    bookingForm.paymentMethod === 'bank' ? 'ring-2 ring-blue-500' : ''
                  }`} onClick={() => setBookingForm(prev => ({ ...prev, paymentMethod: 'bank' }))}>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-3" />
                        <div>
                          <h4 className="font-medium">Chuyển khoản ngân hàng</h4>
                          <p className="text-sm text-gray-600">Chuyển khoản trực tiếp</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Điều khoản và điều kiện</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={bookingForm.agreeToTerms}
                      onCheckedChange={(checked) => setBookingForm(prev => ({ 
                        ...prev, 
                        agreeToTerms: checked as boolean 
                      }))}
                    />
                    <div>
                      <Label htmlFor="terms" className="text-sm">
                        Tôi đồng ý với <a href="#" className="text-blue-600 underline">điều khoản sử dụng</a> và{' '}
                        <a href="#" className="text-blue-600 underline">chính sách bảo mật</a>
                      </Label>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox id="health" />
                    <div>
                      <Label htmlFor="health" className="text-sm">
                        Tôi cam kết tuân thủ các quy định an toàn sức khỏe và khai báo y tế khi cần thiết
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Summary */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Tóm tắt cuối cùng</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Vé thường x{bookingForm.quantity}</span>
                      <span>{formatPrice(event.price * bookingForm.quantity)}</span>
                    </div>
                    {bookingForm.addOns.map(addonId => {
                      const addon = event.addOns.find(a => a.id === addonId)
                      return addon ? (
                        <div key={addonId} className="flex justify-between">
                          <span>{addon.name} x{bookingForm.quantity}</span>
                          <span>{formatPrice(addon.price * bookingForm.quantity)}</span>
                        </div>
                      ) : null
                    })}
                    {event.earlyBirdDiscount && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá sớm ({event.earlyBirdDiscount.percentage}%)</span>
                        <span>-{formatPrice(calculateTotal() * (event.earlyBirdDiscount.percentage / 100))}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Tổng cộng</span>
                      <span>{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Quay lại
            </Button>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Bước {currentStep} / {steps.length}
              </span>
              <Button
                onClick={() => {
                  if (currentStep < steps.length) {
                    setCurrentStep(currentStep + 1)
                  } else {
                    // Handle payment
                    console.log('Processing payment...')
                  }
                }}
                disabled={
                  (currentStep === 1 && bookingForm.quantity < 1) ||
                  (currentStep === 2 && !bookingForm.contactInfo.name) ||
                  (currentStep === 4 && !bookingForm.agreeToTerms)
                }
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {currentStep === steps.length ? 'Thanh toán' : 'Tiếp tục'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 