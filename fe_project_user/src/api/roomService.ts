import api from '../utils/axiosConfig'

export interface City {
  id: string
  name: string
  description: string
}

export interface Location {
  id: string
  name: string
  description: string | null
  cityId: string
  cityName: string
}

export interface Property {
  id: string
  name: string
  description: string
  locationId: string
  locationName: string
  cityId: string
  cityName: string
  coverImage?: string
}

export interface RoomInstance {
  id: string
  accommodationOptionId: string
  roomCode: string
  roomName: string
  descriptionDetails: string
  status: string
  areaInSquareMeters: number
  roomSizeName: string
  roomViewName: string
  roomFloorName: string
  bedTypeName: string
  numberOfBeds: number
  roomTypeName: string
  addOnFee: number
  propertyId: string
  propertyName: string
  propertyFullName: string | null
  medias: Array<{
    id: string
    url: string
    type: string
    description: string
    actorType: number
    actorId: string
  }>
}

export interface AccommodationOption {
  id: string
  accmodationOptionName: string
  roomTypeId: number
  roomTypeName: string
  propertyId: string
  propertyName: string
  nextUServiceId: string
  nextUServiceName: string
  capacity: number
  pricePerNight: number
  description: string
}

export interface RoomType {
  id: number
  name: string
  description: string
  accommodationOptions: any[] | null
  createdAt: string | null
  createdBy: string | null
  updatedAt: string | null
  updatedBy: string | null
}

export const roomService = {
  // Lấy danh sách cities
  getCities: async (): Promise<City[]> => {
    const response = await api.get('/api/basePosition/cities')
    return response.data.data
  },

  // Lấy danh sách locations
  getLocations: async (): Promise<Location[]> => {
    const response = await api.get('/api/basePosition/locations')
    return response.data.data
  },

  // Lấy danh sách properties
  getProperties: async (): Promise<Property[]> => {
    const response = await api.get('/api/basePosition/properties')
    return response.data.data
  },

  // Lấy danh sách room types
  getRoomTypes: async (): Promise<RoomType[]> => {
    const response = await api.get('/api/RoomType')
    return response.data
  },

  // Lấy danh sách accommodation options
  getAccommodationOptions: async (): Promise<AccommodationOption[]> => {
    const response = await api.get('/api/membership/AccommodationOptions')
    return response.data
  },

  // Lấy danh sách room instances
  getRoomInstances: async (): Promise<RoomInstance[]> => {
    const response = await api.get('/api/membership/RoomInstances')
    return response.data
  },

  // Lấy room instances theo property
  getRoomInstancesByProperty: async (propertyId: string): Promise<RoomInstance[]> => {
    const response = await api.get('/api/membership/RoomInstances')
    const allRooms = response.data
    return allRooms.filter((room: RoomInstance) => room.propertyId === propertyId)
  },

  // Lấy danh sách room instances theo location (legacy)
  getRoomInstancesByLocation: async (locationId: string): Promise<RoomInstance[]> => {
    const response = await api.get(`/api/membership/RoomInstances/by-location/${locationId}`)
    return response.data
  },

  // Lấy thông tin chi tiết accommodation option
  getAccommodationOption: async (accommodationOptionId: string): Promise<AccommodationOption> => {
    const response = await api.get(`/api/membership/AccommodationOptions/${accommodationOptionId}`)
    return response.data
  }
} 