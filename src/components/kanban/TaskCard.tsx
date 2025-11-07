import React from 'react'
import { Card, Avatar, Tag } from 'antd'
import { ClockCircleOutlined, CheckSquareOutlined } from '@ant-design/icons'
import { Task } from '../../services/taskService'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import dayjs from 'dayjs'

interface TaskCardProps {
  task: Task
  onClick?: () => void
}

// Màu avatar theo user (giống Jira)
const getAvatarColor = (username?: string, email?: string) => {
  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2']
  const str = username || email || ''
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'pointer',
  }

  // Tính subtasks progress
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0

  // Check if overdue
  const isOverdue = task.dueDate && dayjs(task.dueDate).isBefore(dayjs()) && task.status !== 'APPROVED'

  const taskId = task._id.slice(-6).toUpperCase()
  const avatarColor = task.assignedTo
    ? getAvatarColor(task.assignedTo.username, task.assignedTo.email)
    : '#d9d9d9'

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        hoverable
        size="small"
        onClick={onClick}
        styles={{ body: { padding: 12 } }}
        style={{
          marginBottom: 10,
          borderRadius: 8,
          border: task.assignedTo ? `3px solid ${avatarColor}` : '1px solid #e8e8e8',
          boxShadow: isDragging
            ? '0 8px 16px rgba(0,0,0,0.15)'
            : '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Task Title */}
        <div style={{
          marginBottom: 10,
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '20px',
          color: '#262626'
        }}>
          {task.title}
        </div>

        {/* Bottom Row: Subtasks, Due Date, Task ID, Avatar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Subtasks */}
            {totalSubtasks > 0 && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CheckSquareOutlined style={{
                  marginRight: 4,
                  fontSize: 14,
                  color: completedSubtasks === totalSubtasks ? '#52c41a' : '#8c8c8c'
                }} />
                <span style={{
                  fontSize: 12,
                  color: '#595959',
                  fontWeight: 500
                }}>
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </div>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: isOverdue ? '#fff1f0' : '#f5f5f5',
                padding: '2px 8px',
                borderRadius: 4,
                border: isOverdue ? '1px solid #ffccc7' : 'none'
              }}>
                <ClockCircleOutlined style={{
                  marginRight: 4,
                  fontSize: 12,
                  color: isOverdue ? '#ff4d4f' : '#8c8c8c'
                }} />
                <span style={{
                  fontSize: 11,
                  color: isOverdue ? '#ff4d4f' : '#595959',
                  fontWeight: isOverdue ? 600 : 400
                }}>
                  {dayjs(task.dueDate).format('DD MMM')}
                </span>
              </div>
            )}

            {/* Task ID */}
            <Tag
              color="blue"
              style={{
                fontSize: 11,
                margin: 0,
                fontWeight: 500
              }}
            >
              {taskId}
            </Tag>
          </div>

          {/* Avatar */}
          {task.assignedTo && (
            <Avatar
              size={28}
              style={{
                backgroundColor: avatarColor,
                fontWeight: 600,
                fontSize: 12
              }}
            >
              {task.assignedTo.username?.[0]?.toUpperCase() || task.assignedTo.email[0].toUpperCase()}
            </Avatar>
          )}
        </div>
      </Card>
    </div>
  )
}
