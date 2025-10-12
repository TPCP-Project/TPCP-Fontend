import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Popconfirm,
} from 'antd'
import { PlusOutlined, CopyOutlined, StopOutlined, MailOutlined } from '@ant-design/icons'
import { invitationService, ProjectInvitation } from '@/services/invitationService'
import { getAxiosErrorMessage } from '@/utils/httpError'

interface ProjectInvitationsProps {
  projectId: string
  projectName: string
}

export default function ProjectInvitations({ projectId, projectName }: ProjectInvitationsProps) {
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([])
  const [loading, setLoading] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [sendModalVisible, setSendModalVisible] = useState(false)
  const [selectedInviteCode, setSelectedInviteCode] = useState('')
  const [form] = Form.useForm()
  const [sendForm] = Form.useForm()

  const fetchInvitations = useCallback(async () => {
    setLoading(true)
    try {
      const response = await invitationService.getProjectInvitations(projectId)
      setInvitations(response.data)
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchInvitations()
  }, [fetchInvitations])

  const handleCreateInviteCode = async (values: { expiryDays: number }) => {
    try {
      await invitationService.createInviteCode(projectId, { expiryDays: values.expiryDays })
      message.success('Tạo mã mời thành công!')
      setCreateModalVisible(false)
      form.resetFields()
      fetchInvitations()
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      message.error(errorMessage)
    }
  }

  const handleSendInvitation = async (values: { email: string }) => {
    try {
      await invitationService.sendInvitation({
        inviteCode: selectedInviteCode,
        email: values.email,
      })
      message.success('Đã gửi lời mời thành công!')
      setSendModalVisible(false)
      sendForm.resetFields()
      setSelectedInviteCode('')
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      message.error(errorMessage)
    }
  }

  const handleDeactivateInviteCode = async (inviteCode: string) => {
    try {
      await invitationService.deactivateInviteCode(inviteCode)
      message.success('Đã vô hiệu hóa mã mời!')
      fetchInvitations()
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      message.error(errorMessage)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    message.success('Đã copy mã mời!')
  }

  const getStatusTag = (isActive: boolean, expiryDate: string) => {
    const now = new Date()
    const expiry = new Date(expiryDate)

    if (!isActive) {
      return <Tag color="red">Đã vô hiệu hóa</Tag>
    }

    if (expiry < now) {
      return <Tag color="orange">Đã hết hạn</Tag>
    }

    return <Tag color="green">Hoạt động</Tag>
  }

  const columns = [
    {
      title: 'Mã mời',
      dataIndex: 'invite_code',
      key: 'invite_code',
      render: (text: string) => (
        <Space>
          <code style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px' }}>
            {text}
          </code>
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => copyToClipboard(text)}
          />
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: unknown, record: ProjectInvitation) =>
        getStatusTag(record.is_active, record.expiry_date),
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: unknown, record: ProjectInvitation) => (
        <Space>
          <Button
            type="text"
            icon={<MailOutlined />}
            onClick={() => {
              setSelectedInviteCode(record.invite_code)
              setSendModalVisible(true)
            }}
            disabled={!record.is_active || new Date(record.expiry_date) < new Date()}
          >
            Gửi email
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn vô hiệu hóa mã mời này?"
            onConfirm={() => handleDeactivateInviteCode(record.invite_code)}
            okText="Vô hiệu hóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<StopOutlined />} disabled={!record.is_active} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title={`Mã mời tham gia - ${projectName}`}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Tạo mã mời mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={invitations}
          loading={loading}
          rowKey="_id"
          pagination={false}
        />
      </Card>

      {/* Modal tạo mã mời */}
      <Modal
        title="Tạo mã mời mới"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={400}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateInviteCode}>
          <Form.Item
            name="expiryDays"
            label="Số ngày hết hạn"
            rules={[{ required: true, message: 'Vui lòng nhập số ngày hết hạn!' }]}
            initialValue={30}
          >
            <InputNumber min={1} max={365} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setCreateModalVisible(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Tạo mã mời
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal gửi email */}
      <Modal
        title="Gửi lời mời qua email"
        open={sendModalVisible}
        onCancel={() => {
          setSendModalVisible(false)
          sendForm.resetFields()
          setSelectedInviteCode('')
        }}
        footer={null}
        width={400}
      >
        <Form form={sendForm} layout="vertical" onFinish={handleSendInvitation}>
          <Form.Item
            name="email"
            label="Email người được mời"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setSendModalVisible(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Gửi lời mời
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
