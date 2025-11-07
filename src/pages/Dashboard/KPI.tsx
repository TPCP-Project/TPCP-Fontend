import React from 'react'
import { Card, Button, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useAuth } from '@/context/AuthContext'

export default function KPI() {
  const { user } = useAuth()

  const columns = [
    { title: 'Nhân viên', dataIndex: 'employee', key: 'employee' },
    { title: 'Tháng', dataIndex: 'month', key: 'month' },
    { title: 'Mục tiêu', dataIndex: 'target', key: 'target' },
    { title: 'Hoàn thành', dataIndex: 'completed', key: 'completed' },
    { title: 'Tiến độ', key: 'progress' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
  ]

  return (
    <Card
      title="Quản lý KPI"
      extra={
        user?.role !== 'employee' && (
          <Button type="primary" icon={<PlusOutlined />}>
            Tạo KPI mới
          </Button>
        )
      }
    >
      <Table columns={columns} dataSource={[]} />
    </Card>
  )
}
