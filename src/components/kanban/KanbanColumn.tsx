import React from 'react'
import { Card } from 'antd'
import { Task, TaskStatus } from '../../services/taskService'
import { TaskCard } from './TaskCard'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

interface KanbanColumnProps {
  id: TaskStatus
  title: string
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

const columnColors: Record<TaskStatus, string> = {
  TO_DO: '#f5f5f5',
  DRAFTING: '#e6f7ff',
  IN_REVIEW: '#f0f5ff',
  APPROVED: '#f6ffed',
  BLOCKED: '#fff1f0',
}

const columnTitles: Record<TaskStatus, string> = {
  TO_DO: 'TO DO',
  DRAFTING: 'DRAFTING',
  IN_REVIEW: 'IN REVIEW',
  APPROVED: 'APPROVED',
  BLOCKED: 'BLOCKED',
}

const columnTextColors: Record<TaskStatus, string> = {
  TO_DO: '#595959',
  DRAFTING: '#1890ff',
  IN_REVIEW: '#096dd9',
  APPROVED: '#52c41a',
  BLOCKED: '#ff4d4f',
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  onTaskClick,
}) => {
  const { setNodeRef } = useDroppable({
    id,
  })

  return (
    <div
      style={{
        flex: '0 0 320px',
        minHeight: '600px',
        backgroundColor: columnColors[id],
        borderRadius: 8,
        padding: '16px 12px',
        margin: '0 8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
      ref={setNodeRef}
    >
      {/* Column Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: '2px solid rgba(0,0,0,0.06)',
        }}
      >
        <span style={{
          fontWeight: 600,
          fontSize: 13,
          textTransform: 'uppercase',
          color: columnTextColors[id],
          letterSpacing: '0.5px'
        }}>
          {columnTitles[id]}
        </span>
        <span
          style={{
            backgroundColor: 'rgba(0,0,0,0.08)',
            padding: '3px 10px',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            color: '#595959',
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
        <div>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </div>
      </SortableContext>

      {tasks.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            color: '#999',
            marginTop: 20,
            fontSize: 12,
          }}
        >
          No tasks
        </div>
      )}
    </div>
  )
}
