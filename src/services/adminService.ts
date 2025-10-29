import { http } from './httpClient'
import { ApiResponse } from './api'

// INTERFACES

export interface User {
  _id: string
  name: string
  username: string
  email: string
  role: 'admin' | 'manager' | 'employee'
  accountStatus: 'active' | 'inactive' | 'banned'
  isBanned: boolean
  bannedAt?: string
  banReason?: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface SubscriptionPackage {
  _id: string
  name: string
  description: string
  price: number
  currency: string
  duration: {
    value: number
    unit: 'days' | 'months' | 'years'
  }
  features: Array<{
    name: string
    value: string
    enabled: boolean
  }>
  limits: {
    maxProjects: number
    maxMembers: number
    maxStorage: number
    maxTasks: number
  }
  isActive: boolean
  isPopular: boolean
  createdAt: string
  updatedAt: string
}

export interface Purchase {
  _id: string
  userId: User
  packageId: SubscriptionPackage
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod?: string
  transactionId?: string
  startDate?: string
  endDate?: string
  isActive: boolean
  autoRenew: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface AdminNotification {
  _id: string
  type:
    | 'new_purchase'
    | 'user_registration'
    | 'system_alert'
    | 'payment_failed'
    | 'subscription_expired'
  title: string
  message: string
  relatedUser?: User
  relatedPurchase?: Purchase
  data?: any
  isRead: boolean
  readAt?: string
  createdAt: string
}

export interface DashboardStats {
  users: {
    total: number
    active: number
    banned: number
  }
  purchases: {
    total: number
    pending: number
    completed: number
  }
  revenue: {
    total: number
  }
  subscriptions: {
    active: number
  }
}

//  ADMIN SERVICE

export const adminService = {
  //  USER MANAGEMENT

  getAllUsers: async (params?: {
    page?: number
    limit?: number
    role?: string
    accountStatus?: string
    search?: string
  }): Promise<ApiResponse<{ users: User[]; total: number; page: number; pages: number }>> => {
    const response = await http.get('/api/admin/users', { params })
    return response.data
  },

  getUserDetails: async (
    userId: string
  ): Promise<ApiResponse<{ user: User; purchases: Purchase[] }>> => {
    const response = await http.get(`/api/admin/users/${userId}`)
    return response.data
  },

  updateUserRole: async (userId: string, role: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await http.put(`/api/admin/users/${userId}/role`, { role })
    return response.data
  },

  banUser: async (
    userId: string,
    ban: boolean,
    reason?: string
  ): Promise<ApiResponse<{ user: User }>> => {
    const response = await http.put(`/api/admin/users/${userId}/ban`, { ban, reason })
    return response.data
  },

  sendWarningEmail: async (
    userId: string,
    subject: string,
    message: string
  ): Promise<ApiResponse<void>> => {
    const response = await http.post(`/api/admin/users/${userId}/send-warning`, {
      subject,
      message,
    })
    return response.data
  },

  // PACKAGE MANAGEMENT

  createPackage: async (
    packageData: Partial<SubscriptionPackage>
  ): Promise<ApiResponse<{ package: SubscriptionPackage }>> => {
    const response = await http.post('/api/admin/packages', packageData)
    return response.data
  },

  getAllPackages: async (params?: {
    isActive?: boolean
  }): Promise<ApiResponse<{ packages: SubscriptionPackage[] }>> => {
    const response = await http.get('/api/admin/packages', { params })
    return response.data
  },

  updatePackage: async (
    packageId: string,
    updates: Partial<SubscriptionPackage>
  ): Promise<ApiResponse<{ package: SubscriptionPackage }>> => {
    const response = await http.put(`/api/admin/packages/${packageId}`, updates)
    return response.data
  },

  deletePackage: async (packageId: string): Promise<ApiResponse<void>> => {
    const response = await http.delete(`/api/admin/packages/${packageId}`)
    return response.data
  },

  // =================== PURCHASE MANAGEMENT ===================

  getAllPurchases: async (params?: {
    page?: number
    limit?: number
    status?: string
    userId?: string
  }): Promise<
    ApiResponse<{ purchases: Purchase[]; total: number; page: number; pages: number }>
  > => {
    const response = await http.get('/api/admin/purchases', { params })
    return response.data
  },

  updatePurchaseStatus: async (
    purchaseId: string,
    status: string,
    notes?: string
  ): Promise<ApiResponse<{ purchase: Purchase }>> => {
    const response = await http.put(`/api/admin/purchases/${purchaseId}/status`, { status, notes })
    return response.data
  },

  // =================== NOTIFICATIONS ===================

  getAdminNotifications: async (params?: {
    page?: number
    limit?: number
    isRead?: boolean
  }): Promise<
    ApiResponse<{
      notifications: AdminNotification[]
      total: number
      unreadCount: number
      page: number
      pages: number
    }>
  > => {
    const response = await http.get('/api/admin/notifications', { params })
    return response.data
  },

  markNotificationAsRead: async (
    notificationId: string
  ): Promise<ApiResponse<{ notification: AdminNotification }>> => {
    const response = await http.put(`/api/admin/notifications/${notificationId}/read`)
    return response.data
  },

  // =================== DASHBOARD ===================

  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await http.get('/api/admin/dashboard/stats')
    return response.data
  },
}
