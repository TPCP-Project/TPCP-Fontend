import React, { useEffect, useState } from 'react'
import { Card, Result, Button, Spin } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { getSubscriptionStatus } from '@/services/subscriptionService'

interface SubscriptionGuardProps {
  children: React.ReactElement
}


export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const [loading, setLoading] = useState(true)
  const [isActive, setIsActive] = useState(false)
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null)


  useEffect(() => {
    checkSubscription()
  }, [])


  const checkSubscription = async () => {
    try {
      const status = await getSubscriptionStatus()
      setIsActive(status?.isActive || false)
      setSubscriptionPlan(status?.subscriptionPlan || null)
    } catch (error) {
      console.error('Failed to check subscription:', error)
      setIsActive(false)
    } finally {
      setLoading(false)
    }

  }


  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <Spin size="large" tip="Đang kiểm tra gói đăng ký..." />
      </div>

    )


  }


  if (!isActive) {
    return (
      <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
        <Card>
          <Result
            icon={<LockOutlined style={{ color: '#faad14' }} />}
            status="warning"
            title="Tính năng Pro"
            subTitle={
              subscriptionPlan === 'basic'
                ? 'Bạn cần nâng cấp lên gói Pro để sử dụng tính năng này'
                : 'Bạn cần đăng ký gói Pro để sử dụng tính năng này'
            }
            extra={[
              <Button type="primary" key="upgrade" href="/pricing" size="large">
                Nâng cấp gói Pro
              </Button>,
              <Button key="back" href="/dashboard">
                Quay lại Dashboard
              </Button>,
            ]}
          >

            <div style={{ marginTop: 24 }}>
              <h4>Các tính năng Pro bao gồm:</h4>
              <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                <li>Upload dữ liệu sản phẩm không giới hạn</li>
                <li>AI Chatbot tư vấn thông minh</li>
                <li>Tích hợp Facebook Messenger</li>
                <li>Phân tích và báo cáo chi tiết</li>
                <li>Hỗ trợ ưu tiên 24/7</li>
              </ul>
            </div>
          </Result>
        </Card>
      </div>
    )
  }


  return children

}
