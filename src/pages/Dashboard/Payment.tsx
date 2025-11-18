import React, { useEffect, useState } from 'react'
import {
  Card,
  Button,
  Typography,
  Space,
  Table,
  Tag,
  Statistic,
  Row,
  Col,
  message,
  Modal,
} from 'antd'
import {
  CreditCardOutlined,
  HistoryOutlined,
  ReloadOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import {
  getSubscriptionStatus,
  getPaymentHistory,
  renewSubscription,
  cancelSubscription,
  type SubscriptionStatus,
  type PaymentHistory,
} from '@/services/subscriptionService'

const { Title, Text, Paragraph } = Typography



export default function Payment() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory | null>(null)
  const [loading, setLoading] = useState(false)
  const [renewLoading, setRenewLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)


  useEffect(() => {
    loadSubscriptionStatus()
    loadPaymentHistory()
  }, [])


  const loadSubscriptionStatus = async () => {
    try {
      setLoading(true)
      const status = await getSubscriptionStatus()
      setSubscription(status)
    } catch {
      message.error('Không thể tải thông tin subscription')
    } finally {
      setLoading(false)
    }

  }

  const loadPaymentHistory = async () => {
    try {
      const history = await getPaymentHistory()
      setPaymentHistory(history)
    } catch (error) {
      console.error('Failed to load payment history:', error)
    }

  }

  const handleRenew = async () => {
    try {
      setRenewLoading(true)
      const result = await renewSubscription()
      window.location.href = result.paymentUrl
    } catch {
      message.error('Không thể tạo thanh toán gia hạn')
    } finally {
      setRenewLoading(false)
    }

  }


  const handleCancel = () => {
    Modal.confirm({
      title: 'Xác nhận hủy subscription',
      content:
        'Bạn có chắc chắn muốn hủy gói đăng ký? Bạn sẽ mất quyền truy cập các tính năng Pro.',
      okText: 'Hủy subscription',
      cancelText: 'Không',
      okType: 'danger',
      onOk: async () => {
        try {
          setCancelLoading(true)
          await cancelSubscription()
          message.success('Đã hủy subscription thành công')
          await loadSubscriptionStatus()
        } catch {
          message.error('Không thể hủy subscription')
        } finally {
          setCancelLoading(false)
        }
      },
    })

  }

  const getStatusColor = (status: string | null | undefined): string => {
    switch (status) {
      case 'active':
        return 'green'
      case 'expired':
        return 'red'
      case 'cancelled':
        return 'orange'
      default:
        return 'default'
    }

  }

  const getStatusIcon = (status: string | null | undefined) => {
    switch (status) {
      case 'active':
        return <CheckCircleOutlined />
      case 'expired':
        return <ExclamationCircleOutlined />
      case 'cancelled':
        return <StopOutlined />
      default:
        return <ClockCircleOutlined />
    }

  }

  const getStatusText = (status: string | null | undefined): string => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động'
      case 'expired':
        return 'Đã hết hạn'
      case 'cancelled':
        return 'Đã hủy'
      default:
        return 'Chưa có'
    }

  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  }


  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <CreditCardOutlined /> Quản lý thanh toán
      </Title>
      <Paragraph>Quản lý gói đăng ký, xem lịch sử thanh toán và gia hạn subscription.</Paragraph>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Subscription Status */}
        <Card
          title="Trạng thái Subscription"
          extra={
            <Button icon={<ReloadOutlined />} onClick={loadSubscriptionStatus} loading={loading}>
              Làm mới
            </Button>
          }
        >
          {subscription ? (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Gói đăng ký"
                  value={subscription.subscriptionPlan || 'Chưa có'}
                  prefix={
                    <Tag
                      color={getStatusColor(subscription.subscriptionStatus)}
                      icon={getStatusIcon(subscription.subscriptionStatus)}
                    >
                      {getStatusText(subscription.subscriptionStatus)}
                    </Tag>
                  }
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Ngày hết hạn"
                  value={
                    subscription.subscriptionExpiresAt
                      ? formatDate(subscription.subscriptionExpiresAt)
                      : 'N/A'
                  }
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic title="Còn lại" value={subscription.daysRemaining || 0} suffix="ngày" />
              </Col>
            </Row>
          ) : (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Text type="secondary">Chưa có gói đăng ký</Text>
              <br />
              <Button type="primary" href="/pricing" style={{ marginTop: 16 }}>
                Đăng ký ngay
              </Button>
            </div>
          )}
        </Card>

        {/* Actions */}
        {subscription?.hasSubscription && (
          <Card title="Thao tác">
            <Space>
              {subscription.subscriptionStatus === 'active' && (
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={handleRenew}
                  loading={renewLoading}
                >
                  Gia hạn
                </Button>
              )}
              {subscription.subscriptionStatus === 'active' && (
                <Button
                  danger
                  icon={<StopOutlined />}
                  onClick={handleCancel}
                  loading={cancelLoading}
                >
                  Hủy subscription
                </Button>
              )}
              <Button href="/pricing">Xem bảng giá</Button>
            </Space>
          </Card>
        )}

        {/* Payment History */}
        {paymentHistory && (
          <Card title="Lịch sử thanh toán" extra={<HistoryOutlined />}>
            <Table
              dataSource={[paymentHistory]}
              rowKey="customerId"
              pagination={false}
              columns={[
                {
                  title: 'Gói',
                  dataIndex: 'subscriptionPlan',
                  key: 'subscriptionPlan',
                  render: (plan: string) => <Tag color="blue">{plan}</Tag>,
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'subscriptionStatus',
                  key: 'subscriptionStatus',
                  render: (status: string) => (
                    <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
                      {getStatusText(status)}
                    </Tag>
                  ),
                },
                {
                  title: 'Số tiền',
                  dataIndex: ['paymentInfo', 'amount'],
                  key: 'amount',
                  render: (amount: number) => formatCurrency(amount),
                },
                {
                  title: 'Phương thức',
                  dataIndex: ['paymentInfo', 'paymentMethod'],
                  key: 'paymentMethod',
                  render: (method: string) => <Tag color="green">{method.toUpperCase()}</Tag>,
                },
                {
                  title: 'Ngày thanh toán',
                  dataIndex: ['paymentInfo', 'payDate'],
                  key: 'payDate',
                  render: (date: string) => formatDate(date),
                },
                {
                  title: 'Mã giao dịch',
                  dataIndex: ['paymentInfo', 'transactionNo'],
                  key: 'transactionNo',
                  render: (txn: string) => <Text code>{txn}</Text>,
                },
              ]}
            />
          </Card>
        )}
      </Space>
    </div>
  )
}
