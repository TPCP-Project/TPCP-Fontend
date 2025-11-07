// services/taskService.ts
import { http } from './httpClient'
import { Dayjs } from 'dayjs'

export type TaskStatus = 'TO_DO' | 'DRAFTING' | 'IN_REVIEW' | 'APPROVED' | 'BLOCKED'
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent'

export interface Subtask {
  _id: string
  title: string
  completed: boolean
}

export interface Task {
  _id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  sprint?: string
  labels?: string[]
  subtasks: Subtask[]
  projectId?: string | { _id: string; name: string }
  createdBy: { _id: string; username?: string; email: string }
  assignedTo?: { _id: string; username?: string; email: string }
  dueDate?: string | Dayjs | null
  completedAt?: string
  isOverdue: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTaskRequest {
  title: string
  description?: string
  projectId: string
  assignedTo: string
  status?: TaskStatus
  priority?: TaskPriority
  sprint?: string
  labels?: string[]
  dueDate?: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  dueDate?: string
  status?: TaskStatus
  priority?: TaskPriority
  sprint?: string
  labels?: string[]
  projectId?: string
}

export interface BoardColumns {
  TO_DO: Task[]
  DRAFTING: Task[]
  IN_REVIEW: Task[]
  APPROVED: Task[]
  BLOCKED: Task[]
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

  // Lấy tasks theo board (Kanban)
  getTasksByBoard: async (projectId: string, sprint?: string): Promise<BoardColumns> => {
    const params = sprint ? { sprint } : {}
    const res = await http.get(`/api/tasks/board/${projectId}`, { params })
    return res.data.columns
  },

  // Cập nhật status task (drag & drop)
  updateTaskStatus: async (taskId: string, status: TaskStatus): Promise<Task> => {
    const res = await http.put(`/api/tasks/${taskId}/status`, { status })
    return res.data.task
  },

  // Thêm subtask
  addSubtask: async (taskId: string, title: string): Promise<Task> => {
    const res = await http.post(`/api/tasks/${taskId}/subtasks`, { title })
    return res.data.task
  },

  // Cập nhật subtask
  updateSubtask: async (taskId: string, subtaskId: string, data: { title?: string; completed?: boolean }): Promise<Task> => {
    const res = await http.put(`/api/tasks/${taskId}/subtasks/${subtaskId}`, data)
    return res.data.task
  },

  // Xóa subtask
  deleteSubtask: async (taskId: string, subtaskId: string): Promise<Task> => {
    const res = await http.delete(`/api/tasks/${taskId}/subtasks/${subtaskId}`)
    return res.data.task
  },
}
