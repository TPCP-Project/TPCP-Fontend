// src/pages/Overview/Overview.tsx
import React from 'react'
import { Card, Row, Col, Typography } from 'antd'
import {
  ProjectOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import styles from './Overview.module.css'

const { Text } = Typography

export default function Overview() {
  const stats = [
    { title: 'Tổng dự án', value: 12, icon: ProjectOutlined, color: 'blue' },
    { title: 'Công việc đang làm', value: 28, icon: CheckSquareOutlined, color: 'green' },
    { title: 'Thành viên', value: 45, icon: TeamOutlined, color: 'purple' },
    { title: 'Tỷ lệ hoàn thành', value: 85, suffix: '%', icon: TrophyOutlined, color: 'orange' },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard Overview</h1>
        <Text className={styles.subtitle}>Tổng quan về dự án và công việc của bạn</Text>
      </div>

      <Row gutter={[24, 24]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className={`${styles.statCard} ${styles[stat.color]}`} bordered={false}>
              <div className={styles.statContent}>
                <div className={`${styles.statIcon} ${styles[stat.color]}`}>
                  <stat.icon />
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statLabel}>{stat.title}</div>
                  <div className={styles.statValue}>
                    {stat.value}
                    {stat.suffix && <span className={styles.statSuffix}>{stat.suffix}</span>}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title={<span className={styles.cardTitle}>Dự án gần đây</span>}
            className={styles.largeCard}
            bordered={false}
          >
            <div className={styles.emptyState}>
              <ProjectOutlined className={styles.emptyIcon} />
              <Text className={styles.emptyText}>Chưa có dự án nào</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={<span className={`${styles.cardTitle} ${styles.purple}`}>Thông báo</span>}
            className={styles.largeCard}
            bordered={false}
          >
            <div className={styles.emptyState}>
              <div className={styles.emptyIconCircle}>🔔</div>
              <Text className={styles.emptyText}>Chưa có thông báo mới</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
