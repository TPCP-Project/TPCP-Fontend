import React, { useState, useEffect } from 'react'
import { message, Spin, Button, Select } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core'
import { Task, TaskStatus, BoardColumns, taskService } from '../../services/taskService'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'

interface KanbanBoardProps {
  projectId: string
  userRole?: string
  onTaskClick: (task: Task) => void
  onCreateTask: () => void
}

const columnOrder: TaskStatus[] = ['TO_DO', 'DRAFTING', 'IN_REVIEW', 'APPROVED', 'BLOCKED']

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projectId,
  userRole,
  onTaskClick,
  onCreateTask,
}) => {
  const [columns, setColumns] = useState<BoardColumns>({
    TO_DO: [],
    DRAFTING: [],
    IN_REVIEW: [],
    APPROVED: [],
    BLOCKED: [],
  })
  const [loading, setLoading] = useState(false)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [selectedSprint, setSelectedSprint] = useState<string | undefined>(undefined)

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true)
    try {
      const data = await taskService.getTasksByBoard(projectId, selectedSprint)
      setColumns(data)
    } catch (err) {
      console.error(err)
      message.error('Không thể tải danh sách tasks!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (projectId) {
      fetchTasks()
    }
  }, [projectId, selectedSprint])

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    // Find the task being dragged
    for (const column of Object.values(columns)) {
      const task = column.find(t => t._id === active.id)
      if (task) {
        setActiveTask(task)
        break
      }
    }
  }

  // Handle drag over (visual feedback)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // If dropping over a column
    if (columnOrder.includes(overId as TaskStatus)) {
      return
    }

    // If dropping over a task
    // You can add visual feedback here if needed
  }

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    let newStatus: TaskStatus | null = null

    // Check if dropped over a column
    if (columnOrder.includes(over.id as TaskStatus)) {
      newStatus = over.id as TaskStatus
    } else {
      // Dropped over a task - find which column it's in
      for (const [columnId, tasks] of Object.entries(columns)) {
        if (tasks.some(t => t._id === over.id)) {
          newStatus = columnId as TaskStatus
          break
        }
      }
    }

    if (!newStatus) return

    // Find the task and its current status
    let task: Task | undefined
    let currentStatus: TaskStatus | undefined

    for (const [columnId, tasks] of Object.entries(columns)) {
      const foundTask = tasks.find(t => t._id === taskId)
      if (foundTask) {
        task = foundTask
        currentStatus = columnId as TaskStatus
        break
      }
    }

    if (!task || !currentStatus || currentStatus === newStatus) return

    // Optimistic update
    setColumns(prev => {
      const newColumns = { ...prev }
      newColumns[currentStatus] = newColumns[currentStatus].filter(t => t._id !== taskId)
      newColumns[newStatus].push({ ...task, status: newStatus })
      return newColumns
    })

    // Update on server
    try {
      await taskService.updateTaskStatus(taskId, newStatus)
      message.success('Cập nhật trạng thái thành công!')
    } catch (err) {
      console.error(err)
      message.error('Cập nhật trạng thái thất bại!')
      // Revert on error
      fetchTasks()
    }
  }

  if (loading && !columns.TO_DO.length) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    )
  }

  // Lấy danh sách unique users từ tasks
  const getTeamMembers = () => {
    const usersMap = new Map()
    Object.values(columns).flat().forEach(task => {
      if (task.assignedTo) {
        usersMap.set(task.assignedTo._id, task.assignedTo)
      }
    })
    return Array.from(usersMap.values())
  }

  const teamMembers = getTeamMembers()

  return (
    <div>
      {/* Header giống Jira */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Board</h2>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Team Avatars */}
          {teamMembers.length > 0 && (
            <div style={{ display: 'flex', marginRight: 8 }}>
              {teamMembers.slice(0, 4).map((member, idx) => (
                <div
                  key={member._id}
                  style={{
                    marginLeft: idx > 0 ? -8 : 0,
                    zIndex: 10 - idx,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: '#1890ff',
                      border: '2px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                    title={member.username || member.email}
                  >
                    {member.username?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                  </div>
                </div>
              ))}
              {teamMembers.length > 4 && (
                <div
                  style={{
                    marginLeft: -8,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: '#f5f5f5',
                    border: '2px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#595959',
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  +{teamMembers.length - 4}
                </div>
              )}
            </div>
          )}

          <Button icon={<ReloadOutlined />} onClick={fetchTasks}>
            Refresh
          </Button>
          {(userRole === 'owner' || userRole === 'admin') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreateTask}>
              Create
            </Button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
      >
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            paddingBottom: 20,
          }}
        >
          {columnOrder.map((columnId) => (
            <KanbanColumn
              key={columnId}
              id={columnId}
              title={columnId}
              tasks={columns[columnId]}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
