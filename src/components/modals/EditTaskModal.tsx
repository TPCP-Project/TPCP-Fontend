import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Modal, Form, Input, Select, Button, message, Spin, DatePicker } from 'antd'
import dayjs from 'dayjs'
import { taskService, UpdateTaskRequest } from '../../services/taskService'
import { projectService, Project } from '../../services/projectService'

interface UpdateTaskModalProps {
  visible: boolean
  taskId: string | null
  onClose: () => void
  onUpdated?: () => void
}

const { Option } = Select

export default function UpdateTaskModal({
  visible,
  taskId,
  onClose,
  onUpdated,
}: UpdateTaskModalProps) {
  const [form] = Form.useForm<UpdateTaskRequest>()
  const [loading, setLoading] = useState(false)
  const [loadingTask, setLoadingTask] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)

  // 🟢 Load danh sách dự án
  const fetchProjects = async () => {
    setLoadingProjects(true)
    try {
      const res = await projectService.getProjects({ status: 'active', page: 1, limit: 100 })
      setProjects(res.data.projects || [])
    } catch (err) {
      console.error('Lỗi tải danh sách dự án:', err)
      message.error('Không thể tải danh sách dự án!')
    } finally {
      setLoadingProjects(false)
    }
  }

  // 🟢 Lấy dữ liệu task theo ID
  const fetchTask = async (id: string) => {
    setLoadingTask(true)
    try {
      const task = await taskService.getTaskById(id)
      form.setFieldsValue({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate ? dayjs(task.dueDate).toISOString() : undefined,
        status: task.status,
        projectId: typeof task.projectId === 'string' ? task.projectId : task.projectId?._id,
      })
    } catch (err) {
      console.error('Lỗi tải công việc:', err)
      message.error('Không thể tải dữ liệu công việc!')
    } finally {
      setLoadingTask(false)
    }
  }

  useEffect(() => {
    if (visible && taskId) {
      fetchProjects()
      fetchTask(taskId)
    } else {
      form.resetFields()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, taskId])

  // 🟢 Submit cập nhật task
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (values: any) => {
    if (!taskId) return
    setLoading(true)
    try {
      const payload: UpdateTaskRequest = {
        title: values.title,
        description: values.description,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        status: values.status,
        projectId: values.projectId,
      }

      await taskService.updateTask(taskId, payload)
      message.success('Cập nhật công việc thành công!')
      form.resetFields()
      onUpdated?.()
      onClose()
    } catch (err: unknown) {
      console.error('Lỗi cập nhật công việc:', err)

      if (axios.isAxiosError(err)) {
        message.error(err.response?.data?.message || 'Cập nhật công việc thất bại!')
      } else {
        message.error('Cập nhật công việc thất bại!')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Cập nhật công việc"
      visible={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      {loadingTask ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin />
        </div>
      ) : (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Tên công việc"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tên công việc' }]}
          >
            <Input placeholder="Nhập tên công việc" />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea placeholder="Nhập mô tả (tùy chọn)" rows={4} />
          </Form.Item>

          <Form.Item label="Hạn hoàn thành" name="dueDate">
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Dự án"
            name="projectId"
            rules={[{ required: true, message: 'Vui lòng chọn dự án' }]}
          >
            {loadingProjects ? (
              <Spin />
            ) : (
              <Select placeholder="Chọn dự án">
                {projects.map((p) => (
                  <Option key={p._id} value={p._id}>
                    {p.name}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>

          <Form.Item label="Trạng thái" name="status">
            <Select>
              <Option value="In_Progress">Đang làm</Option>
              <Option value="Blocked">Bị chặn</Option>
              <Option value="Done">Hoàn thành</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Cập nhật công việc
            </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  )
}
