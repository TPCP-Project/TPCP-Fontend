import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Select, Button, message, Spin } from 'antd'
import { taskService, CreateTaskRequest } from '../../services/taskService'
import { projectService, Project, ProjectMember } from '../../services/projectService'

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
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
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

  // 🟢 Load danh sách members khi chọn project
  const fetchProjectMembers = async (projectId: string) => {
    if (!projectId) {
      console.warn('No projectId provided')
      return
    }

    setLoadingMembers(true)
    setMembers([])
    form.setFieldValue('assignedTo', undefined) // Reset assignedTo

    try {
      console.log('Fetching members for project:', projectId)
      const res = await projectService.getProjectMembers(projectId)
      console.log('API Response:', res)
      console.log('Members data:', res?.data?.members)

      const membersData = res?.data?.members || []
      console.log('Setting members:', membersData)

      // Debug each member structure
      if (membersData.length > 0) {
        console.log('First member structure:', JSON.stringify(membersData[0], null, 2))
        console.log('user_id type:', typeof membersData[0].user_id)
        console.log('user_id value:', membersData[0].user_id)
      }

      setMembers(membersData)
    } catch (err: any) {
      console.error('Lỗi lấy danh sách thành viên:', err)
      console.error('Error details:', err?.response?.data || err.message)
      message.error('Không thể tải danh sách thành viên!')
      setMembers([]) // Ensure members is always array
    } finally {
      setLoadingMembers(false)
    }
  }

  // Handle project change
  const handleProjectChange = (projectId: string) => {
    console.log('Project changed to:', projectId)
    try {
      fetchProjectMembers(projectId)
    } catch (err) {
      console.error('Error in handleProjectChange:', err)
    }
  }

  useEffect(() => {
    if (visible) {
      fetchProjects()
      setMembers([]) // Reset members khi mở modal
    }
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
        initialValues={{ status: 'TO_DO', priority: 'Medium' }}
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
            <Select placeholder="Chọn dự án" onChange={handleProjectChange}>
              {projects.map((p) => (
                <Option key={p._id} value={p._id}>
                  {p.name}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <Form.Item
          label="Người được giao"
          name="assignedTo"
          rules={[{ required: true, message: 'Vui lòng chọn người được giao!' }]}
        >
          {loadingMembers ? (
            <Spin />
          ) : (
            <Select
              placeholder={members.length === 0 ? "Chọn dự án trước" : "Chọn thành viên"}
              disabled={members.length === 0}
            >
              {Array.isArray(members) && members.map((m, index) => {
                if (!m) {
                  console.warn('Invalid member data:', m)
                  return null
                }

                console.log(`Member ${index}:`, m)
                console.log(`  - user_id:`, m.user_id, typeof m.user_id)
                console.log(`  - user._id:`, m.user?._id, typeof m.user?._id)

                // Ensure all values are strings
                const userId = m.user_id || m.user?._id || ''
                const userIdString = typeof userId === 'object' ? String(userId._id || userId) : String(userId)
                const userName = m.user?.name || ''
                const userEmail = m.user?.email || ''
                const displayName = String(userName || userEmail || 'Unknown User')

                if (!userIdString) {
                  console.warn('No user ID found:', m)
                  return null
                }

                console.log(`  - Final userId:`, userIdString)

                return (
                  <Option key={`member-${index}`} value={userIdString}>
                    {displayName}
                  </Option>
                )
              })}
            </Select>
          )}
        </Form.Item>

        <Form.Item label="Trạng thái" name="status">
          <Select>
            <Option value="TO_DO">To Do</Option>
            <Option value="DRAFTING">Drafting</Option>
            <Option value="IN_REVIEW">In Review</Option>
            <Option value="APPROVED">Approved</Option>
            <Option value="BLOCKED">Blocked</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Độ ưu tiên" name="priority">
          <Select>
            <Option value="Low">Low</Option>
            <Option value="Medium">Medium</Option>
            <Option value="High">High</Option>
            <Option value="Urgent">Urgent</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Sprint" name="sprint">
          <Input placeholder="VD: Sprint 1, Q1 2025" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Tạo công việc
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
