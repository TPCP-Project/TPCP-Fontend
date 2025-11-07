import React, { useState } from 'react'
import { Card, Upload, Button, List, Popconfirm, message } from 'antd'
import {
  UploadOutlined,
  DeleteOutlined,
  FileOutlined,
  EyeOutlined
} from '@ant-design/icons'

export default function AttachmentUploader() {
  // 🧩 Dữ liệu file demo tạm
  const [files, setFiles] = useState([
    {
      _id: '1',
      name: 'report_kpi_thang11.pdf',
      size: 245000,
      uploadedAt: '2025-11-06T14:25:00Z'
    },
    {
      _id: '2',
      name: 'design_ui_homepage.png',
      size: 56000,
      uploadedAt: '2025-11-05T10:18:00Z'
    }
  ])

  // 🧠 Giả lập upload (chưa gọi API)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpload = (options: any) => {
    const { file } = options
    message.success(`File "${file.name}" đã được tải lên (demo)`)
  }

  // 🧠 Giả lập xóa
  const handleDelete = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f._id !== fileId))
    message.info('Đã xóa file (demo)')
  }

  // 🧮 Format kích thước file
  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <Card
      title="Danh sách tệp đính kèm"
      style={{ marginTop: 24 }}
      bodyStyle={{ padding: '16px 20px' }}
    >
      {/* 🟢 Nút upload */}
      <Upload customRequest={handleUpload} showUploadList={false}>
        <Button type="primary" icon={<UploadOutlined />}>
          Tải file lên
        </Button>
      </Upload>

      {/* 📄 Danh sách file */}
      <List
        style={{ marginTop: 16 }}
        bordered
        dataSource={files}
        locale={{ emptyText: 'Chưa có file nào' }}
        renderItem={(file) => (
          <List.Item
            actions={[
              <Button
                key="view"
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => message.info(`Xem file: ${file.name}`)}
              />,
              <Popconfirm
                key="delete"
                title="Bạn có chắc muốn xóa file này?"
                okText="Xóa"
                cancelText="Hủy"
                onConfirm={() => handleDelete(file._id)}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            ]}
          >
            <List.Item.Meta
              avatar={<FileOutlined style={{ fontSize: 20, color: '#1677ff' }} />}
              title={<span style={{ fontWeight: 500 }}>{file.name}</span>}
              description={
                <>
                  <span style={{ color: '#888' }}>{formatSize(file.size)}</span>{' '}
                  •{' '}
                  <span style={{ color: '#aaa' }}>
                    {new Date(file.uploadedAt).toLocaleString('vi-VN')}
                  </span>
                </>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  )
}
