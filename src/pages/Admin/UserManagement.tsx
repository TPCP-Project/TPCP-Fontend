import React, { useState, useEffect } from 'react'
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Modal,
  Form,
  App,
  Popconfirm,
  Tooltip,
} from 'antd'
import {
  SearchOutlined,
  EditOutlined,
  StopOutlined,
  CheckCircleOutlined,
  MailOutlined,
  EyeOutlined,
  MessageOutlined,
} from '@ant-design/icons'
import { adminService, User } from '@/services/adminService'
import { chatService } from '@/services/chatService'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'

const { Option } = Select
const { TextArea } = Input

export default function UserManagement() {
  const { message } = App.useApp()
  const navigate = useNavigate()

  // Danh sách user
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  // Phân trang
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  // Bộ lọc
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Modal
  const [roleModalVisible, setRoleModalVisible] = useState(false)
  const [emailModalVisible, setEmailModalVisible] = useState(false)

  // User đang chọn
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Form
  const [roleForm] = Form.useForm()
  const [emailForm] = Form.useForm()

  useEffect(() => {
    fetchUsers()
  }, [page, search, roleFilter, statusFilter])

  // Lấy danh sách tất cả user từ server
  const fetchUsers = async () => {
    try {
      setLoading(true)

      const params: any = { page, limit }
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      if (statusFilter) params.accountStatus = statusFilter

      const res = await adminService.getAllUsers(params)
      setUsers(res.data.users)
      setTotal(res.data.total)
    } catch (error: any) {
      message.error(
        'Không thể tải danh sách users: ' + (error.response?.data?.message || error.message)
      )
    } finally {
      setLoading(false)
    }
  }

  // Cập nhật role user
  const handleUpdateRole = async (values: any) => {
    if (!selectedUser) return

    try {
      await adminService.updateUserRole(selectedUser._id, values.role)
      message.success('Cập nhật role thành công')
      setRoleModalVisible(false)
      roleForm.resetFields()
      fetchUsers()
    } catch (error: any) {
      message.error('Lỗi: ' + (error.response?.data?.message || error.message))
    }
  }

  // Ban hoặc unban user
  const handleBanUser = async (user: User, ban: boolean) => {
    try {
      const reason = ban ? 'Vi phạm chính sách sử dụng' : undefined
      await adminService.banUser(user._id, ban, reason)
      message.success(ban ? 'Đã ban user' : 'Đã bỏ ban user')
      fetchUsers()
    } catch (error: any) {
      message.error('Lỗi: ' + (error.response?.data?.message || error.message))
    }
  }

  // Gửi email cảnh báo
  const handleSendEmail = async (values: any) => {
    if (!selectedUser) return

    try {
      await adminService.sendWarningEmail(selectedUser._id, values.subject, values.message)
      message.success('Đã gửi email thành công')
      setEmailModalVisible(false)
      emailForm.resetFields()
    } catch (error: any) {
      message.error('Lỗi: ' + (error.response?.data?.message || error.message))
    }
  }

  // Tạo cuộc trò chuyện 1-1 với user
  const handleCreateChat = async (user: User) => {
    try {
      message.loading({ content: 'Đang tạo cuộc trò chuyện...', key: 'createChat' })

      const response = await chatService.createDirectConversation({
        targetUserId: user._id,
      })

      message.success({ content: 'Đã tạo cuộc trò chuyện!', key: 'createChat' })

      // Điều hướng sang trang chat
      navigate('/dashboard/chat', { state: { conversationId: response.data._id } })
    } catch (error: any) {
      message.error({
        content: 'Lỗi: ' + (error.response?.data?.message || error.message),
        key: 'createChat',
      })
    }
  }

  // Các cột của bảng user
  const columns: ColumnsType<User> = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>@{record.username}</div>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const colors: any = {
          admin: 'red',
          manager: 'blue',
          employee: 'default',
        }
        return <Tag color={colors[role]}>{role.toUpperCase()}</Tag>
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'accountStatus',
      key: 'accountStatus',
      render: (status, record) => {
        if (record.isBanned) {
          return <Tag color="red">BANNED</Tag>
        }
        const colors: any = { active: 'green', inactive: 'orange' }
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },

    // Các thao tác quản lý user
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {/* Xem chi tiết */}
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined />} onClick={() => message.info(record.name)} />
          </Tooltip>

          {/* Đổi role */}
          <Tooltip title="Đổi role">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedUser(record)
                roleForm.setFieldsValue({ role: record.role })
                setRoleModalVisible(true)
              }}
            />
          </Tooltip>

          {/* Gửi email cảnh báo */}
          <Tooltip title="Gửi email cảnh báo">
            <Button
              type="text"
              icon={<MailOutlined />}
              onClick={() => {
                setSelectedUser(record)
                setEmailModalVisible(true)
              }}
            />
          </Tooltip>

          {/* Nhắn tin */}
          <Tooltip title="Nhắn tin 1vs1">
            <Button
              type="text"
              icon={<MessageOutlined />}
              onClick={() => handleCreateChat(record)}
            />
          </Tooltip>

          {/* Ban / Unban user */}
          {record.isBanned ? (
            <Popconfirm
              title="Bỏ ban user này?"
              onConfirm={() => handleBanUser(record, false)}
              okText="Có"
              cancelText="Không"
            >
              <Tooltip title="Bỏ ban">
                <Button type="text" icon={<CheckCircleOutlined />} style={{ color: '#52c41a' }} />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Ban user này?"
              description="User sẽ không thể đăng nhập"
              onConfirm={() => handleBanUser(record, true)}
              okText="Có"
              cancelText="Không"
            >
              <Tooltip title="Ban user">
                <Button type="text" danger icon={<StopOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      {/* Header + Toolbar */}
      <Card
        title={<h2 style={{ margin: 0 }}>👥 Quản Lý Users</h2>}
        extra={
          <Space>
            {/* Ô tìm kiếm */}
            <Input
              placeholder="Tìm kiếm theo tên, email, username..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />

            {/* Bộ lọc role */}
            <Select
              placeholder="Lọc theo role"
              style={{ width: 150 }}
              onChange={setRoleFilter}
              allowClear
            >
              <Option value="admin">Admin</Option>
              <Option value="manager">Manager</Option>
              <Option value="employee">Employee</Option>
            </Select>

            {/* Bộ lọc trạng thái */}
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: 150 }}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="banned">Banned</Option>
            </Select>
          </Space>
        }
      >
        {/* Bảng danh sách user */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total: total,
            onChange: (newPage) => setPage(newPage),
            showTotal: (total) => `Tổng ${total} users`,
          }}
        />
      </Card>

      {/* Modal đổi role */}
      <Modal
        title="Đổi Role User"
        open={roleModalVisible}
        onCancel={() => {
          setRoleModalVisible(false)
          roleForm.resetFields()
        }}
        footer={null}
      >
        <Form form={roleForm} onFinish={handleUpdateRole} layout="vertical">
          <Form.Item label="User" name="userName">
            <div>
              <strong>{selectedUser?.name}</strong> ({selectedUser?.email})
            </div>
          </Form.Item>

          <Form.Item
            label="Role mới"
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn role' }]}
          >
            <Select>
              <Option value="admin">Admin</Option>
              <Option value="manager">Manager</Option>
              <Option value="employee">Employee</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
              <Button onClick={() => setRoleModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal gửi email */}
      <Modal
        title="Gửi Email Cảnh Báo"
        open={emailModalVisible}
        onCancel={() => {
          setEmailModalVisible(false)
          emailForm.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form form={emailForm} onFinish={handleSendEmail} layout="vertical">
          <Form.Item label="Gửi đến">
            <strong>{selectedUser?.name}</strong> - {selectedUser?.email}
          </Form.Item>

          <Form.Item
            label="Tiêu đề"
            name="subject"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
            initialValue="⚠️ Cảnh báo từ hệ thống"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Nội dung"
            name="message"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <TextArea rows={6} placeholder="Nhập nội dung email cảnh báo..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<MailOutlined />}>
                Gửi Email
              </Button>
              <Button onClick={() => setEmailModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
