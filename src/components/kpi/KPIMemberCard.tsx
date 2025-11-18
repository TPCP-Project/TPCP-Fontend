import React from 'react'
import { Card, Avatar, Tag, Progress, Row, Col, Statistic } from 'antd'
import { UserOutlined, CheckCircleOutlined, ClockCircleOutlined, StopOutlined, WarningOutlined } from '@ant-design/icons'
import { KPIMemberData } from '../../services/kpiService'


interface KPIMemberCardProps {
  data: KPIMemberData
}


const statusColors = {
  Good: { bg: '#f6ffed', border: '#52c41a', text: '#52c41a' },
  Warning: { bg: '#fffbe6', border: '#faad14', text: '#faad14' },
  Critical: { bg: '#fff1f0', border: '#ff4d4f', text: '#ff4d4f' },
}

const statusIcons = {
  Good: <CheckCircleOutlined />,
  Warning: <WarningOutlined />,
  Critical: <StopOutlined />,
}


const statusText = {
  Good: 'Tốt',
  Warning: 'Cảnh báo',
  Critical: 'Nguy hiểm',
}


const getAvatarColor = (name?: string, email?: string) => {
  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2']
  const str = name || email || ''
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}


export const KPIMemberCard: React.FC<KPIMemberCardProps> = ({ data }) => {
  const { employee, role, kpi } = data
  const statusColor = statusColors[kpi.status]
  const avatarColor = getAvatarColor(employee.name, employee.email)


  return (
    <Card
      style={{
        marginBottom: 16,
        borderLeft: `4px solid ${statusColor.border}`,
        backgroundColor: statusColor.bg,
        transition: 'all 0.3s ease',
      }}
      hoverable
    >

      {/* Header: Avatar + Name + Score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={48}
            style={{ backgroundColor: avatarColor, fontWeight: 600 }}
            icon={<UserOutlined />}
          >
            {employee.name?.[0]?.toUpperCase() || employee.email[0].toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>
              {employee.name || employee.username || employee.email}
            </div>
            <Tag color={role === 'owner' ? 'red' : role === 'admin' ? 'blue' : 'default'}>
              {role.toUpperCase()}
            </Tag>
          </div>
        </div>

        {/* Overall Score */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: statusColor.text }}>
            {kpi.overallScore}
          </div>
          <Tag color={statusColor.text} icon={statusIcons[kpi.status]}>
            {statusText[kpi.status]}
          </Tag>
        </div>
      </div>


      {/* Metrics */}
      <Row gutter={16}>
        <Col span={6}>
          <Statistic
            title="Tổng task"
            value={kpi.taskMetrics.totalTasksAssigned}
            valueStyle={{ fontSize: 20 }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Hoàn thành"
            value={kpi.taskMetrics.tasksCompleted}
            valueStyle={{ fontSize: 20, color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Đang làm"
            value={kpi.taskMetrics.tasksInProgress}
            valueStyle={{ fontSize: 20, color: '#1890ff' }}
            prefix={<ClockCircleOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Quá hạn"
            value={kpi.taskMetrics.tasksOverdue}
            valueStyle={{ fontSize: 20, color: '#ff4d4f' }}
            prefix={<WarningOutlined />}
          />
        </Col>
      </Row>


      {/* Progress Bars */}
      <div style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#666' }}>Tỷ lệ hoàn thành: </span>
          <span style={{ fontWeight: 600 }}>{kpi.taskMetrics.completionRate}%</span>
        </div>
        <Progress
          percent={kpi.taskMetrics.completionRate}
          strokeColor={kpi.taskMetrics.completionRate >= 70 ? '#52c41a' : kpi.taskMetrics.completionRate >= 50 ? '#faad14' : '#ff4d4f'}
          showInfo={false}
        />

        <div style={{ marginBottom: 8, marginTop: 12 }}>
          <span style={{ fontSize: 12, color: '#666' }}>Hoàn thành đúng hạn: </span>
          <span style={{ fontWeight: 600 }}>{kpi.taskMetrics.onTimeRate}%</span>
        </div>
        <Progress
          percent={kpi.taskMetrics.onTimeRate}
          strokeColor="#1890ff"
          showInfo={false}
        />
      </div>

      {/* Additional Info */}
      {kpi.taskMetrics.averageCompletionTime > 0 && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
          Thời gian hoàn thành TB: <strong>{kpi.taskMetrics.averageCompletionTime} ngày</strong>
        </div>
      )}

      {kpi.taskMetrics.tasksBlocked > 0 && (
        <Tag color="red" style={{ marginTop: 8 }}>
          <StopOutlined /> {kpi.taskMetrics.tasksBlocked} task bị chặn
        </Tag>
      )}
    </Card> 

  )
}
