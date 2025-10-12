import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Switch, Button, message, Select } from 'antd'
import { projectService, UpdateProjectRequest, Project } from '@/services/projectService'
import { getAxiosErrorMessage } from '@/utils/httpError'

interface EditProjectModalProps {
  visible: boolean
  project: Project | null
  onCancel: () => void
  onSuccess: () => void
}

export default function EditProjectModal({
  visible,
  project,
  onCancel,
  onSuccess,
}: EditProjectModalProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (project && visible) {
      form.setFieldsValue({
        name: project.name,
        description: project.description,
        status: project.status,
        auto_approve_members: project.auto_approve_members,
        settings: project.settings,
      })
    }
  }, [project, visible, form])

  const handleSubmit = async (values: UpdateProjectRequest) => {
    if (!project) return

    setLoading(true)
    try {
      await projectService.updateProject(project._id, values)
      message.success('Cập nhật project thành công!')
      onSuccess()
      onCancel()
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Chỉnh sửa Project" open={visible} onCancel={onCancel} footer={null} width={600}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Tên Project"
          rules={[{ required: true, message: 'Vui lòng nhập tên project!' }]}
        >
          <Input placeholder="Nhập tên project" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
        >
          <Input.TextArea rows={4} placeholder="Nhập mô tả project" />
        </Form.Item>

        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
        >
          <Select>
            <Select.Option value="active">Hoạt động</Select.Option>
            <Select.Option value="completed">Hoàn thành</Select.Option>
            <Select.Option value="archived">Lưu trữ</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="auto_approve_members"
          label="Tự động phê duyệt thành viên"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <div style={{ marginBottom: 16 }}>
          <h4>Cài đặt Project</h4>
        </div>

        <Form.Item
          name={['settings', 'allowInvitationByMembers']}
          label="Cho phép thành viên mời người khác"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name={['settings', 'requireApprovalForJoining']}
          label="Yêu cầu phê duyệt khi tham gia"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name={['settings', 'autoDeletePendingRequests']}
          label="Tự động xóa yêu cầu chờ (ngày)"
        >
          <Input type="number" min={1} max={30} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Cập nhật Project
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
