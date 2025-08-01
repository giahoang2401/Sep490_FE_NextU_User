import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Star,
  Heart,
  Brain,
  Lightbulb,
  Palette,
  Music,
  Camera,
  Utensils,
  Dumbbell,
  BookOpen,
  Coffee,
  Zap,
  Leaf,
  Wifi,
  Monitor,
  Briefcase,
  Home,
} from "lucide-react"

export interface Event {
  id: string
  title: string
  category: EventCategory
  type: EventType
  description: string
  shortDescription: string
  date: string
  time: string
  duration: string
  location: string
  address: string
  price: number
  originalPrice?: number
  currency: string
  image: string
  images: string[]
  instructor: {
    name: string
    avatar: string
    bio: string
    expertise: string[]
  }
  schedule: EventSchedule[]
  amenities: string[]
  requirements: {
    age: string
    level: EventLevel
    equipment?: string[]
    healthDeclaration?: boolean
  }
  capacity: {
    total: number
    available: number
    minParticipants: number
  }
  rating: number
  reviewCount: number
  reviews: EventReview[]
  addOns: EventAddOn[]
  tags: string[]
  status: EventStatus
  featured: boolean
  earlyBirdDiscount?: {
    percentage: number
    validUntil: string
  }
  groupDiscount?: {
    minPeople: number
    percentage: number
  }
}

export interface EventSchedule {
  time: string
  activity: string
  description: string
  duration: number // minutes
}

export interface EventReview {
  id: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  date: string
  helpful: number
}

export interface EventAddOn {
  id: string
  name: string
  description: string
  price: number
  type: 'private' | 'meal' | 'transport' | 'equipment'
}

export type EventCategory = 
  | 'health-fitness' 
  | 'culture-social' 
  | 'creative-arts' 
  | 'entertainment-relaxation' 
  | 'business' 
  | 'other'

export type EventType = 
  | 'workshop' 
  | 'class' 
  | 'retreat' 
  | 'seminar' 
  | 'masterclass' 
  | 'meetup' 
  | 'conference'

export type EventLevel = 'beginner' | 'intermediate' | 'advanced' | 'all-levels'

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

export interface EventFilter {
  category?: EventCategory[]
  type?: EventType[]
  location?: string[]
  dateRange?: {
    start: string
    end: string
  }
  priceRange?: {
    min: number
    max: number
  }
  duration?: string[]
  level?: EventLevel[]
  availability?: boolean
}

export const eventCategories = {
  'health-fitness': {
    name: 'Sức khỏe & Thể chất',
    icon: Heart,
    color: 'bg-red-500',
    description: 'Yoga, Thiền, Tập luyện'
  },
  'culture-social': {
    name: 'Văn hoá & Xã hội',
    icon: Users,
    color: 'bg-blue-500',
    description: 'Lớp học nấu ăn, Hội thảo ngôn ngữ'
  },
  'creative-arts': {
    name: 'Sáng tạo & Nghệ thuật',
    icon: Palette,
    color: 'bg-purple-500',
    description: 'Vẽ, Nhiếp ảnh, Âm nhạc'
  },
  'entertainment-relaxation': {
    name: 'Giải trí & Thư giãn',
    icon: Coffee,
    color: 'bg-orange-500',
    description: 'Chiếu phim, Khiêu vũ, Dã ngoại'
  },
  'business': {
    name: 'Doanh nghiệp',
    icon: Briefcase,
    color: 'bg-green-500',
    description: 'Sự kiện doanh nghiệp, networking'
  },
  'other': {
    name: 'Khác',
    icon: Zap,
    color: 'bg-gray-500',
    description: 'Sự kiện đặc biệt'
  }
}

export const eventTypes = {
  workshop: { name: 'Workshop', icon: Wifi },
  class: { name: 'Lớp học', icon: BookOpen },
  retreat: { name: 'Retreat', icon: Leaf },
  seminar: { name: 'Hội thảo', icon: Users },
  masterclass: { name: 'Masterclass', icon: Star },
  meetup: { name: 'Meetup', icon: Coffee },
  conference: { name: 'Hội nghị', icon: Monitor }
}

