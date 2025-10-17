import React, { useState, useEffect } from 'react'
import { Card, Button, Table, Space, Tag, Popconfirm, message, Input, Select } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { useAuth } from '@/context/AuthContext'
import { projectService, Project } from '@/services/projectService'
import CreateProjectModal from '@/components/modals/CreateProjectModal'
import EditProjectModal from '@/components/modals/EditProjectModal'
import ProjectDetail from '@/components/ProjectDetail'
import { getAxiosErrorMessage } from '@/utils/httpError'

const { Search } = Input
const { Option } = Select

export default function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [defaultTab, setDefaultTab] = useState<string>('details')
  const [filters, setFilters] = useState({
    status: undefined as 'active' | 'completed' | 'archived' | undefined,
    search: '',
  })

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = {
        ...(filters.status && { status: filters.status }),
      }

      const response = await projectService.getProjects(params)
      setProjects(response.data.projects)
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status])

  const refreshProjects = () => {
    fetchProjects()
  }

  const handleDelete = async (projectId: string) => {
    try {
      await projectService.deleteProject(projectId)
      message.success('Xóa project thành công!')
      refreshProjects()
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      message.error(errorMessage)
    }
  }

  const handleEdit = (project: Project) => {
    setSelectedProject(project)
    setEditModalVisible(true)
  }

  const getStatusTag = (status: string) => {
    const statusConfig = {
      active: { color: 'green', text: 'Hoạt động' },
      completed: { color: 'blue', text: 'Hoàn thành' },
      archived: { color: 'gray', text: 'Lưu trữ' },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: 'default',
      text: status,
    }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  const columns = [
    {
      title: 'Tên Project',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Project) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.description?.substring(0, 50)}...
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Tự động phê duyệt',
      dataIndex: 'auto_approve_members',
      key: 'auto_approve_members',
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'red'}>{value ? 'Có' : 'Không'}</Tag>
      ),
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
      render: (_: unknown, record: Project) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedProjectId(record._id)
              setDefaultTab('details')
              setShowDetail(true)
            }}
            title="Xem chi tiết"
          />
          <Button
            type="text"
            icon={<TeamOutlined />}
            onClick={() => {
              setSelectedProjectId(record._id)
              setDefaultTab('members')
              setShowDetail(true)
            }}
            title="Xem thành viên"
          />
          {user?.role !== 'employee' && (
            <>
              <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa project này?"
                onConfirm={() => handleDelete(record._id)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ]

  const handleFilterChange = (
    key: string,
    value: string | 'active' | 'completed' | 'archived' | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div>
      {showDetail && selectedProjectId ? (
        <ProjectDetail
          projectId={selectedProjectId}
          defaultTab={defaultTab}
          onBack={() => {
            setShowDetail(false)
            setSelectedProjectId(null)
            setDefaultTab('details')
          }}
        />
      ) : (
        <>
          <Card
            title="Quản lý Projects"
            extra={
              user?.role !== 'employee' && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                >
                  Tạo Project Mới
                </Button>
              )
            }
          >
            <div style={{ marginBottom: 16 }}>
              <Space>
                {user?.role === 'employee' && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalVisible(true)}
                  >
                    Tạo Project Mới
                  </Button>
                )}
                <Search
                  placeholder="Tìm kiếm project..."
                  style={{ width: 300 }}
                  onSearch={(value) => handleFilterChange('search', value)}
                />
                <Select
                  placeholder="Lọc theo trạng thái"
                  style={{ width: 150 }}
                  allowClear
                  onChange={(value) => handleFilterChange('status', value)}
                >
                  <Option value="active">Hoạt động</Option>
                  <Option value="completed">Hoàn thành</Option>
                  <Option value="archived">Lưu trữ</Option>
                </Select>
              </Space>
            </div>

            <Table columns={columns} dataSource={projects} loading={loading} rowKey="_id" />
          </Card>

          <CreateProjectModal
            visible={createModalVisible}
            onCancel={() => setCreateModalVisible(false)}
            onSuccess={refreshProjects}
          />

          <EditProjectModal
            visible={editModalVisible}
            project={selectedProject}
            onCancel={() => {
              setEditModalVisible(false)
              setSelectedProject(null)
            }}
            onSuccess={refreshProjects}
          />
        </>
      )}
    </div>
  )
}
