import React, { useState } from 'react'
import { Modal, Form, Input, Switch, Button, message } from 'antd'
import { projectService, CreateProjectRequest } from '@/services/projectService'
import { getAxiosErrorMessage } from '@/utils/httpError'


interface CreateProjectModalProps {
  visible: boolean
  onCancel: () => void
  onSuccess: () => void
}


export default function CreateProjectModal({
  visible,
  onCancel,
  onSuccess,
}: CreateProjectModalProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: CreateProjectRequest) => {
    setLoading(true)
    try {
      await projectService.createProject(values)
      message.success('Tạo project thành công!')
      form.resetFields()
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
    <Modal title="Tạo Project Mới" open={visible} onCancel={onCancel} footer={null} width={600}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          auto_approve_members: false,
          settings: {
            allowInvitationByMembers: true,
            requireApprovalForJoining: true,
            autoDeletePendingRequests: 7,
          },
        }}
      >
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
            Tạo Project
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )

}

