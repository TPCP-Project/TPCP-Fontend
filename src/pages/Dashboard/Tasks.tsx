import React from 'react'
import { Card, Button, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

export default function Tasks() {
  const columns = [
    { title: 'Công việc', dataIndex: 'title', key: 'title' },
    { title: 'Người thực hiện', dataIndex: 'assignee', key: 'assignee' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
    { title: 'Ưu tiên', dataIndex: 'priority', key: 'priority' },
    { title: 'Hạn chót', dataIndex: 'dueDate', key: 'dueDate' },
  ]

  return (
    <Card
      title="Quản lý công việc"
      extra={
        <Button type="primary" icon={<PlusOutlined />}>
          Tạo công việc mới
        </Button>
      }
    >
      <Table columns={columns} dataSource={[]} />
    </Card>
  )
}
