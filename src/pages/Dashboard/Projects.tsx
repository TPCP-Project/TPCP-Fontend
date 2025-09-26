import React from 'react'
import { Card, Button, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useAuth } from '@/context/AuthContext'

export default function Projects() {
  const { user } = useAuth()

  const columns = [
    { title: 'Tên dự án', dataIndex: 'name', key: 'name' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
    { title: 'Tiến độ', dataIndex: 'progress', key: 'progress' },
    { title: 'Hạn chót', dataIndex: 'deadline', key: 'deadline' },
    { title: 'Manager', dataIndex: 'manager', key: 'manager' },
  ]

  return (
    <Card
      title="Quản lý dự án"
      extra={
        user?.role !== 'employee' && (
          <Button type="primary" icon={<PlusOutlined />}>
            Tạo dự án mới
          </Button>
        )
      }
    >
      <Table columns={columns} dataSource={[]} />
    </Card>
  )
}
