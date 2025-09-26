import React from 'react'
import { Card, Button, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useAuth } from '@/context/AuthContext'

export default function Team() {
  const { user } = useAuth()

  const columns = [
    { title: 'Thành viên', dataIndex: 'name', key: 'name' },
    { title: 'Vai trò', dataIndex: 'role', key: 'role' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Dự án tham gia', dataIndex: 'projects', key: 'projects' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
  ]

  return (
    <Card
      title="Quản lý nhóm"
      extra={
        user?.role !== 'employee' && (
          <Button type="primary" icon={<PlusOutlined />}>
            Mời thành viên
          </Button>
        )
      }
    >
      <Table columns={columns} dataSource={[]} />
    </Card>
  )
}
