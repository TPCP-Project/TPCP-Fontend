import React, { useState, useEffect } from 'react'
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Space,
  App,
  Popconfirm,
  Tag,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { adminService, SubscriptionPackage } from '@/services/adminService'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select
const { TextArea } = Input

export default function PackageManagement() {
  const { message } = App.useApp()
  const [packages, setPackages] = useState<SubscriptionPackage[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null)

  const [form] = Form.useForm()

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const res = await adminService.getAllPackages()
      setPackages(res.data.packages)
    } catch (error: any) {
      message.error(
        'Không thể tải danh sách gói: ' + (error.response?.data?.message || error.message)
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingPackage) {
        await adminService.updatePackage(editingPackage._id, values)
        message.success('Cập nhật gói thành công')
      } else {
        await adminService.createPackage(values)
        message.success('Tạo gói mới thành công')
      }

      setModalVisible(false)
      form.resetFields()
      setEditingPackage(null)
      fetchPackages()
    } catch (error: any) {
      message.error('Lỗi: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleDelete = async (packageId: string) => {
    try {
      await adminService.deletePackage(packageId)
      message.success('Xóa gói thành công')
      fetchPackages()
    } catch (error: any) {
      message.error('Lỗi: ' + (error.response?.data?.message || error.message))
    }
  }

  const openCreateModal = () => {
    setEditingPackage(null)
    form.resetFields()
    form.setFieldsValue({
      currency: 'VND',
      duration: { unit: 'months', value: 1 },
      isActive: true,
      isPopular: false,
    })
    setModalVisible(true)
  }

  const openEditModal = (pkg: SubscriptionPackage) => {
    setEditingPackage(pkg)
    form.setFieldsValue({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      currency: pkg.currency,
      duration: pkg.duration,
      'limits.maxProjects': pkg.limits.maxProjects,
      'limits.maxMembers': pkg.limits.maxMembers,
      'limits.maxStorage': pkg.limits.maxStorage,
      'limits.maxTasks': pkg.limits.maxTasks,
      isActive: pkg.isActive,
      isPopular: pkg.isPopular,
    })
    setModalVisible(true)
  }

  const columns: ColumnsType<SubscriptionPackage> = [
    {
      title: 'Tên gói',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <strong>{text}</strong>
          {record.isPopular && (
            <Tag color="gold" style={{ marginLeft: 8 }}>
              PHỔ BIẾN
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => (
        <strong style={{ color: '#52c41a' }}>
          {price.toLocaleString()} {record.currency}
        </strong>
      ),
    },
    {
      title: 'Thời hạn',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) =>
        `${duration.value} ${duration.unit === 'months' ? 'tháng' : duration.unit === 'years' ? 'năm' : 'ngày'}`,
    },
    {
      title: 'Giới hạn',
      key: 'limits',
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div>Projects: {record.limits.maxProjects}</div>
          <div>Members: {record.limits.maxMembers}</div>
          <div>Tasks: {record.limits.maxTasks}</div>
          <div>Storage: {record.limits.maxStorage}MB</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'ACTIVE' : 'INACTIVE'}</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa gói này?"
            description="Hành động này không thể hoàn tác"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={<h2 style={{ margin: 0 }}>📦 Quản Lý Gói Subscription</h2>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Tạo Gói Mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={packages}
          rowKey="_id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* Modal tạo/sửa gói */}
      <Modal
        title={editingPackage ? 'Chỉnh Sửa Gói' : 'Tạo Gói Mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingPackage(null)
        }}
        footer={null}
        width={700}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label="Tên gói"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên gói' }]}
          >
            <Input placeholder="VD: Gói Cơ Bản" />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <TextArea rows={3} placeholder="Mô tả chi tiết về gói..." />
          </Form.Item>

          <Form.Item
            label="Giá"
            name="price"
            rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>

          <Form.Item label="Loại tiền" name="currency">
            <Select>
              <Option value="VND">VND</Option>
              <Option value="USD">USD</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Thời hạn">
            <Input.Group compact>
              <Form.Item name={['duration', 'value']} noStyle>
                <InputNumber min={1} placeholder="Số lượng" style={{ width: '50%' }} />
              </Form.Item>
              <Form.Item name={['duration', 'unit']} noStyle>
                <Select style={{ width: '50%' }}>
                  <Option value="days">Ngày</Option>
                  <Option value="months">Tháng</Option>
                  <Option value="years">Năm</Option>
                </Select>
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <h3>Giới hạn</h3>

          <Form.Item label="Số lượng Projects tối đa" name={['limits', 'maxProjects']}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Số lượng Members tối đa" name={['limits', 'maxMembers']}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Số lượng Tasks tối đa" name={['limits', 'maxTasks']}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Dung lượng lưu trữ (MB)" name={['limits', 'maxStorage']}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Trạng thái hoạt động" name="isActive" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item label="Đánh dấu phổ biến" name="isPopular" valuePropName="checked">
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingPackage ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
