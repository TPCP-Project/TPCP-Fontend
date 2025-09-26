// src/pages/Pricing/Pricing.tsx
import React from 'react'
import { Card, Button, Typography, Row, Col, Table, Tag } from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  CrownOutlined,
  RocketOutlined,
  StarOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import styles from './Pricing.module.css'

const { Title, Text, Paragraph } = Typography

interface Feature {
  name: string
  free: boolean
  pro: boolean
  business: boolean
  enterprise: boolean
  key: string
  isCategory?: boolean
}

export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '0đ',
      period: 'miễn phí',
      icon: <StarOutlined />,
      color: 'blue',
      description: 'Phù hợp cho cá nhân thử nghiệm',
      features: [
        'Tạo 1 project',
        'Mời tối đa 3 thành viên',
        'Chat nhóm cơ bản',
        'Tạo task & update trạng thái',
      ],
      buttonText: 'Bắt đầu miễn phí',
      popular: false,
    },
    {
      name: 'Pro / Team',
      price: '300K - 500K',
      period: '/ tháng / team',
      icon: <RocketOutlined />,
      color: 'purple',
      description: '5-10 users, phù hợp team nhỏ',
      features: [
        'Nhiều project (tối đa 10)',
        'Phân quyền cơ bản',
        'Gán task, upload file',
        'Thông báo trễ hạn',
        'Chat 1-1, search chat',
        'Email/Slack notification',
      ],
      buttonText: 'Chọn gói Pro',
      popular: true,
    },
    {
      name: 'Business',
      price: '1.5M - 3M',
      period: '/ tháng / team',
      icon: <TrophyOutlined />,
      color: 'orange',
      description: '20+ users, full KPI + AI',
      features: [
        'Không giới hạn project',
        'Phân quyền nâng cao',
        'Tích hợp API & automation',
        'KPI & Performance tracking',
        'AI Chatbot nội bộ',
        'AI phân tích campaign',
        'Push/Email notification',
      ],
      buttonText: 'Chọn gói Business',
      popular: false,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'theo nhu cầu',
      icon: <CrownOutlined />,
      color: 'gold',
      description: 'Hợp đồng năm, triển khai riêng',
      features: [
        'Full Admin console',
        'SSO & User provisioning',
        'Audit log & báo cáo',
        'AI tùy chỉnh theo data riêng',
        'Tích hợp đa kênh',
        'Hỗ trợ ưu tiên 24/7',
        'Export KPI tự động',
      ],
      buttonText: 'Liên hệ tư vấn',
      popular: false,
    },
  ]

  const featureComparison = [
    {
      category: 'Authentication & User Management',
      features: [
        {
          name: 'Đăng ký, Đăng nhập, Reset mật khẩu, Update profile',
          free: true,
          pro: true,
          business: true,
          enterprise: true,
        },
        {
          name: 'Nâng cấp gói + Quản lý subscription',
          free: false,
          pro: true,
          business: true,
          enterprise: true,
        },
        {
          name: 'Full control + hỗ trợ SSO',
          free: false,
          pro: false,
          business: false,
          enterprise: true,
        },
      ],
    },
    {
      category: 'Project & Team Management',
      features: [
        {
          name: 'Tạo 1 project, mời tối đa 3 thành viên',
          free: true,
          pro: false,
          business: false,
          enterprise: false,
        },
        {
          name: 'Nhiều project (tối đa 10), phân quyền cơ bản',
          free: false,
          pro: true,
          business: false,
          enterprise: false,
        },
        {
          name: 'Không giới hạn project, phân quyền nâng cao',
          free: false,
          pro: false,
          business: true,
          enterprise: true,
        },
        {
          name: 'Audit log, user provisioning',
          free: false,
          pro: false,
          business: false,
          enterprise: true,
        },
      ],
    },
    {
      category: 'Task & Workflow',
      features: [
        {
          name: 'Tạo task, update trạng thái, bình luận',
          free: true,
          pro: true,
          business: true,
          enterprise: true,
        },
        {
          name: 'Gán task, upload file, thông báo trễ hạn',
          free: false,
          pro: true,
          business: true,
          enterprise: true,
        },
        {
          name: 'Tích hợp email/slack notification',
          free: false,
          pro: false,
          business: true,
          enterprise: true,
        },
        {
          name: 'API mở rộng, automation',
          free: false,
          pro: false,
          business: true,
          enterprise: true,
        },
      ],
    },
    {
      category: 'KPI & Performance',
      features: [
        {
          name: 'Tạo/Chỉnh KPI, xem báo cáo',
          free: false,
          pro: false,
          business: true,
          enterprise: true,
        },
        {
          name: 'Export KPI report tự động, dashboard nâng cao',
          free: false,
          pro: false,
          business: false,
          enterprise: true,
        },
      ],
    },
    {
      category: 'Communication',
      features: [
        { name: 'Chat nhóm cơ bản', free: true, pro: true, business: true, enterprise: true },
        { name: 'Chat 1-1, search chat', free: false, pro: true, business: true, enterprise: true },
        {
          name: 'Push/email notification',
          free: false,
          pro: false,
          business: true,
          enterprise: true,
        },
        {
          name: 'Tích hợp đa kênh (Teams, Slack, FB Workplace)',
          free: false,
          pro: false,
          business: false,
          enterprise: true,
        },
      ],
    },
    {
      category: 'AI & Premium Features',
      features: [
        {
          name: 'AI Chatbot nội bộ, AI phân tích campaign',
          free: false,
          pro: false,
          business: true,
          enterprise: true,
        },
        {
          name: 'AI tùy chỉnh theo data riêng, hỗ trợ tư vấn khách hàng FB nâng cao',
          free: false,
          pro: false,
          business: false,
          enterprise: true,
        },
      ],
    },
    {
      category: 'Administration',
      features: [
        {
          name: 'Full Admin console, báo cáo audit, hỗ trợ ưu tiên',
          free: false,
          pro: false,
          business: false,
          enterprise: true,
        },
      ],
    },
  ]

  const tableColumns = [
    {
      title: 'Tính năng',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
      render: (text: string, record: Feature) =>
        record.isCategory ? (
          <Text strong style={{ fontSize: '16px', color: '#4f46e5' }}>
            {text}
          </Text>
        ) : (
          <Text>{text}</Text>
        ),
    },
    {
      title: 'Free',
      dataIndex: 'free',
      key: 'free',
      align: 'center' as const,
      render: (value: boolean, record: Feature) =>
        record.isCategory ? null : value ? (
          <CheckOutlined style={{ color: '#10b981', fontSize: '18px' }} />
        ) : (
          <CloseOutlined style={{ color: '#d1d5db', fontSize: '18px' }} />
        ),
    },
    {
      title: 'Pro',
      dataIndex: 'pro',
      key: 'pro',
      align: 'center' as const,
      render: (value: boolean, record: Feature) =>
        record.isCategory ? null : value ? (
          <CheckOutlined style={{ color: '#10b981', fontSize: '18px' }} />
        ) : (
          <CloseOutlined style={{ color: '#d1d5db', fontSize: '18px' }} />
        ),
    },
    {
      title: 'Business',
      dataIndex: 'business',
      key: 'business',
      align: 'center' as const,
      render: (value: boolean, record: Feature) =>
        record.isCategory ? null : value ? (
          <CheckOutlined style={{ color: '#10b981', fontSize: '18px' }} />
        ) : (
          <CloseOutlined style={{ color: '#d1d5db', fontSize: '18px' }} />
        ),
    },
    {
      title: 'Enterprise',
      dataIndex: 'enterprise',
      key: 'enterprise',
      align: 'center' as const,
      render: (value: boolean, record: Feature) =>
        record.isCategory ? null : value ? (
          <CheckOutlined style={{ color: '#10b981', fontSize: '18px' }} />
        ) : (
          <CloseOutlined style={{ color: '#d1d5db', fontSize: '18px' }} />
        ),
    },
  ]

  const tableData: Feature[] = featureComparison.flatMap((cat) => [
    {
      key: cat.category,
      name: cat.category,
      free: false,
      pro: false,
      business: false,
      enterprise: false,
      isCategory: true,
    },
    ...cat.features.map((f, i) => ({ key: `${cat.category}-${i}`, ...f })),
  ])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={1} className={styles.title}>
          Bảng giá dịch vụ
        </Title>
        <Paragraph className={styles.subtitle}>
          Chọn gói phù hợp với quy mô và nhu cầu của team bạn
        </Paragraph>
      </div>

      <Row gutter={[24, 24]} className={styles.plansGrid}>
        {plans.map((plan, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              className={`${styles.planCard} ${plan.popular ? styles.popular : ''}`}
              bordered={false}
            >
              {plan.popular && (
                <div className={styles.popularBadge}>
                  <Tag color="purple">Phổ biến nhất</Tag>
                </div>
              )}

              <div className={`${styles.planIcon} ${styles[plan.color]}`}>{plan.icon}</div>

              <Title level={3} className={styles.planName}>
                {plan.name}
              </Title>

              <div className={styles.planPrice}>
                <span className={styles.price}>{plan.price}</span>
                <span className={styles.period}>{plan.period}</span>
              </div>

              <Text className={styles.planDescription}>{plan.description}</Text>

              <ul className={styles.featureList}>
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <CheckOutlined className={styles.checkIcon} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                type={plan.popular ? 'primary' : 'default'}
                size="large"
                block
                className={styles.planButton}
              >
                {plan.buttonText}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <div className={styles.comparisonSection}>
        <Title level={2} className={styles.comparisonTitle}>
          So sánh chi tiết tính năng
        </Title>
        <Card bordered={false} className={styles.comparisonCard}>
          <Table
            columns={tableColumns}
            dataSource={tableData}
            pagination={false}
            rowClassName={(record) => (record.isCategory ? styles.categoryRow : '')}
          />
        </Card>
      </div>
    </div>
  )
}
