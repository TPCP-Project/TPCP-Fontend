// services/taskService.ts
import { http } from './httpClient'
import { Dayjs } from 'dayjs'

/* Interface & Kiểu dữ liệu Task */
export interface Task {
  task: Task
  _id: string
  title: string
  description?: string
  status: 'In_Progress' | 'Blocked' | 'Done'
  dueDate?: string | Dayjs | null
  projectId?: string | { _id: string; name: string }
  createdBy: { _id: string; username?: string; email: string }
  assignedTo?: { _id: string; username?: string; email: string }
  createdAt: string
  updatedAt: string
}

/* DTO: Request tạo & cập nhật Task */
export interface CreateTaskRequest {
  title: string
  description?: string
  projectId: string
  status?: 'In_Progress' | 'Blocked' | 'Done'
  dueDate?: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  projectId?: string
  dueDate?: string
  status?: 'In_Progress' | 'Blocked' | 'Done'
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

  // Create New Task
  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const res = await http.post('/api/tasks', data)
    // backend trả về { success: true, task: {...} }
    return res.data.task
  },

  // Update Task
  updateTask: async (taskId: string, data: UpdateTaskRequest): Promise<Task> => {
    const res = await http.put(`/api/tasks/${taskId}`, data)
    // backend trả về { success: true, task: {...} }
    return res.data.task
  },

  // Delete Task
  deleteTask: async (taskId: string): Promise<void> => {
    await http.delete(`/api/tasks/${taskId}`)
  },

  // Assign Task to User
  assignTask: async (taskId: string, userId: string): Promise<Task> => {
    const res = await http.put(`/api/tasks/${taskId}/assign`, { userId })
    // backend trả về { success: true, task: {...} }
    return res.data.task
  },
}
