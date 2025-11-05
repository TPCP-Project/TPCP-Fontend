import React, { useState } from 'react'
import { Button, message, Space } from 'antd'
import { CrownOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { createPayment, mockPaymentSuccess } from '@/services/subscriptionService'

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false)
  const [mockLoading, setMockLoading] = useState(false)

  const handleRealPayment = async () => {
    try {
      setLoading(true)

      const result = await createPayment()

      window.location.href = result.paymentUrl
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể tạo thanh toán. Vui lòng thử lại!'

      message.error(errorMessage)
      console.error('Checkout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMockPayment = async () => {
    try {
      setMockLoading(true)
      await mockPaymentSuccess()
      message.success('Đã kích hoạt Pro!')
      setTimeout(() => {
        window.location.href = '/payment/success'
      }, 1000)
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Mock payment thất bại'
      message.error(errorMessage)
    } finally {
      setMockLoading(false)
    }
  }


  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Button
        type="primary"
        size="large"
        icon={<CrownOutlined />}
        onClick={handleRealPayment}
        loading={loading}
        block
        style={{
          height: '48px',
          fontSize: '16px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          border: 'none',
          boxShadow: '0 8px 25px rgba(124, 58, 237, 0.3)',
        }}
      >
        {loading ? 'Đang xử lý...' : 'Thanh toán VNPay (1.5M VNĐ)'}
      </Button>


      {/* Mock Payment - CHỈ HIỆN KHI DEVELOPMENT */}
      {import.meta.env.DEV && (
        <Button
          type="dashed"
          size="large"
          icon={<ThunderboltOutlined />}
          onClick={handleMockPayment}
          loading={mockLoading}
          block
          style={{
            height: '48px',
            fontSize: '14px',
          }}
        >
          🔧 Test Payment (Skip VNPay)
        </Button>
      )}
    </Space>
  )
  
}
