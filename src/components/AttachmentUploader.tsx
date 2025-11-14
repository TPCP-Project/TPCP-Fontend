import React, { useState } from 'react'
import { Card, Upload, Button, List, Popconfirm, message } from 'antd'
import {
  UploadOutlined,
  DeleteOutlined,
  FileOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { Attachment, taskService } from '../services/taskService'

interface AttachmentUploaderProps {
  taskId: string
  attachments?: Attachment[]
  onUploadSuccess: () => void
}

export default function AttachmentUploader({ taskId, attachments = [], onUploadSuccess }: AttachmentUploaderProps) {
  const [uploading, setUploading] = useState(false)

  // 🧠 Upload file thật
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options
    setUploading(true)
    try {
      await taskService.uploadAttachment(taskId, file)
      message.success(`File "${file.name}" đã được tải lên`)
      onSuccess?.()
      onUploadSuccess() // Refresh task data
    } catch (error) {
      console.error('Upload error:', error)
      message.error('Không thể upload file!')
      onError?.(error)
    } finally {
      setUploading(false)
    }
  }

  // 🧠 Xóa file thật
  const handleDelete = async (attachmentId: string) => {
    try {
      await taskService.deleteAttachment(taskId, attachmentId)
      message.success('Đã xóa file')
      onUploadSuccess() // Refresh task data
    } catch (error) {
      console.error('Delete error:', error)
      message.error('Không thể xóa file!')
    }
  }

  // 🧮 Format kích thước file
  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / 1024 / 1024).toFixed(1)} MB`
  }

  // Mở file trong tab mới
  const handleView = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `http://localhost:4000${url}`
    window.open(fullUrl, '_blank')
  }

  return (
    <Card
      title="Danh sách tệp đính kèm"
      style={{ marginTop: 24 }}
      bodyStyle={{ padding: '16px 20px' }}
    >
      {/* 🟢 Nút upload */}
      <Upload customRequest={handleUpload} showUploadList={false}>
        <Button type="primary" icon={<UploadOutlined />} loading={uploading}>
          Tải file lên
        </Button>
      </Upload>

      {/* 📄 Danh sách file */}
      <List
        style={{ marginTop: 16 }}
        bordered
        dataSource={attachments}
        locale={{ emptyText: 'Chưa có file nào' }}
        renderItem={(file) => (
          <List.Item
            actions={[
              <Button
                key="view"
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleView(file.url)}
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
              title={<span style={{ fontWeight: 500 }}>{file.originalName}</span>}
              description={
                <>
                  <span style={{ color: '#888' }}>{formatSize(file.size)}</span>{' '}
                  •{' '}
                  <span style={{ color: '#aaa' }}>
                    {new Date(file.uploadedAt).toLocaleString('vi-VN')}
                  </span>
                  {file.uploadedBy?.username && (
                    <>
                      {' • '}
                      <span style={{ color: '#666' }}>Bởi {file.uploadedBy.username}</span>
                    </>
                  )}
                </>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  )
}
