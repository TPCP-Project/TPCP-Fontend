import React, { useState } from 'react'
import { Card, Select, message } from 'antd'
import { KanbanBoard } from '../../components/kanban/KanbanBoard'
import { Task } from '../../services/taskService'
import { projectService } from '../../services/projectService'
import CreateTaskModal from '../../components/modals/CreateTaskModal'
import TaskDetail from '../../components/TaskDetail'

export default function KanbanView() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch projects on mount
  React.useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      try {
        const res = await projectService.getProjects({ status: 'active', page: 1, limit: 100 })
        setProjects(res.data.projects || [])
        // Auto-select first project
        if (res.data.projects && res.data.projects.length > 0) {
          setSelectedProjectId(res.data.projects[0]._id)
        }
      } catch (err) {
        console.error(err)
        message.error('Không thể tải danh sách dự án!')
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
  }

  const handleCreateTask = () => {
    setShowCreateModal(true)
  }

  const handleTaskCreated = () => {
    setShowCreateModal(false)
    // The board will refresh automatically
  }

  // If viewing task detail
  if (selectedTask) {
    return (
      <TaskDetail
        taskId={selectedTask._id}
        onBack={() => setSelectedTask(null)}
      />
    )
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Project Selector */}
      <div style={{ marginBottom: 20 }}>
        <Select
          style={{ width: 300 }}
          placeholder="Select a project"
          value={selectedProjectId}
          onChange={setSelectedProjectId}
          loading={loading}
        >
          {projects.map(p => (
            <Select.Option key={p._id} value={p._id}>
              {p.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* Kanban Board */}
      {selectedProjectId && (
        <Card bordered={false}>
          <KanbanBoard
            projectId={selectedProjectId}
            onTaskClick={handleTaskClick}
            onCreateTask={handleCreateTask}
          />
        </Card>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleTaskCreated}
        />
      )}
    </div>
  )
}
