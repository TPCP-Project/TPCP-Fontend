// src/components/common/Layout/DashboardLayout.tsx
import React, { useState } from 'react'
import { Layout, Menu, Avatar, Typography, Button, Space, Dropdown, Badge, Input } from 'antd'
import type { MenuProps } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  UserOutlined,
  ProjectOutlined,
  TeamOutlined,
  CheckSquareOutlined,
  MessageOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  RobotOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TrophyOutlined,
  CreditCardOutlined,
  UploadOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import { useAuth } from '@/context/AuthContext'
import styles from './DashboardLayout.module.css'

const { Sider, Content, Header } = Layout
const { Text, Title } = Typography

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const getMenuItems = () => {
    const baseItems = [
      { key: '/dashboard', icon: <BarChartOutlined />, label: 'Tổng quan' },
      { key: '/dashboard/projects', icon: <ProjectOutlined />, label: 'Dự án' },
      { key: '/dashboard/tasks', icon: <CheckSquareOutlined />, label: 'Công việc' },
      { key: '/dashboard/kanban', icon: <AppstoreOutlined />, label: 'Kanban Board' },
      { key: '/dashboard/team', icon: <TeamOutlined />, label: 'Nhóm' },
      { key: '/dashboard/chat', icon: <MessageOutlined />, label: 'Trò chuyện' },
      { key: '/dashboard/kpi', icon: <TrophyOutlined />, label: 'KPI' },
      { key: '/dashboard/upload', icon: <UploadOutlined />, label: 'Upload (Pro)' },
      { key: '/dashboard/payment', icon: <CreditCardOutlined />, label: 'Thanh toán' },
    ]

    if (user?.role === 'admin' || user?.role === 'manager') {
      baseItems.push({
        key: '/dashboard/ai',
        icon: <RobotOutlined />,
        label: 'AI Assistant',
      })
    }

    return baseItems
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => navigate('/dashboard/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => navigate('/dashboard/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: logout,
      danger: true,
    },
  ]

  return (
    <Layout className={styles.layout}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        theme="dark"
        className={styles.sider}
      >
        <div className={styles.logoArea}>
          <div className={styles.logo}>PM</div>
          {!collapsed && <span className={styles.logoText}>Project Manager</span>}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className={styles.toggleButton}
            />
            <Title level={4} className={styles.pageTitle}>
              {getMenuItems().find((item) => item.key === location.pathname)?.label || 'Dashboard'}
            </Title>
          </div>

          <Space size="middle" className={styles.headerRight}>
            <Input.Search placeholder="Tìm kiếm..." className={styles.searchInput} />
            <Badge count={3}>
              <Button type="text" icon={<BellOutlined />} className={styles.notificationBtn} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
              <div className={styles.userMenu}>
                <Avatar icon={<UserOutlined />} className={styles.userAvatar} />
                <div className={styles.userInfo}>
                  <Text className={styles.userName}>{user?.name}</Text>
                  <Text className={styles.userRole}>{user?.role}</Text>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
