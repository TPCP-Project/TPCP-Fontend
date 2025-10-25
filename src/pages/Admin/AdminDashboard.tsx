import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, App } from 'antd'
import {
  UserOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  CrownOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { adminService, DashboardStats } from '@/services/adminService'

export default function AdminDashboard() {
  const { message } = App.useApp()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await adminService.getDashboardStats()
      setStats(res.data)
    } catch (error: any) {
      message.error('Không thể tải thống kê: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: 24 }}>📊 Admin Dashboard</h1>

      <Row gutter={[16, 16]}>
        {/* User Statistics */}
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng Users"
              value={stats?.users.total || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Users Hoạt Động"
              value={stats?.users.active || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Users Bị Ban"
              value={stats?.users.banned || 0}
              prefix={<StopOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Subscription Đang Hoạt Động"
              value={stats?.subscriptions.active || 0}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        {/* Purchase Statistics */}
        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading}>
            <Statistic
              title="Tổng Đơn Hàng"
              value={stats?.purchases.total || 0}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading}>
            <Statistic
              title="Đơn Hàng Chờ Xử Lý"
              value={stats?.purchases.pending || 0}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading}>
            <Statistic
              title="Đơn Hàng Hoàn Thành"
              value={stats?.purchases.completed || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        {/* Revenue */}
        <Col xs={24}>
          <Card loading={loading}>
            <Statistic
              title="Tổng Doanh Thu"
              value={stats?.revenue.total || 0}
              prefix={<DollarOutlined />}
              suffix="VND"
              valueStyle={{ color: '#52c41a', fontSize: 32 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Thống Kê Users" loading={loading}>
            <div style={{ padding: '20px 0' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Hoạt động</span>
                  <span style={{ fontWeight: 600 }}>
                    {stats?.users.total
                      ? Math.round((stats.users.active / stats.users.total) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: '#f0f0f0',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      background: '#52c41a',
                      width: `${stats?.users.total ? (stats.users.active / stats.users.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Bị Ban</span>
                  <span style={{ fontWeight: 600 }}>
                    {stats?.users.total
                      ? Math.round((stats.users.banned / stats.users.total) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: '#f0f0f0',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      background: '#ff4d4f',
                      width: `${stats?.users.total ? (stats.users.banned / stats.users.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Thống Kê Đơn Hàng" loading={loading}>
            <div style={{ padding: '20px 0' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Hoàn thành</span>
                  <span style={{ fontWeight: 600 }}>
                    {stats?.purchases.total
                      ? Math.round((stats.purchases.completed / stats.purchases.total) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: '#f0f0f0',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      background: '#52c41a',
                      width: `${stats?.purchases.total ? (stats.purchases.completed / stats.purchases.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Chờ xử lý</span>
                  <span style={{ fontWeight: 600 }}>
                    {stats?.purchases.total
                      ? Math.round((stats.purchases.pending / stats.purchases.total) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: '#f0f0f0',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      background: '#faad14',
                      width: `${stats?.purchases.total ? (stats.purchases.pending / stats.purchases.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
