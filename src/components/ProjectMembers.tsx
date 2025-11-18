import React, { useState, useEffect, useCallback } from 'react'
import { Card, Table, Tag, Avatar, Space, message, Button, Popconfirm, Tooltip } from 'antd'
import { UserOutlined, CrownOutlined, SettingOutlined, UserDeleteOutlined, MessageOutlined } from '@ant-design/icons'
import { projectService, ProjectMember } from '@/services/projectService'
import { chatService } from '@/services/chatService'
import { getAxiosErrorMessage } from '@/utils/httpError'
import { useNavigate } from 'react-router-dom'

interface ProjectMembersProps {
  projectId: string
  projectName: string
}

export default function ProjectMembers({ projectId, projectName }: ProjectMembersProps) {
  const navigate = useNavigate()
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      // projectService.getProjectMembers đã trả về array members luôn
      const membersData = await projectService.getProjectMembers(projectId)
      setMembers(Array.isArray(membersData) ? membersData : [])
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      message.error(errorMessage)
      setMembers([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const getRoleTag = (role: string) => {
    const roleConfig = {
      owner: { color: 'gold', text: 'Chủ sở hữu', icon: <CrownOutlined /> },
      admin: { color: 'blue', text: 'Quản trị viên', icon: <SettingOutlined /> },
      member: { color: 'green', text: 'Thành viên', icon: <UserOutlined /> },
    }
    const config = roleConfig[role as keyof typeof roleConfig] || {
      color: 'default',
      text: role,
      icon: <UserOutlined />,
    }
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    )
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    try {
      await projectService.removeProjectMember(memberId)
      message.success(`Đã xóa thành viên ${memberName} khỏi project`)
      fetchMembers()
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      message.error(errorMessage)
    }
  }

  const handleCreateChat = async (member: ProjectMember) => {
    try {
      message.loading({ content: 'Đang tạo cuộc trò chuyện...', key: 'createChat' })

      // Create or get existing direct conversation
      const response = await chatService.createDirectConversation({
        targetUserId: member.user._id
      })

      message.success({ content: 'Đã tạo cuộc trò chuyện!', key: 'createChat' })

      // Navigate to chat page with the conversation
      navigate('/dashboard/chat', { state: { conversationId: response.data._id } })
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      message.error({
        content: 'Lỗi: ' + errorMessage,
        key: 'createChat'
      })
    }
  }

  const columns = [
    {
      title: 'Thành viên',
      key: 'user',
      render: (_: unknown, record: ProjectMember) => (
        <Space>
          <Avatar src={record.user.avatar?.url} icon={<UserOutlined />} size="large" />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.user.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.user.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => getRoleTag(role),
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'joined_at',
      key: 'joined_at',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: unknown, record: ProjectMember) => (
        <Space>
          <Tooltip title="Nhắn tin 1vs1">
            <Button
              type="text"
              icon={<MessageOutlined />}
              size="small"
              onClick={() => handleCreateChat(record)}
            >
              Chat
            </Button>
          </Tooltip>

          {record.role !== 'owner' && (
            <Popconfirm
              title={`Bạn có chắc chắn muốn xóa ${record.user.name} khỏi project?`}
              onConfirm={() => handleRemoveMember(record._id, record.user.name)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="text" danger icon={<UserDeleteOutlined />} size="small">
                Xóa
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <Card title={`Thành viên project: ${projectName}`}>
      <Table
        columns={columns}
        dataSource={Array.isArray(members) ? members : []}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thành viên`,
        }}
      />
    </Card>
  )
}
