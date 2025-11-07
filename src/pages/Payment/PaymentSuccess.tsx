import React, { useEffect, useState } from 'react'
import { Card, Result, Button, Spin, Typography } from 'antd'
import { getSubscriptionStatus, type SubscriptionStatus } from '@/services/subscriptionService'

const { Text } = Typography

export default function PaymentSuccess() {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const data = await getSubscriptionStatus()
        setStatus(data)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <Spin size="large" />
      </div>
    )

  if (!status?.isActive) {
    return (
      <Result
        status="warning"
        title="Thanh toán chưa kích hoạt"
        subTitle="Vui lòng chờ 1 phút và refresh, hoặc liên hệ hỗ trợ."
        extra={
          <Button type="primary" href="/dashboard">
            Về Dashboard
          </Button>
        }
      />
    )
  }

  return (
    <Card style={{ maxWidth: 640, margin: '24px auto' }}>
      <Result
        status="success"
        title="Kích hoạt gói Pro thành công!"
        subTitle={
          <div>
            <div>
              Hạn:{' '}
              <Text strong>
                {status.subscriptionExpiresAt
                  ? new Date(status.subscriptionExpiresAt).toLocaleString()
                  : '-'}
              </Text>
            </div>
            <div>
              Còn lại: <Text strong>{status.daysRemaining ?? 0}</Text> ngày
            </div>
          </div>
        }
        extra={
          <Button type="primary" href="/dashboard">
            Về Dashboard
          </Button>
        }
      />
    </Card>
  )
}
