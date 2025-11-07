import React from 'react'
import { Card, Result, Button } from 'antd'
import { useSearchParams } from 'react-router-dom'

export default function PaymentFailed() {
  const [searchParams] = useSearchParams()
  const error = searchParams.get('error') || 'Thanh toán không thành công'

  return (
    <div style={{ padding: '40px 24px', maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <Result
          status="error"
          title="Thanh toán thất bại"
          subTitle={error}
          extra={[
            <Button type="primary" key="retry" href="/pricing">
              Thử lại
            </Button>,
            <Button key="dashboard" href="/dashboard">
              Về Dashboard
            </Button>,
          ]}
        />
      </Card>
    </div>
  )
}
