import { http } from './httpClient'
import { ApiResponse } from './api'

export interface ChatMessage {
  _id: string
  conversation_id: string
  sender_id: {
    _id: string
    name: string
    username: string
    email: string
    avatar: {
      url: string
    }
  }
  content: string
  message_type: 'text' | 'image' | 'file' | 'system' | 'announcement'
  attachments: Array<{
    filename: string
    original_name: string
    url: string
    mimetype: string
    size: number
    uploaded_at: string
  }>
  reply_to?: {
    _id: string
    content: string
    sender_id: string
  }
  status: 'sent' | 'delivered' | 'read' | 'deleted'
  read_by: Array<{
    user_id: string
    read_at: string
  }>
  reactions: Array<{
    user_id: string
    emoji: string
    reacted_at: string
  }>
  mentions: Array<{
    user_id: string
    username: string
    position: number
  }>
  metadata: {
    is_edited: boolean
    edited_at?: string
    edit_count: number
    is_pinned: boolean
    pinned_by?: string
    pinned_at?: string
  }
  createdAt: string
  updatedAt: string
}

export interface ChatParticipant {
  _id: string
  conversation_id: string
  user_id: {
    _id: string
    name: string
    username: string
    email: string
    avatar: {
      url: string
    }
  }
  role: 'admin' | 'moderator' | 'member'
  permissions: {
    can_send_messages: boolean
    can_send_files: boolean
    can_invite_members: boolean
    can_remove_members: boolean
    can_edit_conversation: boolean
    can_delete_messages: boolean
    can_pin_messages: boolean
  }
  status: 'active' | 'muted' | 'left' | 'removed'
  joined_at: string
  invited_by?: string
  left_at?: string
  left_reason?: string
  settings: {
    notifications: {
      message_notifications: boolean
      mention_notifications: boolean
      sound_notifications: boolean
      email_notifications: boolean
    }
    privacy: {
      show_online_status: boolean
      show_read_receipts: boolean
      show_typing_status: boolean
    }
  }
  stats: {
    total_messages_sent: number
    last_message_at?: string
    last_seen_at: string
    unread_count: number
  }
  metadata: {
    is_muted: boolean
    muted_until?: string
    mute_reason?: string
  }
  createdAt: string
  updatedAt: string
}

export interface Conversation {
  _id: string
  type: 'project' | 'direct'
  project_id?: {
    _id: string
    name: string
    description: string
  }
  name: string
  description?: string
  avatar: {
    url: string
    filename?: string
    mimetype?: string
    size?: number
    uploadedAt: string
  }
  created_by: {
    _id: string
    name: string
    username: string
    email: string
    avatar: {
      url: string
    }
  }
  settings: {
    allow_member_invite: boolean
    allow_file_sharing: boolean
    allow_message_edit: boolean
    allow_message_delete: boolean
    message_retention_days: number
  }
  status: 'active' | 'archived' | 'deleted'
  stats: {
    total_messages: number
    total_participants: number
    last_message_at?: string
    last_message_by?: string
  }
  metadata: {
    is_encrypted: boolean
    encryption_key?: string
  }
  userRole?: string
  userPermissions?: {
    can_send_messages: boolean
    can_send_files: boolean
    can_invite_members: boolean
    can_remove_members: boolean
    can_edit_conversation: boolean
    can_delete_messages: boolean
    can_pin_messages: boolean
  }
  unreadCount?: number
  createdAt: string
  updatedAt: string
}

export interface CreateProjectConversationRequest {
  name?: string
  description?: string
}

export interface CreateDirectConversationRequest {
  targetUserId: string
}

export interface SendMessageRequest {
  content: string
  message_type?: 'text' | 'image' | 'file' | 'system' | 'announcement'
  reply_to?: string
  attachments?: Array<{
    filename: string
    original_name: string
    url: string
    mimetype: string
    size: number
  }>
}

export interface UpdateMessageRequest {
  content: string
}

export interface AddReactionRequest {
  emoji: string
}

export interface RemoveReactionRequest {
  emoji: string
}

export const chatService = {
  // Tạo conversation cho project
  createProjectConversation: async (
    projectId: string,
    data: CreateProjectConversationRequest
  ): Promise<ApiResponse<Conversation>> => {
    const response = await http.post(`/api/chat/project/${projectId}/conversation`, data)
    return response.data
  },

  // Tạo conversation 1vs1
  createDirectConversation: async (
    data: CreateDirectConversationRequest
  ): Promise<ApiResponse<Conversation>> => {
    const response = await http.post('/api/chat/direct', data)
    return response.data
  },

  // Lấy danh sách conversation của user
  getUserConversations: async (
    params?: {
      type?: 'project' | 'direct'
      page?: number
      limit?: number
    }
  ): Promise<ApiResponse<{
    conversations: Conversation[]
    pagination: {
      currentPage: number
      totalPages: number
      totalConversations: number
      hasNext: boolean
      hasPrev: boolean
    }
  }>> => {
    const response = await http.get('/api/chat/conversations', { params })
    return response.data
  },

  // Lấy thông tin chi tiết conversation
  getConversationById: async (conversationId: string): Promise<ApiResponse<Conversation>> => {
    const response = await http.get(`/api/chat/conversations/${conversationId}`)
    return response.data
  },

  // Lấy danh sách messages trong conversation
  getConversationMessages: async (
    conversationId: string,
    params?: {
      page?: number
      limit?: number
      before?: string
    }
  ): Promise<ApiResponse<{
    messages: ChatMessage[]
    pagination: {
      currentPage: number
      hasMore: boolean
    }
  }>> => {
    const response = await http.get(`/api/chat/conversations/${conversationId}/messages`, { params })
    return response.data
  },

  // Gửi message
  sendMessage: async (
    conversationId: string,
    data: SendMessageRequest
  ): Promise<ApiResponse<ChatMessage>> => {
    const response = await http.post(`/api/chat/conversations/${conversationId}/messages`, data)
    return response.data
  },

  // Cập nhật message
  updateMessage: async (
    messageId: string,
    data: UpdateMessageRequest
  ): Promise<ApiResponse<ChatMessage>> => {
    const response = await http.put(`/api/chat/messages/${messageId}`, data)
    return response.data
  },

  // Xóa message
  deleteMessage: async (messageId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await http.delete(`/api/chat/messages/${messageId}`)
    return response.data
  },

  // Đánh dấu đã đọc messages
  markAsRead: async (conversationId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await http.put(`/api/chat/conversations/${conversationId}/read`)
    return response.data
  },

  // Thêm reaction cho message
  addReaction: async (
    messageId: string,
    data: AddReactionRequest
  ): Promise<ApiResponse<ChatMessage>> => {
    const response = await http.post(`/api/chat/messages/${messageId}/reactions`, data)
    return response.data
  },

  // Xóa reaction
  removeReaction: async (
    messageId: string,
    data: RemoveReactionRequest
  ): Promise<ApiResponse<ChatMessage>> => {
    const response = await http.delete(`/api/chat/messages/${messageId}/reactions`, { data })
    return response.data
  },

  // Lấy danh sách participants trong conversation
  getConversationParticipants: async (
    conversationId: string
  ): Promise<ApiResponse<{ participants: ChatParticipant[] }>> => {
    const response = await http.get(`/api/chat/conversations/${conversationId}/participants`)
    return response.data
  },

  // Rời khỏi conversation
  leaveConversation: async (conversationId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await http.delete(`/api/chat/conversations/${conversationId}/leave`)
    return response.data
  }
}
