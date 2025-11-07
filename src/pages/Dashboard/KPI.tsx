import React, { useState, useEffect } from 'react'
import { Card, Select, DatePicker, Spin, Empty, App, Row, Col, Statistic } from 'antd'
import { TeamOutlined, TrophyOutlined } from '@ant-design/icons'
import { useAuth } from '@/context/AuthContext'
import { projectService } from '@/services/projectService'
import { kpiService, ProjectKPIDashboard } from '@/services/kpiService'
import { KPIMemberCard } from '@/components/kpi/KPIMemberCard'
import dayjs, { Dayjs } from 'dayjs'

const { Option } = Select

export default function KPI() {
  const { message } = App.useApp()
  const { user } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<string>(dayjs().format('YYYY-MM'))
  const [kpiData, setKpiData] = useState<ProjectKPIDashboard | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(true)

  // Fetch user's projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true)
        const res = await projectService.getProjects({ status: 'active' })
        setProjects(res.data.projects || [])

        // Auto-select first project if available
        if (res.data.projects && res.data.projects.length > 0) {
          setSelectedProject(res.data.projects[0]._id)
        }
      } catch (error: any) {
        message.error('Không thể tải danh sách dự án: ' + (error.response?.data?.message || error.message))
      } finally {
        setLoadingProjects(false)
      }
    }

    fetchProjects()
  }, [])

  // Fetch KPI data when project or month changes
  useEffect(() => {
    if (selectedProject && selectedMonth) {
      fetchKpiData()
    }
  }, [selectedProject, selectedMonth])

  const fetchKpiData = async () => {
    try {
      setLoading(true)
      console.log('=== Frontend KPI Request ===')
      console.log('Selected Project:', selectedProject)
      console.log('Selected Month:', selectedMonth)

      const data = await kpiService.getProjectKPIDashboard(selectedProject, selectedMonth)
      console.log('KPI Data received:', data)
      setKpiData(data)
    } catch (error: any) {
      console.error('KPI fetch error:', error)
      message.error('Không thể tải KPI: ' + (error.response?.data?.message || error.message))
      setKpiData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleMonthChange = (date: Dayjs | null) => {
    if (date) {
      setSelectedMonth(date.format('YYYY-MM'))
    }
  }

  // Calculate summary statistics
  const getSummaryStats = () => {
    if (!kpiData || !kpiData.members || kpiData.members.length === 0) {
      return { totalMembers: 0, avgScore: 0, goodCount: 0, warningCount: 0, criticalCount: 0 }
    }

    const totalMembers = kpiData.members.length
    const avgScore = Math.round(
      kpiData.members.reduce((sum, m) => sum + m.kpi.overallScore, 0) / totalMembers
    )
    const goodCount = kpiData.members.filter(m => m.kpi.status === 'Good').length
    const warningCount = kpiData.members.filter(m => m.kpi.status === 'Warning').length
    const criticalCount = kpiData.members.filter(m => m.kpi.status === 'Critical').length

    return { totalMembers, avgScore, goodCount, warningCount, criticalCount }
  }

  const stats = getSummaryStats()

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="📊 KPI Dashboard - Theo dõi hiệu suất đội ngũ"
        style={{ marginBottom: 24 }}
      >
        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>Dự án:</div>
            <Select
              style={{ width: '100%' }}
              placeholder="Chọn dự án"
              value={selectedProject}
              onChange={setSelectedProject}
              loading={loadingProjects}
            >
              {projects.map((project) => (
                <Option key={project._id} value={project._id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>Tháng:</div>
            <DatePicker
              style={{ width: '100%' }}
              picker="month"
              format="YYYY-MM"
              value={dayjs(selectedMonth, 'YYYY-MM')}
              onChange={handleMonthChange}
            />
          </Col>
        </Row>

        {/* Summary Statistics */}
        {kpiData && kpiData.members && kpiData.members.length > 0 && (
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng thành viên"
                  value={stats.totalMembers}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Điểm TB"
                  value={stats.avgScore}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: stats.avgScore >= 70 ? '#52c41a' : stats.avgScore >= 50 ? '#faad14' : '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="Tốt"
                  value={stats.goodCount}
                  valueStyle={{ color: '#52c41a', fontSize: 24 }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="Cảnh báo"
                  value={stats.warningCount}
                  valueStyle={{ color: '#faad14', fontSize: 24 }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="Nguy hiểm"
                  value={stats.criticalCount}
                  valueStyle={{ color: '#ff4d4f', fontSize: 24 }}
                />
              </Card>
            </Col>
          </Row>
        )}
      </Card>

      {/* Member KPI Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#666' }}>Đang tải dữ liệu KPI...</div>
        </div>
      ) : !selectedProject ? (
        <Empty description="Vui lòng chọn dự án để xem KPI" />
      ) : !kpiData || !kpiData.members || kpiData.members.length === 0 ? (
        <Empty description="Không có dữ liệu KPI cho tháng này" />
      ) : (
        <div>
          {kpiData.members.map((memberData, index) => (
            <KPIMemberCard key={`${memberData.employee._id}-${index}`} data={memberData} />
          ))}
        </div>
      )}
    </div>
  )
}
