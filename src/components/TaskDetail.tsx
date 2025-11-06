import React, { useState, useEffect } from 'react'
import { Card, Descriptions, Tag, Button, Space, Spin, message } from 'antd'
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'
import { Task, taskService } from '../services/taskService'
import UpdateTaskModal from '../components/modals/EditTaskModal' // import modal update

interface TaskDetailProps {
  taskId: string
  onBack: () => void
}

export default function TaskDetail({ taskId, onBack }: TaskDetailProps) {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [updateVisible, setUpdateVisible] = useState(false)

  // 🟢 Lấy chi tiết task
  const fetchTaskDetail = async () => {
    setLoading(true)
    try {
      const data = await taskService.getTaskById(taskId)
      setTask(data)
    } catch (err) {
      console.error(err)
      message.error('Không thể tải chi tiết công việc!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTaskDetail()
  }, [taskId])

  // 🟢 Render tag trạng thái
  const getStatusTag = (status: Task['status']) => {
    const map: Record<Task['status'], string> = {
      In_Progress: 'Đang làm',
      Blocked: 'Bị chặn',
      Done: 'Hoàn thành',
    }
    const colorMap: Record<Task['status'], string> = {
      In_Progress: 'orange',
      Blocked: 'red',
      Done: 'green',
    }
    return <Tag color={colorMap[status]}>{map[status]}</Tag>
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!task) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 50 }}>
          <p>Không tìm thấy công việc</p>
          <Button onClick={onBack}>Quay lại</Button>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card
        title={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              Quay lại
            </Button>
            <span>Chi tiết công việc: {task.title}</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setUpdateVisible(true)}
          >
            Chỉnh sửa
          </Button>
        }
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Tên công việc">{task.title}</Descriptions.Item>
          <Descriptions.Item label="Mô tả">{task.description || '—'}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">{getStatusTag(task.status)}</Descriptions.Item>
          <Descriptions.Item label="Dự án">
            {typeof task.projectId === 'object' ? task.projectId?.name || '—' : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Người tạo">
            {task.createdBy?.username || '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Người được giao">
            {task.assignedTo?.username || '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {new Date(task.createdAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            {new Date(task.updatedAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 🟢 Modal cập nhật công việc */}
      <UpdateTaskModal
        visible={updateVisible}
        taskId={task._id}
        onClose={() => setUpdateVisible(false)}
        onUpdated={() => {
          setUpdateVisible(false)
          fetchTaskDetail() // reload sau khi cập nhật
        }}
      />
    </>
  )
}
