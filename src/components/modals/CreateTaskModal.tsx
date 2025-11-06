import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Select, Button, message, Spin } from 'antd'
import { taskService, CreateTaskRequest } from '../../services/taskService'
import { projectService, Project } from '../../services/projectService'

interface CreateTaskModalProps {
  visible: boolean
  onClose: () => void
  onCreated?: () => void
}

const { Option } = Select

export default function CreateTaskModal({ visible, onClose, onCreated }: CreateTaskModalProps) {
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [form] = Form.useForm<CreateTaskRequest>()

  // 🟢 Load danh sách dự án theo user token
  const fetchProjects = async () => {
    setLoadingProjects(true)
    try {
      const res = await projectService.getProjects({ status: 'active', page: 1, limit: 100 })
      setProjects(res.data.projects || [])
    } catch (err) {
      console.error('Lỗi lấy danh sách dự án:', err)
      message.error('Không thể tải danh sách dự án!')
    } finally {
      setLoadingProjects(false)
    }
  }

  useEffect(() => {
    if (visible) fetchProjects()
  }, [visible])

  // 🟢 Tạo task mới
  const handleSubmit = async (values: CreateTaskRequest) => {
    setLoading(true)
    try {
      await taskService.createTask(values)
      message.success('Tạo công việc thành công!')
      form.resetFields()
      onCreated?.()
      onClose()
    } catch (err) {
      console.error(err)
      message.error('Tạo công việc thất bại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Tạo công việc mới"
      visible={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ status: 'In_Progress' }}
      >
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

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: 'In_Progress' }} // mặc định "Đang làm"
        >
          <Form.Item label="Trạng thái" name="status">
            <Select>
              <Option value="In_Progress">Đang làm</Option>
              <Option value="Blocked">Bị chặn</Option>
              <Option value="Done">Hoàn thành</Option>
            </Select>
          </Form.Item>
        </Form>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Tạo công việc
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
