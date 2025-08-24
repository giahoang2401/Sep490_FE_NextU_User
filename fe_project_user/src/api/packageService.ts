import api from '@/utils/axiosConfig'

export interface PlanDuration {
  planDurationId: number
  discountRate: number
  planDurationUnit: string
  planDurationValue: string
  planDurationDescription: string
}

export interface Accommodation {
  accomodationId: string
  accomodationDescription: string
  roomType: string
}

export interface Entitlement {
  entitlementId: string
  nextUSerName: string
}

export interface BasicPlan {
  id: string
  code: string
  name: string
  description: string
  price: number
  verifyBuy: boolean
  nextUServiceId: string
  nextUServiceName: string
  serviceType: number
  planCategoryId: number
  planCategoryName: string
  planLevelId: number
  planLevelName: string
  targetAudienceId: number
  targetAudienceName: string
  propertyId: string
  propertyName: string
  acomodations: Accommodation[]
  entitlements: Entitlement[]
  planDurations: PlanDuration[]
  planSource: string
}

export interface PackageDuration {
  durationId: number
  discountRate: number
}

export interface PackageDurationDetail {
  id: number
  value: number
  unit: string
  description: string
}

export interface ComboPlan {
  id: string
  code: string
  name: string
  description: string
  totalPrice: number
  discountRate: number
  isSuggested: boolean
  verifyBuy: boolean
  propertyId: string
  propertyName: string
  basicPlanCategoryId: number
  basicPlanCategoryName: string
  planLevelId: number
  planLevelName: string
  targetAudienceId: number
  targetAudienceName: string
  basicPlanIds: string[]
  packageDurations: PackageDuration[]
}

export const packageService = {
  // Lấy danh sách basic plans
  getBasicPlans: async (): Promise<BasicPlan[]> => {
    try {
      const response = await api.get('/api/membership/BasicPlans')
      return response.data
    } catch (error) {
      console.error('Error fetching basic plans:', error)
      return []
    }
  },

  // Lấy danh sách combo plans
  getComboPlans: async (): Promise<ComboPlan[]> => {
    try {
      const response = await api.get('/api/membership/ComboPlans')
      return response.data
    } catch (error) {
      console.error('Error fetching combo plans:', error)
      return []
    }
  },

  // Lấy chi tiết package duration
  getPackageDuration: async (durationId: number): Promise<PackageDurationDetail | null> => {
    try {
      const response = await api.get(`/api/membership/PackageDuration/${durationId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching package duration:', error)
      return null
    }
  },

  // Lấy basic plans chứa phòng cụ thể
  getBasicPlansForRoom: (basicPlans: BasicPlan[], accommodationOptionId: string, propertyId?: string): BasicPlan[] => {
    console.log('🔍 Debug: Looking for room with accommodationOptionId:', accommodationOptionId)
    console.log('🔍 Debug: Available basic plans:', basicPlans.length)
    if (propertyId) {
      console.log('🔍 Debug: Filtering by propertyId:', propertyId)
    }
    
    let filteredPlans = basicPlans
    
    // Filter by property if provided
    if (propertyId) {
      filteredPlans = basicPlans.filter(plan => plan.propertyId === propertyId)
      console.log('🔍 Debug: After property filter:', filteredPlans.length, 'plans')
    }
    
    const matchingPlans = filteredPlans.filter(plan => {
      const hasRoom = plan.acomodations.some(acc => {
        console.log('🔍 Debug: Comparing', acc.accomodationId, 'with', accommodationOptionId)
        return acc.accomodationId === accommodationOptionId
      })
      if (hasRoom) {
        console.log('✅ Found matching plan:', plan.name, 'for room:', accommodationOptionId)
      }
      return hasRoom
    })
    
    console.log('🔍 Debug: Found', matchingPlans.length, 'matching plans')
    return matchingPlans
  },

  // Lấy combo plans chứa basic plans có phòng
  getComboPlansForRoom: (comboPlans: ComboPlan[], basicPlansForRoom: BasicPlan[], propertyId?: string): ComboPlan[] => {
    console.log('🔍 Debug: Looking for combo plans for', basicPlansForRoom.length, 'basic plans')
    console.log('🔍 Debug: Available combo plans:', comboPlans.length)
    
    let filteredComboPlans = comboPlans
    
    // Filter by property if provided
    if (propertyId) {
      filteredComboPlans = comboPlans.filter(combo => combo.propertyId === propertyId)
      console.log('🔍 Debug: After property filter:', filteredComboPlans.length, 'combo plans')
    }
    
    const basicPlanIds = basicPlansForRoom.map(plan => plan.id)
    console.log('🔍 Debug: Basic plan IDs to match:', basicPlanIds)
    
    const matchingCombos = filteredComboPlans.filter(combo => {
      const hasBasicPlan = combo.basicPlanIds.some(basicId => basicPlanIds.includes(basicId))
      if (hasBasicPlan) {
        console.log('✅ Found matching combo:', combo.name, 'for basic plans:', basicPlanIds)
      }
      return hasBasicPlan
    })
    
    console.log('🔍 Debug: Found', matchingCombos.length, 'matching combos')
    return matchingCombos
  }
}
