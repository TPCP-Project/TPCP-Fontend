// src/pages/JoinProject/JoinProject.tsx
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, Button, Spin, Result, Typography, Space, Divider } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, UserAddOutlined } from '@ant-design/icons'
import JoinProjectByInviteCode from '@/components/JoinProjectByInviteCode'
import { invitationService } from '@/services/invitationService'
import { getAxiosErrorMessage } from '@/utils/httpError'

const { Title, Paragraph } = Typography

export default function JoinProject() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const inviteCode = searchParams.get('code')

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'pending'>('idle')
  const [message, setMessage] = useState('')
  const [projectName, setProjectName] = useState('')

  useEffect(() => {
    if (inviteCode) {
      handleAutoJoin(inviteCode)
    }
  }, [inviteCode])

  const handleAutoJoin = async (code: string) => {
    setLoading(true)
    try {
      const response = await invitationService.joinByInviteCode({
        inviteCode: code,
      })

      // Check if pending approval
      if (response.data.request_id) {
        setStatus('pending')
        setMessage('Yêu cầu của bạn đang chờ được phê duyệt bởi người quản lý project')
        setProjectName(response.data.projectName || '')
      } else {
        setStatus('success')
        setMessage(response.message || 'Bạn đã tham gia project thành công!')
        setProjectName(response.data.projectName || '')
      }
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      setStatus('error')
      setMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f5'
      }}>
        <Card style={{ maxWidth: 500, textAlign: 'center' }}>
          <Spin size="large" />
          <p style={{ marginTop: 20, fontSize: 16 }}>Đang xử lý lời mời...</p>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f5',
        padding: 20
      }}>
        <Result
          status="success"
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          title="Tham gia thành công!"
          subTitle={
            <Space direction="vertical" size={4}>
              <span>{message}</span>
              {projectName && <span>Project: <strong>{projectName}</strong></span>}
            </Space>
          }
          extra={[
            <Button type="primary" key="projects" onClick={() => navigate('/dashboard/projects')}>
              Đến Projects
            </Button>,
            <Button key="dashboard" onClick={() => navigate('/dashboard')}>
              Về Dashboard
            </Button>,
          ]}
        />
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f5',
        padding: 20
      }}>
        <Result
          status="info"
          icon={<UserAddOutlined style={{ color: '#1890ff', fontSize: 72 }} />}
          title="Yêu cầu đang chờ phê duyệt"
          subTitle={
            <Space direction="vertical" size={4}>
              <span>{message}</span>
              {projectName && <span>Project: <strong>{projectName}</strong></span>}
            </Space>
          }
          extra={[
            <Button type="primary" key="dashboard" onClick={() => navigate('/dashboard')}>
              Về Dashboard
            </Button>,
          ]}
        />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f5',
        padding: 20
      }}>
        <Card style={{ maxWidth: 600 }}>
          <Result
            status="error"
            icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            title="Không thể tham gia project"
            subTitle={message}
            extra={[
              <Button key="retry" onClick={() => navigate('/projects/join')}>
                Thử lại
              </Button>,
              <Button type="primary" key="dashboard" onClick={() => navigate('/dashboard')}>
                Về Dashboard
              </Button>,
            ]}
          />

          <Divider />

          <Title level={5}>Hoặc nhập mã mời thủ công:</Title>
          <JoinProjectByInviteCode />
        </Card>
      </div>
    )
  }

  // Default: Show manual invite code input
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f5f5f5',
      padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 500 }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>
          Tham gia Project
        </Title>
        <JoinProjectByInviteCode />

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Button onClick={() => navigate('/dashboard')}>
            Về Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
