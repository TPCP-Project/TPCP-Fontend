import React, { useState, useEffect, useCallback } from 'react'
import { Card, Descriptions, Tag, Button, Space, message, Spin, Switch, Tabs } from 'antd'
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { projectService, Project } from '@/services/projectService'
import EditProjectModal from '@/components/modals/EditProjectModal'
import ProjectInvitations from '@/components/ProjectInvitations'
import ProjectJoinRequests from '@/components/ProjectJoinRequests'
import ProjectMembers from '@/components/ProjectMembers'
import { getAxiosErrorMessage } from '@/utils/httpError'


interface ProjectDetailProps {
  projectId: string
  defaultTab?: string
  onBack: () => void
}



export default function ProjectDetail({
  projectId,
  defaultTab = 'details',
  onBack,
}: ProjectDetailProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultTab)


  const fetchProjectDetail = useCallback(async () => {
    setLoading(true)
    try {
      const response = await projectService.getProjectById(projectId)
      setProject(response.data)
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }

  }, [projectId])

  useEffect(() => {
    fetchProjectDetail()
  }, [fetchProjectDetail])

  const handleAutoApproveChange = async (checked: boolean) => {
    if (!project) return

    try {
      await projectService.updateProject(project._id, {
        auto_approve_members: checked,
      })
      message.success('Đã cập nhật cài đặt tự động phê duyệt!')
      fetchProjectDetail()
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      message.error(errorMessage)
    }

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


  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )

  }


  if (!project) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Không tìm thấy project</p>
          <Button onClick={onBack}>Quay lại</Button>
        </div>
      </Card>
    )

  }


  return (
    <div>
      <Card
        title={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              Quay lại
            </Button>
            <span>Chi tiết Project: {project.name}</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<EditOutlined />} onClick={() => setEditModalVisible(true)}>
            Chỉnh sửa
          </Button>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'details',
              label: 'Thông tin chung',
              children: (
                <div>
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="Tên Project" span={2}>
                      {project.name}
                    </Descriptions.Item>

                    <Descriptions.Item label="Mô tả" span={2}>
                      {project.description}
                    </Descriptions.Item>

                    <Descriptions.Item label="Trạng thái">
                      {getStatusTag(project.status)}
                    </Descriptions.Item>

                    <Descriptions.Item label="Tự động phê duyệt thành viên">
                      <Space>
                        <Switch
                          checked={project.auto_approve_members}
                          onChange={handleAutoApproveChange}
                          checkedChildren="Có"
                          unCheckedChildren="Không"
                        />
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          {project.auto_approve_members
                            ? 'Tự động chấp nhận yêu cầu tham gia'
                            : 'Cần phê duyệt thủ công'}
                        </span>
                      </Space>
                    </Descriptions.Item>

                    <Descriptions.Item label="Ngày tạo">
                      {new Date(project.createdAt).toLocaleString('vi-VN')}
                    </Descriptions.Item>

                    <Descriptions.Item label="Cập nhật lần cuối">
                      {new Date(project.updatedAt).toLocaleString('vi-VN')}
                    </Descriptions.Item>
                  </Descriptions>

                  <Card title="Cài đặt Project" style={{ marginTop: 16 }}>
                    <Descriptions column={2} bordered>
                      <Descriptions.Item label="Cho phép thành viên mời người khác">
                        <Tag color={project.settings.allowInvitationByMembers ? 'green' : 'red'}>
                          {project.settings.allowInvitationByMembers ? 'Có' : 'Không'}
                        </Tag>
                      </Descriptions.Item>

                      <Descriptions.Item label="Yêu cầu phê duyệt khi tham gia">
                        <Tag color={project.settings.requireApprovalForJoining ? 'green' : 'red'}>
                          {project.settings.requireApprovalForJoining ? 'Có' : 'Không'}
                        </Tag>
                      </Descriptions.Item>

                      <Descriptions.Item label="Tự động xóa yêu cầu chờ">
                        {project.settings.autoDeletePendingRequests
                          ? `${project.settings.autoDeletePendingRequests} ngày`
                          : 'Không'}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </div>
              ),
            },
            {
              key: 'invitations',
              label: 'Mã mời',
              children: <ProjectInvitations projectId={projectId} projectName={project.name} />,
            },
            {
              key: 'requests',
              label: 'Yêu cầu tham gia',
              children: <ProjectJoinRequests projectId={projectId} projectName={project.name} />,
            },
            {
              key: 'members',
              label: 'Thành viên',
              children: <ProjectMembers projectId={projectId} projectName={project.name} />,
            },
          ]}
        />
      </Card>

      <EditProjectModal
        visible={editModalVisible}
        project={project}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={() => {
          fetchProjectDetail()
          setEditModalVisible(false)
        }}
      />
    </div>
    
  )

}

