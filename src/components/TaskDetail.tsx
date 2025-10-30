import React, { useState, useEffect } from 'react'
import { Card, Descriptions, Tag, Button, Space, Spin, message, Row, Col } from 'antd'
import { ArrowLeftOutlined, EditOutlined, UserAddOutlined } from '@ant-design/icons'
import { Task, taskService } from '../services/taskService'
import UpdateTaskModal from '../components/modals/EditTaskModal'
import AssignEmployeeModal from '../components/modals/AssignEmployeeModal'
import CommentCard from '../components/CommentCard'
import AttachmentUploader from '../components/AttachmentUploader'
import { useAuth } from '@/context/AuthContext' 


interface TaskDetailProps {
  taskId: string
  onBack: () => void
}


export default function TaskDetail({ taskId, onBack }: TaskDetailProps) {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [updateVisible, setUpdateVisible] = useState(false)
  const [assignVisible, setAssignVisible] = useState(false)
  const { user } = useAuth() 


  const fetchTaskDetail = async () => {
    setLoading(true)
    try {
      const res = await taskService.getTaskById(taskId)
      const data = res?.task || res
      setTask(data)
    } catch (err) {
      console.error('❌ Lỗi tải chi tiết công việc:', err)
      message.error('Không thể tải chi tiết công việc!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (taskId) fetchTaskDetail()
  }, [taskId])

  const getStatusTag = (status: Task['status']) => {
    const label: Record<Task['status'], string> = {
      In_Progress: 'Đang làm',
      Blocked: 'Bị chặn',
      Done: 'Hoàn thành',
    }
    const color: Record<Task['status'], string> = {
      In_Progress: 'orange',
      Blocked: 'red',
      Done: 'green',
    }
    return <Tag color={color[status]}>{label[status]}</Tag>
  }

  const handleAssignEmployee = async (userId: string) => {
    if (!task) return
    try {
      await taskService.assignTask(task._id, userId)
      message.success('Đã gán nhân viên thành công!')
      fetchTaskDetail()
    } catch (error) {
      console.error('❌ Lỗi khi gán nhân viên:', error)
      message.error('Không thể gán nhân viên!')
    }
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
      {/* 🧾 Chi tiết công việc */}
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
          <Space>
            {/* ✅ Ẩn hai nút này nếu role không phải manager */}
            {user?.role === 'manager' && (
              <>
                <Button
                  icon={<UserAddOutlined />}
                  onClick={() => setAssignVisible(true)}
                >
                  Assign Member
                </Button>

                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    if (task?._id) setUpdateVisible(true)
                    else message.warning('Task chưa sẵn sàng để chỉnh sửa!')
                  }}
                >
                  Chỉnh sửa
                </Button>
              </>
            )}
          </Space>
        }
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Tên công việc">{task.title}</Descriptions.Item>
          <Descriptions.Item label="Mô tả">{task.description || '—'}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">{getStatusTag(task.status)}</Descriptions.Item>
          <Descriptions.Item label="Dự án">
            {typeof task.projectId === 'object' ? task.projectId?.name : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Người tạo">{task.createdBy?.username || '—'}</Descriptions.Item>
          <Descriptions.Item label="Người được giao">{task.assignedTo?.username || 'Chưa có'}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {new Date(task.createdAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            {new Date(task.updatedAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
        </Descriptions>
      </Card>


      {/* 💬 Bình luận & 📎 File song song */}
      <Row gutter={16}>
        <Col xs={24} md={12}>
          {task?._id && <CommentCard taskId={task._id} />}
        </Col>
        <Col xs={24} md={12}>
          {task?._id && (
            <AttachmentUploader
              taskId={task._id}
              attachments={task.attachments || []}
              onUploadSuccess={fetchTaskDetail}
            />
          )}
        </Col>
      </Row>

      {/* 🛠 Modal chỉnh sửa */}
      {task?._id && (
        <UpdateTaskModal
          visible={updateVisible}
          taskId={task._id}
          onClose={() => setUpdateVisible(false)}
          onUpdated={() => {
            setUpdateVisible(false)
            fetchTaskDetail()
          }}
        />
      )}


      {/* 👥 Modal gán nhân viên */}
      {task && (
        <AssignEmployeeModal
          visible={assignVisible}
          projectId={
            (typeof task.projectId === 'object'
              ? task.projectId?._id
              : task.projectId) || ''
          }
          onClose={() => setAssignVisible(false)}
          onAssign={handleAssignEmployee}
        />
      )}
    </>
  )
}