export const eventLevels = {
  beginner: { name: 'Cơ bản', color: 'bg-green-100 text-green-800' },
  intermediate: { name: 'Trung cấp', color: 'bg-yellow-100 text-yellow-800' },
  advanced: { name: 'Nâng cao', color: 'bg-red-100 text-red-800' },
  'all-levels': { name: 'Mọi trình độ', color: 'bg-blue-100 text-blue-800' }
}

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Yoga Morning Flow',
    category: 'health-fitness',
    type: 'class',
    description: 'Bắt đầu ngày mới với chuỗi yoga buổi sáng giúp tăng cường năng lượng và sự tập trung. Phù hợp cho mọi trình độ từ người mới bắt đầu đến nâng cao.',
    shortDescription: 'Chuỗi yoga buổi sáng cho năng lượng tích cực',
    date: '2024-03-15',
    time: '07:00',
    duration: '90 phút',
    location: 'Studio Yoga Zen',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    price: 250000,
    originalPrice: 300000,
    currency: 'VND',
    image: '/images/events/yoga-morning.jpg',
    images: [
      '/images/events/yoga-morning-1.jpg',
      '/images/events/yoga-morning-2.jpg',
      '/images/events/yoga-morning-3.jpg'
    ],
    instructor: {
      name: 'Nguyễn Thị Anh',
      avatar: '/images/instructors/nguyen-thi-anh.jpg',
      bio: 'Giáo viên yoga với 8 năm kinh nghiệm, chuyên về Vinyasa và Hatha yoga. Đã được đào tạo tại Ấn Độ và có chứng chỉ quốc tế.',
      expertise: ['Vinyasa Yoga', 'Hatha Yoga', 'Meditation', 'Breathing Techniques']
    },
    schedule: [
      { time: '07:00', activity: 'Khởi động', description: 'Warm-up và breathing exercises', duration: 15 },
      { time: '07:15', activity: 'Sun Salutation', description: 'Chuỗi chào mặt trời cơ bản', duration: 20 },
      { time: '07:35', activity: 'Standing Poses', description: 'Các tư thế đứng và cân bằng', duration: 25 },
      { time: '08:00', activity: 'Cool Down', description: 'Thư giãn và meditation', duration: 15 },
      { time: '08:15', activity: 'Closing', description: 'Tổng kết và chia sẻ', duration: 15 }
    ],
    amenities: ['Thảm yoga', 'Nước uống', 'Khăn tắm', 'Phòng thay đồ', 'WiFi'],
    requirements: {
      age: '16+',
      level: 'all-levels',
      equipment: ['Thảm yoga (có thể thuê)', 'Quần áo thoải mái'],
      healthDeclaration: true
    },
    capacity: {
      total: 20,
      available: 8,
      minParticipants: 5
    },
    rating: 4.8,
    reviewCount: 127,
    reviews: [
      {
        id: '1',
        userId: 'user1',
        userName: 'Trần Văn Bình',
        userAvatar: '/images/avatars/user1.jpg',
        rating: 5,
        comment: 'Buổi học rất tuyệt! Cô giáo hướng dẫn rất chi tiết và tận tâm. Không gian studio rất thoải mái.',
        date: '2024-02-28',
        helpful: 12
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Lê Thị Cẩm',
        userAvatar: '/images/avatars/user2.jpg',
        rating: 4,
        comment: 'Phù hợp cho người mới bắt đầu. Cô giáo kiên nhẫn và giải thích rõ ràng.',
        date: '2024-02-25',
        helpful: 8
      }
    ],
    addOns: [
      {
        id: '1',
        name: 'Private Session 1-1',
        description: 'Buổi học riêng với giáo viên',
        price: 500000,
        type: 'private'
      },
      {
        id: '2',
        name: 'Healthy Breakfast',
        description: 'Bữa sáng lành mạnh sau buổi học',
        price: 150000,
        type: 'meal'
      }
    ],
    tags: ['yoga', 'morning', 'wellness', 'meditation'],
    status: 'upcoming',
    featured: true,
    earlyBirdDiscount: {
      percentage: 15,
      validUntil: '2024-03-10'
    },
    groupDiscount: {
      minPeople: 3,
      percentage: 10
    }
  },
  {
    id: '2',
    title: 'Workshop Nấu Ăn Việt Nam',
    category: 'culture-social',
    type: 'workshop',
    description: 'Khám phá ẩm thực Việt Nam qua workshop nấu ăn thực hành. Học cách nấu các món ăn truyền thống từ các đầu bếp chuyên nghiệp.',
    shortDescription: 'Học nấu các món ăn truyền thống Việt Nam',
    date: '2024-03-20',
    time: '14:00',
    duration: '4 giờ',
    location: 'Cooking Studio Saigon',
    address: '456 Lê Lợi, Quận 3, TP.HCM',
    price: 800000,
    currency: 'VND',
    image: '/images/events/cooking-workshop.jpg',
    images: [
      '/images/events/cooking-1.jpg',
      '/images/events/cooking-2.jpg',
      '/images/events/cooking-3.jpg'
    ],
    instructor: {
      name: 'Chef Phạm Văn Minh',
      avatar: '/images/instructors/chef-pham.jpg',
      bio: 'Đầu bếp với 15 năm kinh nghiệm, chuyên về ẩm thực Việt Nam. Từng làm việc tại các nhà hàng 5 sao và có chứng chỉ ẩm thực quốc tế.',
      expertise: ['Vietnamese Cuisine', 'Asian Fusion', 'Food Safety', 'Culinary Arts']
    },
    schedule: [
      { time: '14:00', activity: 'Giới thiệu', description: 'Làm quen và chuẩn bị nguyên liệu', duration: 30 },
      { time: '14:30', activity: 'Thực hành', description: 'Nấu các món ăn truyền thống', duration: 180 },
      { time: '17:30', activity: 'Thưởng thức', description: 'Thưởng thức thành quả và chia sẻ', duration: 30 }
    ],
    amenities: ['Nguyên liệu', 'Dụng cụ nấu ăn', 'Tạp dề', 'Công thức', 'Chứng nhận'],
    requirements: {
      age: '18+',
      level: 'beginner',
      equipment: ['Không cần mang gì'],
      healthDeclaration: false
    },
    capacity: {
      total: 12,
      available: 5,
      minParticipants: 6
    },
    rating: 4.9,
    reviewCount: 89,
    reviews: [],
    addOns: [
      {
        id: '3',
        name: 'Take-home Kit',
        description: 'Bộ nguyên liệu để thực hành tại nhà',
        price: 200000,
        type: 'equipment'
      }
    ],
    tags: ['cooking', 'vietnamese', 'culture', 'food'],
    status: 'upcoming',
    featured: false
  },
  {
    id: '3',
    title: 'Photography Masterclass',
    category: 'creative-arts',
    type: 'masterclass',
    description: 'Nâng cao kỹ năng nhiếp ảnh với chuyên gia quốc tế. Học về composition, lighting, và post-processing.',
    shortDescription: 'Lớp học nhiếp ảnh nâng cao với chuyên gia',
    date: '2024-03-25',
    time: '09:00',
    duration: '6 giờ',
    location: 'Creative Hub',
    address: '789 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
    price: 1200000,
    currency: 'VND',
    image: '/images/events/photography.jpg',
    images: [
      '/images/events/photo-1.jpg',
      '/images/events/photo-2.jpg',
      '/images/events/photo-3.jpg'
    ],
    instructor: {
      name: 'David Chen',
      avatar: '/images/instructors/david-chen.jpg',
      bio: 'Nhiếp ảnh gia chuyên nghiệp với 20 năm kinh nghiệm. Từng làm việc cho National Geographic và các tạp chí quốc tế.',
      expertise: ['Portrait Photography', 'Landscape', 'Street Photography', 'Photo Editing']
    },
    schedule: [
      { time: '09:00', activity: 'Lý thuyết', description: 'Nguyên lý nhiếp ảnh và composition', duration: 120 },
      { time: '11:00', activity: 'Thực hành', description: 'Chụp ảnh ngoài trời', duration: 180 },
      { time: '14:00', activity: 'Editing', description: 'Hậu kỳ và chỉnh sửa ảnh', duration: 120 },
      { time: '16:00', activity: 'Review', description: 'Đánh giá và góp ý', duration: 60 }
    ],
    amenities: ['Máy ảnh demo', 'Tripod', 'Lighting equipment', 'Software license', 'Certificate'],
    requirements: {
      age: '16+',
      level: 'intermediate',
      equipment: ['Máy ảnh DSLR/Mirrorless', 'Laptop'],
      healthDeclaration: false
    },
    capacity: {
      total: 8,
      available: 3,
      minParticipants: 4
    },
    rating: 4.7,
    reviewCount: 45,
    reviews: [],
    addOns: [
      {
        id: '4',
        name: 'Equipment Rental',
        description: 'Thuê máy ảnh và ống kính chuyên nghiệp',
        price: 300000,
        type: 'equipment'
      }
    ],
    tags: ['photography', 'art', 'creative', 'masterclass'],
    status: 'upcoming',
    featured: true
  },
  {
    id: '4',
    title: 'Meditation Retreat Weekend',
    category: 'health-fitness',
    type: 'retreat',
    description: 'Retreat thiền định cuối tuần tại resort yên tĩnh. Tách biệt khỏi cuộc sống bận rộn để tìm lại sự cân bằng.',
    shortDescription: 'Retreat thiền định cuối tuần tại resort',
    date: '2024-04-05',
    time: '08:00',
    duration: '2 ngày',
    location: 'Zen Resort Vũng Tàu',
    address: 'Resort Zen, Vũng Tàu',
    price: 2500000,
    currency: 'VND',
    image: '/images/events/meditation-retreat.jpg',
    images: [
      '/images/events/retreat-1.jpg',
      '/images/events/retreat-2.jpg',
      '/images/events/retreat-3.jpg'
    ],
    instructor: {
      name: 'Thích Minh Tuệ',
      avatar: '/images/instructors/thich-minh-tue.jpg',
      bio: 'Thiền sư với 25 năm kinh nghiệm, chuyên về Vipassana và Mindfulness. Đã hướng dẫn hàng nghìn người thực hành thiền.',
      expertise: ['Vipassana', 'Mindfulness', 'Buddhist Philosophy', 'Stress Management']
    },
    schedule: [
      { time: '08:00', activity: 'Check-in', description: 'Đăng ký và làm quen', duration: 60 },
      { time: '09:00', activity: 'Morning Session', description: 'Thiền buổi sáng', duration: 120 },
      { time: '11:30', activity: 'Lunch', description: 'Bữa trưa chay', duration: 90 },
      { time: '14:00', activity: 'Afternoon Session', description: 'Thiền và thảo luận', duration: 180 },
      { time: '17:30', activity: 'Evening', description: 'Thiền buổi tối', duration: 90 }
    ],
    amenities: ['Chỗ ở', 'Bữa ăn chay', 'Phòng thiền', 'Spa access', 'Yoga mats'],
    requirements: {
      age: '18+',
      level: 'all-levels',
      equipment: ['Quần áo thoải mái'],
      healthDeclaration: true
    },
    capacity: {
      total: 30,
      available: 12,
      minParticipants: 15
    },
    rating: 4.9,
    reviewCount: 203,
    reviews: [],
    addOns: [
      {
        id: '5',
        name: 'Private Room',
        description: 'Phòng riêng thay vì phòng chung',
        price: 500000,
        type: 'private'
      },
      {
        id: '6',
        name: 'Spa Treatment',
        description: 'Liệu trình spa thư giãn',
        price: 800000,
        type: 'private'
      }
    ],
    tags: ['meditation', 'retreat', 'wellness', 'mindfulness'],
    status: 'upcoming',
    featured: true,
    earlyBirdDiscount: {
      percentage: 20,
      validUntil: '2024-03-20'
    }
  },
  {
    id: '5',
    title: 'Startup Networking Event',
    category: 'business',
    type: 'meetup',
    description: 'Sự kiện networking cho startup và doanh nhân. Cơ hội kết nối, chia sẻ kinh nghiệm và tìm kiếm đối tác.',
    shortDescription: 'Networking cho startup và doanh nhân',
    date: '2024-03-18',
    time: '18:00',
    duration: '3 giờ',
    location: 'Innovation Hub',
    address: '321 Pasteur, Quận 1, TP.HCM',
    price: 300000,
    currency: 'VND',
    image: '/images/events/startup-networking.jpg',
    images: [
      '/images/events/networking-1.jpg',
      '/images/events/networking-2.jpg'
    ],
    instructor: {
      name: 'Lê Hoàng Nam',
      avatar: '/images/instructors/le-hoang-nam.jpg',
      bio: 'Founder của 3 startup thành công, mentor cho nhiều startup Việt Nam. Chuyên gia về business development và fundraising.',
      expertise: ['Startup Strategy', 'Fundraising', 'Business Development', 'Mentoring']
    },
    schedule: [
      { time: '18:00', activity: 'Registration', description: 'Đăng ký và networking tự do', duration: 30 },
      { time: '18:30', activity: 'Keynote', description: 'Bài phát biểu chính', duration: 45 },
      { time: '19:15', activity: 'Panel Discussion', description: 'Thảo luận bàn tròn', duration: 60 },
      { time: '20:15', activity: 'Networking', description: 'Networking tự do', duration: 105 }
    ],
    amenities: ['Coffee & snacks', 'Name tags', 'Business cards', 'WiFi', 'Presentation materials'],
    requirements: {
      age: '18+',
      level: 'all-levels',
      equipment: ['Business cards'],
      healthDeclaration: false
    },
    capacity: {
      total: 100,
      available: 35,
      minParticipants: 30
    },
    rating: 4.6,
    reviewCount: 67,
    reviews: [],
    addOns: [
      {
        id: '7',
        name: 'VIP Access',
        description: 'Quyền truy cập VIP với networking riêng',
        price: 500000,
        type: 'private'
      }
    ],
    tags: ['startup', 'networking', 'business', 'entrepreneurship'],
    status: 'upcoming',
    featured: false
  }
]

export const eventFilters: EventFilter[] = [
  {
    category: ['health-fitness', 'culture-social'],
    type: ['workshop', 'class'],
    priceRange: { min: 0, max: 500000 }
  },
  {
    category: ['creative-arts'],
    level: ['intermediate', 'advanced'],
    duration: ['4 giờ', '6 giờ']
  }
]

export const popularEvents = mockEvents.filter(event => event.featured)
export const upcomingEvents = mockEvents.filter(event => event.status === 'upcoming')
export const recentEvents = mockEvents.slice(0, 3) 