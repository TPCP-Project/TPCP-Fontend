// services/profileService.ts
import { http } from './httpClient'

export interface ProfileData {
  _id?: string
  user_id?: string
  full_name: string
  nickname?: string
  phone_number?: string
  date_of_birth?: string | Date
  gender?: 'male' | 'female' | 'other'
  user_language?: string
  user_timezone?: string
  address?: {
    street?: string
    ward?: string
    district?: string
    city?: string
    country?: string
    postal_code?: string
  }
  occupation?: {
    job_title?: string
    company?: string
    industry?: string
    experience_years?: number
  }
  education?: {
    degree?: string
    school?: string
    graduation_year?: number
  }
  skills?: Array<{
    name: string
    level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  }>
  interests?: string[]
  social_links?: {
    website?: string
    linkedin?: string
    github?: string
    twitter?: string
    facebook?: string
  }
  avatar?: {
    url?: string
    filename?: string
    mimetype?: string
    size?: number
    uploadedAt?: string
  }
  cover_image?: {
    url?: string
    filename?: string
    mimetype?: string
    size?: number
    uploadedAt?: string
  }
  bio?: string
  privacy_settings?: {
    show_phone?: boolean
    show_email?: boolean
    show_address?: boolean
    show_social_links?: boolean
    show_occupation?: boolean
  }
  is_public?: boolean
  is_completed?: boolean
  profile_views?: number
  completion_percentage?: number
  createdAt?: string
  updatedAt?: string
}

export const profileService = {
  // Lấy profile của user hiện tại
  getMyProfile: async (): Promise<ProfileData> => {
    const res = await http.get('/api/profile')
    return res.data.data
  },

  // Lấy profile của user khác
  getProfileById: async (userId: string): Promise<ProfileData> => {
    const res = await http.get(`/api/profile/${userId}`)
    return res.data.data
  },

  // Cập nhật profile
  updateProfile: async (data: Partial<ProfileData>): Promise<ProfileData> => {
    const res = await http.put('/api/profile', data)
    return res.data.data
  },

  // Cập nhật avatar
  updateAvatar: async (avatar: string): Promise<ProfileData> => {
    const res = await http.put('/api/profile/avatar', { avatar })
    return res.data.data
  },

  // Cập nhật cover image
  updateCoverImage: async (cover_image: string): Promise<ProfileData> => {
    const res = await http.put('/api/profile/cover', { cover_image })
    return res.data.data
  },

  // Cập nhật privacy settings
  updatePrivacySettings: async (privacy_settings: ProfileData['privacy_settings']): Promise<ProfileData> => {
    const res = await http.put('/api/profile/privacy', { privacy_settings })
    return res.data.data
  },

  // Tìm kiếm profiles
  searchProfiles: async (query: string, page = 1, limit = 10) => {
    const res = await http.get('/api/profile/search', {
      params: { q: query, page, limit }
    })
    return res.data.data
  },

  // Lấy thống kê profile
  getProfileStats: async () => {
    const res = await http.get('/api/profile/stats')
    return res.data.data
  },

  // Xóa profile
  deleteProfile: async () => {
    const res = await http.delete('/api/profile')
    return res.data
  }
}
