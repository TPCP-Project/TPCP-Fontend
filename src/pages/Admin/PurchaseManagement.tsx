import React, { useState, useEffect } from 'react'
import { Table, Card, Button, Select, Tag, Space, Modal, Form, Input, App, Badge } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { adminService, Purchase } from '@/services/adminService'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select
const { TextArea } = Input

export default function PurchaseManagement() {
  const { message } = App.useApp()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [statusFilter, setStatusFilter] = useState<string>('')

  const [statusModalVisible, setStatusModalVisible] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)

  const [form] = Form.useForm()

  useEffect(() => {
    fetchPurchases()
  }, [page, statusFilter])

  const fetchPurchases = async () => {
    try {
      setLoading(true)
      const params: any = { page, limit }
      if (statusFilter) params.status = statusFilter

      const res = await adminService.getAllPurchases(params)
      setPurchases(res.data.purchases)
      setTotal(res.data.total)
    } catch (error: any) {
      message.error(
        'Không thể tải danh sách đơn hàng: ' + (error.response?.data?.message || error.message)
      )
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (values: any) => {
    if (!selectedPurchase) return

    try {
      await adminService.updatePurchaseStatus(selectedPurchase._id, values.status, values.notes)
      message.success('Cập nhật trạng thái thành công')
      setStatusModalVisible(false)
      form.resetFields()
      fetchPurchases()
    } catch (error: any) {
      message.error('Lỗi: ' + (error.response?.data?.message || error.message))
    }
  }

  const getStatusTag = (status: string) => {
    const config: any = {
      pending: { color: 'orange', icon: <ClockCircleOutlined />, text: 'CHỜ XỬ LÝ' },
      completed: { color: 'green', icon: <CheckCircleOutlined />, text: 'HOÀN THÀNH' },
      failed: { color: 'red', icon: <CloseCircleOutlined />, text: 'THẤT BẠI' },
      refunded: { color: 'purple', icon: <CloseCircleOutlined />, text: 'HOÀN TIỀN' },
    }

    const { color, icon, text } = config[status] || config.pending

    return (
      <Tag color={color} icon={icon}>
        {text}
      </Tag>
    )
  }

  const columns: ColumnsType<Purchase> = [
    {
      title: 'Mã giao dịch',
      dataIndex: 'transactionId',
      key: 'transactionId',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userId',
      key: 'userId',
      render: (user) => (
        <div>
          <div style={{ fontWeight: 600 }}>{user.name}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{user.email}</div>
        </div>
      ),
    },
    {
      title: 'Gói',
      dataIndex: 'packageId',
      key: 'packageId',
      render: (pkg) => (
        <div>
          <div style={{ fontWeight: 600 }}>{pkg.name}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {pkg.duration.value} {pkg.duration.unit === 'months' ? 'tháng' : 'năm'}
          </div>
        </div>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => (
        <strong style={{ color: '#52c41a' }}>
          {amount.toLocaleString()} {record.currency}
        </strong>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => method || 'N/A',
    },
    {
      title: 'Thời hạn',
      key: 'dates',
      render: (_, record) => {
        if (!record.startDate) return 'Chưa kích hoạt'

        const now = new Date()
        const endDate = new Date(record.endDate!)
        const isExpired = now > endDate

        return (
          <div>
            <div style={{ fontSize: 12 }}>
              Từ: {new Date(record.startDate).toLocaleDateString('vi-VN')}
            </div>
            <div style={{ fontSize: 12, color: isExpired ? '#ff4d4f' : '#52c41a' }}>
              Đến: {endDate.toLocaleDateString('vi-VN')}
            </div>
          </div>
        )
      },
    },
    {
      title: 'Ngày mua',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedPurchase(record)
            form.setFieldsValue({
              status: record.status,
              notes: record.notes || '',
            })
            setStatusModalVisible(true)
          }}
        >
          Cập nhật
        </Button>
      ),
    },
  ]

  const pendingCount = purchases.filter((p) => p.status === 'pending').length

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <h2 style={{ margin: 0 }}>💰 Quản Lý Đơn Hàng</h2>
            {pendingCount > 0 && (
              <Badge count={pendingCount} style={{ backgroundColor: '#faad14' }} />
            )}
          </Space>
        }
        extra={
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: 200 }}
            onChange={setStatusFilter}
            allowClear
          >
            <Option value="pending">Chờ xử lý</Option>
            <Option value="completed">Hoàn thành</Option>
            <Option value="failed">Thất bại</Option>
            <Option value="refunded">Hoàn tiền</Option>
          </Select>
        }
      >
        <Table
          columns={columns}
          dataSource={purchases}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total: total,
            onChange: (newPage) => setPage(newPage),
            showTotal: (total) => `Tổng ${total} đơn hàng`,
          }}
        />
      </Card>

      {/* Modal cập nhật trạng thái */}
      <Modal
        title="Cập Nhật Trạng Thái Đơn Hàng"
        open={statusModalVisible}
        onCancel={() => {
          setStatusModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleUpdateStatus} layout="vertical">
          <Form.Item label="Thông tin đơn hàng">
            <div>
              <div>
                <strong>Khách hàng:</strong> {selectedPurchase?.userId.name} (
                {selectedPurchase?.userId.email})
              </div>
              <div>
                <strong>Gói:</strong> {selectedPurchase?.packageId.name}
              </div>
              <div>
                <strong>Số tiền:</strong> {selectedPurchase?.amount.toLocaleString()}{' '}
                {selectedPurchase?.currency}
              </div>
            </div>
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Option value="pending">Chờ xử lý</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="failed">Thất bại</Option>
              <Option value="refunded">Hoàn tiền</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Ghi chú" name="notes">
            <TextArea rows={4} placeholder="Nhập ghi chú về đơn hàng..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
              <Button onClick={() => setStatusModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
