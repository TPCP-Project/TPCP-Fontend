import { http } from './httpClient'
import { ApiResponse } from './api'

/* --------------------- INTERFACE PROJECT SETTINGS --------------------- */
export interface ProjectSettings {
  allowInvitationByMembers: boolean
  requireApprovalForJoining: boolean
  autoDeletePendingRequests?: number
}

/* --------------------- INTERFACE PROJECT --------------------- */
export interface Project {
  _id: string
  name: string
  description: string
  status: 'active' | 'completed' | 'archived'
  auto_approve_members: boolean
  settings: ProjectSettings
  createdAt: string
  updatedAt: string
  owner_id: string
  userRole?: string
  userPermissions?: {
    canInvite: boolean
    canApproveMembers: boolean
    canManageTasks: boolean
  }
}

/* --------------------- REQUEST TYPES --------------------- */
export interface CreateProjectRequest {
  name: string
  description: string
  auto_approve_members: boolean
  settings: ProjectSettings
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  status?: 'active' | 'completed' | 'archived'
  auto_approve_members?: boolean
  settings?: Partial<ProjectSettings>
}

export interface GetProjectsParams {
  status?: 'active' | 'completed' | 'archived'
  page?: number
  limit?: number
}

/* --------------------- USER INFO TYPE --------------------- */
export interface UserInfo {
  _id: string
  name: string
  email: string
  avatar?: {
    url: string
    filename?: string
    mimetype?: string
    size?: number
    uploadedAt?: string
  }
}

/* --------------------- PROJECT MEMBER TYPE --------------------- */
export interface ProjectMember {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any
  _id: string
  project_id: string
  user_id: UserInfo                // ✅ FIXED: là object, không phải string
  role: 'owner' | 'admin' | 'member'
  permissions: {
    canInvite: boolean
    canApproveMembers: boolean
    canManageTasks: boolean
  }
  invited_by?: UserInfo
  invitation_id?: string
  joined_at: string
  status: 'active' | 'inactive'
  createdAt?: string
  updatedAt?: string
}

/* --------------------- SERVICE --------------------- */
export const projectService = {
  // 🟢 Tạo project mới
  createProject: async (data: CreateProjectRequest): Promise<ApiResponse<Project>> => {
    const response = await http.post('/api/projects', data)
    return response.data
  },

  // 🟢 Lấy danh sách projects của user
  getProjects: async (
    params?: GetProjectsParams
  ): Promise<ApiResponse<{ projects: Project[]; total: number; page: number; limit: number }>> => {
    const response = await http.get('/api/projects', { params })
    return response.data
  },

  // 🟢 Lấy thông tin chi tiết project
  getProjectById: async (projectId: string): Promise<ApiResponse<Project>> => {
    const response = await http.get(`/api/projects/${projectId}`)
    return response.data
  },

  // 🟢 Cập nhật thông tin project
  updateProject: async (projectId: string, data: UpdateProjectRequest): Promise<ApiResponse<Project>> => {
    const response = await http.put(`/api/projects/${projectId}`, data)
    return response.data
  },

  // 🟢 Xóa project
  deleteProject: async (projectId: string): Promise<ApiResponse<void>> => {
    const response = await http.delete(`/api/projects/${projectId}`)
    return response.data
  },

  // 🟢 Lấy danh sách thành viên của project
  getProjectMembers: async (projectId: string): Promise<ProjectMember[]> => {
    const response = await http.get(`/api/projects/${projectId}/members`)
    // ✅ Backend trả: { success, data: { members: [...] } }
    return response.data?.data?.members || []
  },

  // 🟢 Xóa thành viên khỏi project
  removeProjectMember: async (memberId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await http.delete(`/api/projects/members/${memberId}`)
    return response.data
  },
}
