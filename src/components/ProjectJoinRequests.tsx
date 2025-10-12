import React, { useState, useEffect, useCallback } from 'react'
import { Card, Button, Table, Space, Tag, message, Modal, Form, Input } from 'antd'
import { CheckOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons'
import { invitationService, ProjectJoinRequest } from '@/services/invitationService'
import { getAxiosErrorMessage } from '@/utils/httpError'

interface ProjectJoinRequestsProps {
  projectId: string
  projectName: string
}

export default function ProjectJoinRequests({ projectId, projectName }: ProjectJoinRequestsProps) {
  const [requests, setRequests] = useState<ProjectJoinRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState('')
  const [form] = Form.useForm()

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const response = await invitationService.getPendingRequests(projectId)
      setRequests(response.data)
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleApproveRequest = async (requestId: string) => {
    try {
      await invitationService.approveJoinRequest(requestId)
      message.success('Đã phê duyệt yêu cầu tham gia!')
      fetchRequests()
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      message.error(errorMessage)
    }
  }

  const handleRejectRequest = async (values: { reason?: string }) => {
    try {
      await invitationService.rejectJoinRequest(selectedRequestId, { reason: values.reason })
      message.success('Đã từ chối yêu cầu tham gia!')
      setRejectModalVisible(false)
      form.resetFields()
      setSelectedRequestId('')
      fetchRequests()
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      message.error(errorMessage)
    }
  }

  const getStatusTag = (status: string) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'Chờ duyệt' },
      accepted: { color: 'green', text: 'Đã chấp nhận' },
      rejected: { color: 'red', text: 'Đã từ chối' },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: 'default',
      text: status,
    }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (userId: string) => (
        <Space>
          <UserOutlined />
          <span>{userId}</span>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'request_date',
      key: 'request_date',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: unknown, record: ProjectJoinRequest) => (
        <Space>
          <Button
            type="text"
            icon={<CheckOutlined />}
            onClick={() => handleApproveRequest(record._id)}
            disabled={record.status !== 'pending'}
          >
            Phê duyệt
          </Button>
          <Button
            type="text"
            danger
            icon={<CloseOutlined />}
            onClick={() => {
              setSelectedRequestId(record._id)
              setRejectModalVisible(true)
            }}
            disabled={record.status !== 'pending'}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title={`Yêu cầu tham gia - ${projectName}`}
        extra={
          <Button onClick={fetchRequests} loading={loading}>
            Làm mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={requests}
          loading={loading}
          rowKey="_id"
          pagination={false}
          locale={{ emptyText: 'Không có yêu cầu tham gia nào' }}
        />
      </Card>

      {/* Modal từ chối yêu cầu */}
      <Modal
        title="Từ chối yêu cầu tham gia"
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false)
          form.resetFields()
          setSelectedRequestId('')
        }}
        footer={null}
        width={400}
      >
        <Form form={form} layout="vertical" onFinish={handleRejectRequest}>
          <Form.Item name="reason" label="Lý do từ chối (không bắt buộc)">
            <Input.TextArea rows={3} placeholder="Nhập lý do từ chối..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setRejectModalVisible(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" danger htmlType="submit">
              Từ chối
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
