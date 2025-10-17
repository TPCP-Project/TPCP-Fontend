import React, { useEffect, useState } from 'react'
import { Card, Upload, Button, message, Typography, Space, Divider, Table, Tag } from 'antd'
import type { UploadProps } from 'antd'
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons'
import SubscriptionGuard from '@/components/SubscriptionGuard'
import { http } from '@/services/httpClient'

const { Title, Text, Paragraph } = Typography
const { Dragger } = Upload

interface UploadedProduct {
  _id: string
  name: string
  category: string
  price: number
  status: string
  createdAt: string
}

export default function UploadPage() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<UploadedProduct[]>([])
  const [stats, setStats] = useState<{
    totalProducts: number
    totalChunks: number
    categories: Array<{ category: string; count: number }>
  } | null>(null)

  const handleUpload = async (file: File) => {
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('file', file)

      let endpoint = ''
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        endpoint = '/api/products/upload-pdf'
      } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        endpoint = '/api/products/upload-csv'
      } else {
        // JSON upload
        const text = await file.text()
        const jsonData = JSON.parse(text)
        const response = await http.post('/api/products/upload', {
          products: jsonData,
          format: 'json',
        })
        message.success(`Upload thành công ${response.data.data.productsCount} sản phẩm!`)
        await loadStats()
        return
      }

      const response = await http.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      message.success(`Upload thành công ${response.data.data.productsCount} sản phẩm!`)
      await loadStats()
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Upload thất bại'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.csv,.pdf,.json',
    beforeUpload: (file: File) => {
      const isValidType =
        file.type === 'text/csv' ||
        file.type === 'application/pdf' ||
        file.type === 'application/json' ||
        file.name.endsWith('.csv') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.json')

      if (!isValidType) {
        message.error('Chỉ chấp nhận file CSV, PDF hoặc JSON!')
        return Upload.LIST_IGNORE
      }

      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        message.error('File phải nhỏ hơn 10MB!')
        return Upload.LIST_IGNORE
      }

      handleUpload(file)
      return false // Prevent auto upload
    },
    showUploadList: false,
  }

  const loadStats = async () => {
    try {
      const response = await http.get('/api/products/stats')
      setStats(response.data.data)
    } catch {
      console.error('Failed to load stats')
    }
  }

  // Tự động tải thống kê khi mở trang để luôn biết đã upload hay chưa
  useEffect(() => {
    void loadStats()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await http.get('/api/products')
      setProducts(response.data.data)
    } catch {
      message.error('Không thể tải danh sách sản phẩm')
    }
  }

  // Tự động tải danh sách sản phẩm lần đầu để hiển thị ngay nếu đã có
  useEffect(() => {
    void loadProducts()
  }, [])

  const deleteAllProducts = async () => {
    try {
      await http.delete('/api/products')
      message.success('Đã xóa tất cả sản phẩm')
      setProducts([])
      await loadStats()
    } catch {
      message.error('Không thể xóa sản phẩm')
    }
  }

  const columns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color="green">{status}</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
  ]

  return (
    <SubscriptionGuard>
      <div style={{ padding: 24 }}>
        <Title level={2}>Upload dữ liệu sản phẩm (RAG)</Title>
        <Paragraph>
          Upload file CSV, PDF hoặc JSON chứa thông tin sản phẩm để tích hợp vào hệ thống AI
          Chatbot.
        </Paragraph>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Upload Section */}
          <Card title="Upload File" extra={<Button onClick={loadStats}>Tải thống kê</Button>}>
            <Dragger {...uploadProps} style={{ padding: 20 }}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">Kéo thả file vào đây hoặc click để chọn</p>
              <p className="ant-upload-hint">Hỗ trợ: CSV, PDF, JSON (tối đa 10MB)</p>
            </Dragger>

            <Divider />

            <Space>
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                loading={loading}
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = '.csv,.pdf,.json'
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      handleUpload(file)
                    }
                  }
                  input.click()
                }}
              >
                Chọn file
              </Button>
              <Button onClick={loadProducts}>Xem sản phẩm</Button>
              <Button danger onClick={deleteAllProducts}>
                Xóa tất cả
              </Button>
            </Space>
          </Card>

          {/* Stats Section */}
          {stats && (
            <Card title="Thống kê dữ liệu">
              <Space size="large">
                <div>
                  <Text strong>Tổng sản phẩm: </Text>
                  <Text>{stats.totalProducts}</Text>
                </div>
                <div>
                  <Text strong>Tổng chunks: </Text>
                  <Text>{stats.totalChunks}</Text>
                </div>
                <div>
                  <Text strong>Danh mục: </Text>
                  {stats.categories.map((cat) => (
                    <Tag key={cat.category} color="green">
                      {cat.category} ({cat.count})
                    </Tag>
                  ))}
                </div>
              </Space>
            </Card>
          )}

          {/* Products Table */}
          {products.length > 0 && (
            <Card title="Danh sách sản phẩm">
              <Table
                columns={columns}
                dataSource={products}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          )}
        </Space>
      </div>
    </SubscriptionGuard>
  )
}
