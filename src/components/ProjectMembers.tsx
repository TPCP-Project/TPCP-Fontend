import React, { useState, useEffect, useCallback } from 'react'
import { Card, Table, Tag, Avatar, Space, message, Button, Popconfirm } from 'antd'
import { UserOutlined, CrownOutlined, SettingOutlined, UserDeleteOutlined } from '@ant-design/icons'
import { projectService, ProjectMember } from '@/services/projectService'
import { getAxiosErrorMessage } from '@/utils/httpError'

interface ProjectMembersProps {
  projectId: string
  projectName: string
}

export default function ProjectMembers({ projectId, projectName }: ProjectMembersProps) {
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const response = await projectService.getProjectMembers(projectId)
      // Backend trả về data.members
      const membersData = response.data?.members || []
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
