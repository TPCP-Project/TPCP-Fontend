import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Task, taskService } from '../../services/taskService'
import TaskDetail from '../../components/TaskDetail'
import CreateTaskModal from '../../components/modals/CreateTaskModal'


export default function TasksList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)


  const fetchTasks = async () => {
    setLoading(true)
    try {
      const data = await taskService.getTasks()
      setTasks(data)
    } catch (err) {
      console.error(err)
      message.error('Không thể tải danh sách công việc!')
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchTasks()
  }, [])

  const getStatusTag = (status: Task['status']) => {
    const map: Record<Task['status'], string> = {
      In_Progress: 'Đang làm',
      Blocked: 'Bị chặn',
      Done: 'Hoàn thành',
    }
    const colorMap: Record<Task['status'], string> = {
      In_Progress: 'orange',
      Blocked: 'red',
      Done: 'green',
    }
    return <Tag color={colorMap[status]}>{map[status]}</Tag>
  }


  const columns = [
    { title: 'Tên công việc', dataIndex: 'title', key: 'title' },
    {
      title: 'Dự án',
      dataIndex: 'projectId',
      key: 'project',
      render: (project: Task['projectId']) =>
        typeof project === 'object' && project?.name ? project.name : '—',
    },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: getStatusTag },
    { title: 'Người tạo', dataIndex: ['createdBy', 'username'], key: 'createdBy' },
    { title: 'Người được giao', dataIndex: ['assignedTo', 'username'], key: 'assignedTo' },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: unknown, record: Task) => (
        <Button type="link" onClick={() => setSelectedTaskId(record._id)}>
          Xem chi tiết
        </Button>
      ),
    },
  ]

  if (selectedTaskId) {
    return <TaskDetail taskId={selectedTaskId} onBack={() => setSelectedTaskId(null)} />
  }


  return (
    <>
      <Card
        title="Danh sách công việc"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowCreateModal(true)}
          >
            Tạo công việc
          </Button>
        }
      >
        <Table columns={columns} dataSource={tasks} rowKey="_id" loading={loading} />
      </Card>


      {/* Modal tạo task */}
      {showCreateModal && (
        <CreateTaskModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            fetchTasks()
          }}
        />
      )}
    </>
    
  )

}

