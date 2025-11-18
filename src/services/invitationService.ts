import { http } from './httpClient'
import { ApiResponse } from './api'

export interface ProjectInvitation {
  _id: string
  project_id: string
  invite_code: string
  created_by: string
  expiry_date: string
  is_active: boolean
  createdAt: string
  updatedAt: string
}

export interface ProjectJoinRequest {
  _id: string
  project_id: string
  user_id: string
  invitation_id?: string
  status: 'pending' | 'accepted' | 'rejected'
  request_date: string
  processed_date?: string
  processed_by?: string
  createdAt: string
  updatedAt: string
}

export interface CreateInviteCodeRequest {
  expiryDays?: number
}

export interface SendInvitationRequest {
  inviteCode: string
  email: string | string[]
}

export interface SendInvitationResult {
  success: string[]
  failed: { email: string; reason: string }[]
  total: number
}

export interface JoinByInviteCodeRequest {
  inviteCode: string
}

export interface RejectJoinRequestRequest {
  reason?: string
}

export const invitationService = {
  // Tạo mã mời tham gia project
  createInviteCode: async (projectId: string, data: CreateInviteCodeRequest): Promise<ApiResponse<ProjectInvitation>> => {
    const response = await http.post(`/api/projects/${projectId}/invitations`, data)
    return response.data
  },

  // Gửi lời mời tham gia project qua email
  sendInvitation: async (data: SendInvitationRequest): Promise<ApiResponse<{ message: string; project_name: string; results: SendInvitationResult }>> => {
    const response = await http.post('/api/projects/invitations/send', data)
    return response.data
  },

  // Tham gia project bằng mã mời
  joinByInviteCode: async (data: JoinByInviteCodeRequest): Promise<ApiResponse<{ message: string; request_id?: string; project_name: string }>> => {
    const response = await http.post('/api/projects/join', data)
    return response.data
  },

  // Lấy danh sách mã mời của project
  getProjectInvitations: async (projectId: string): Promise<ApiResponse<ProjectInvitation[]>> => {
    const response = await http.get(`/api/projects/${projectId}/invitations`)
    return response.data
  },

  // Vô hiệu hóa mã mời
  deactivateInviteCode: async (inviteCode: string): Promise<ApiResponse<{ message: string; invite_code: string }>> => {
    const response = await http.put(`/api/projects/invitations/${inviteCode}/deactivate`)
    return response.data
  },

  // Lấy danh sách yêu cầu tham gia đang chờ xử lý
  getPendingRequests: async (projectId: string): Promise<ApiResponse<ProjectJoinRequest[]>> => {
    const response = await http.get(`/api/projects/${projectId}/join-requests`)
    return response.data
  },

  // Phê duyệt yêu cầu tham gia
  approveJoinRequest: async (requestId: string): Promise<ApiResponse<{ message: string; project_id: string; project_name: string; user_id: string }>> => {
    const response = await http.put(`/api/projects/join-requests/${requestId}/approve`)
    return response.data
  },

  // Từ chối yêu cầu tham gia
  rejectJoinRequest: async (requestId: string, data: RejectJoinRequestRequest): Promise<ApiResponse<{ message: string; project_id: string; project_name: string; user_id: string }>> => {
    const response = await http.put(`/api/projects/join-requests/${requestId}/reject`, data)
    return response.data
  }
}
