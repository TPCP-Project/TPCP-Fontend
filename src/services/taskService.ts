// services/taskService.ts
import { http } from './httpClient'
import { Dayjs } from 'dayjs'

export interface Task {
  dueDate?: string | Dayjs | null
  _id: string
  title: string
  description?: string
  status: 'In_Progress' | 'Blocked' | 'Done'
  projectId?: string | { _id: string; name: string }
  createdBy: { _id: string; username?: string; email: string }
  assignedTo?: { _id: string; username?: string; email: string }
  createdAt: string
  updatedAt: string
}

export interface CreateTaskRequest {
  title: string
  description?: string
  projectId: string
  status?: 'In_Progress' | 'Blocked' | 'Done'
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  dueDate?: string
  status?: 'In_Progress' | 'Blocked' | 'Done'
  projectId?: string
}

export const taskService = {
  // Lấy toàn bộ task
  getTasks: async (): Promise<Task[]> => {
    const res = await http.get('/api/tasks')
    // backend trả về { success: true, tasks: [...] }
    return res.data.tasks
  },

  // Lấy chi tiết task theo ID
  getTaskById: async (taskId: string): Promise<Task> => {
    const res = await http.get(`/api/tasks/${taskId}`)
    // backend trả về { success: true, task: {...} }
    return res.data.task
  },

  // Tạo task mới
  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const res = await http.post('/api/tasks', data)
    return res.data.task
  },

  // Cập nhật task
  updateTask: async (taskId: string, data: UpdateTaskRequest): Promise<Task> => {
    const res = await http.put(`/api/tasks/${taskId}`, data)
    return res.data.task
  },

  // Xóa task
  deleteTask: async (taskId: string): Promise<void> => {
    await http.delete(`/api/tasks/${taskId}`)
  },
}
