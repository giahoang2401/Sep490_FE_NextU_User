import api from './axiosConfig'

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
}

export interface RoomInstance {
  id: string
  accommodationOptionId: string
  roomCode: string
  roomName: string
  descriptionDetails: string
  status: string
  floor: string
  roomTypeName: string
  locationId: string
  locationName: string
}

export interface AccommodationOption {
  id: string
  roomTypeId: number
  roomTypeName: string
  locationId: string
  locationName: string
  nextUServiceId: string
  nextUServiceName: string
  capacity: number
  pricePerNight: number
  description: string
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

  // Lấy danh sách room instances theo location
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