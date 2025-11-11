// src/pages/Pricing/Pricing.tsx - Updated with dynamic packages
import React, { useEffect, useState } from 'react'
import { Card, Button, Typography, Row, Col, Tag, Spin, App } from 'antd'
import {
  CheckOutlined,
  CrownOutlined,
  RocketOutlined,
  StarOutlined,
} from '@ant-design/icons'
import styles from './Pricing.module.css'
import { http } from '@/services/httpClient'
import { SubscriptionPackage } from '@/services/adminService'
import CheckoutButton from '@/components/CheckoutButton'
import { getSubscriptionStatus } from '@/services/subscriptionService'

const { Title, Text, Paragraph } = Typography

export default function Pricing() {
  const { message } = App.useApp()
  const [packages, setPackages] = useState<SubscriptionPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [isActive, setIsActive] = useState<boolean | null>(null)

  useEffect(() => {
    fetchPackages()
    checkSubscriptionStatus()
  }, [])

  const checkSubscriptionStatus = async () => {
    try {
      const status = await getSubscriptionStatus()
      setIsActive(!!status?.isActive)
    } catch {
      setIsActive(false)
    }
  }

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const response = await http.get('/api/admin/packages/public', {
        params: { isActive: true }
      })
      setPackages(response.data.data.packages || [])
    } catch (error: any) {
      message.error('Không thể tải danh sách gói: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const getPlanIcon = (index: number) => {
    const icons = [<StarOutlined />, <RocketOutlined />, <CrownOutlined />]
    return icons[index % 3]
  }

  const getPlanColor = (index: number) => {
    const colors = ['blue', 'purple', 'gold']
    return colors[index % 3]
  }

  const formatDuration = (duration: { value: number; unit: string }) => {
    const unitMap: any = {
      days: 'ngày',
      months: 'tháng',
      years: 'năm'
    }
    return `${duration.value} ${unitMap[duration.unit] || duration.unit}`
  }

  const handleSelectPlan = (pkg: SubscriptionPackage) => {
    // Navigate to payment or checkout
    message.info(`Đã chọn gói: ${pkg.name}`)
    // TODO: Navigate to checkout with package ID
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Đang tải gói dịch vụ...</p>
      </div>
    )
  }

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
        {packages.map((pkg, index) => (
          <Col xs={24} sm={12} lg={8} key={pkg._id}>
            <Card
              className={`${styles.planCard} ${pkg.isPopular ? styles.popular : ''}`}
              bordered={false}
            >
              {pkg.isPopular && (
                <div className={styles.popularBadge}>
                  <Tag color="purple">Phổ biến nhất</Tag>
                </div>
              )}

              <div className={`${styles.planIcon} ${styles[getPlanColor(index)]}`}>
                {getPlanIcon(index)}
              </div>

              <Title level={3} className={styles.planName}>
                {pkg.name}
              </Title>

              <div className={styles.planPrice}>
                <span className={styles.price}>
                  {pkg.price.toLocaleString()} {pkg.currency}
                </span>
                <span className={styles.period}>/ {formatDuration(pkg.duration)}</span>
              </div>

              <Text className={styles.planDescription}>{pkg.description}</Text>

              <ul className={styles.featureList}>
                <li>
                  <CheckOutlined className={styles.checkIcon} />
                  <span>Tối đa {pkg.limits.maxProjects} projects</span>
                </li>
                <li>
                  <CheckOutlined className={styles.checkIcon} />
                  <span>Tối đa {pkg.limits.maxMembers} members</span>
                </li>
                <li>
                  <CheckOutlined className={styles.checkIcon} />
                  <span>Tối đa {pkg.limits.maxTasks} tasks</span>
                </li>
                <li>
                  <CheckOutlined className={styles.checkIcon} />
                  <span>{pkg.limits.maxStorage}MB storage</span>
                </li>
                {pkg.features.filter(f => f.enabled).map((feature, i) => (
                  <li key={i}>
                    <CheckOutlined className={styles.checkIcon} />
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>

              {isActive ? (
                <Button
                  type="default"
                  size="large"
                  block
                  className={styles.planButton}
                  disabled
                >
                  Đã có gói đang hoạt động
                </Button>
              ) : (
                <CheckoutButton
                  packageId={pkg._id}
                  packageName={pkg.name}
                  amount={pkg.price}
                  buttonProps={{
                    type: pkg.isPopular ? 'primary' : 'default',
                    size: 'large',
                    block: true,
                    className: styles.planButton
                  }}
                  buttonText={`Chọn gói ${pkg.name}`}
                />
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
