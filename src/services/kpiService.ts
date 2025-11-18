import { http } from './httpClient'

export interface TaskMetrics {
  totalTasksAssigned: number
  tasksCompleted: number
  tasksInProgress: number
  tasksBlocked: number
  tasksOverdue: number
  completionRate: number
  onTimeRate: number
  averageCompletionTime: number

}

export interface KPI {
  taskMetrics: TaskMetrics
  overallScore: number
  status: 'Good' | 'Warning' | 'Critical'

}

export interface Employee {
  _id: string
  name: string
  email: string
  username?: string
}

export interface KPIMemberData {
  employee: Employee
  role: 'owner' | 'admin' | 'member'
  kpi: KPI

}


export interface ProjectKPIDashboard {
  projectId: string
  month: string
  members: KPIMemberData[]

}

export interface CalculateKPIRequest {
  userId: string
  projectId: string
  month: string

}

export const kpiService = {
  calculateKPI: async (data: CalculateKPIRequest): Promise<{ kpi: any }> => {
    const res = await http.post('/api/kpi/calculate', data)
    return res.data

  },

  getProjectKPIDashboard: async (projectId: string, month: string): Promise<ProjectKPIDashboard> => {
    const res = await http.get(`/api/kpi/project/${projectId}/dashboard`, {
      params: { month }
    })
    return res.data.data
    
  },
}
