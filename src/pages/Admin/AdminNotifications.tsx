import React, { useState, useEffect, useCallback } from 'react'
import { Card, List, Badge, Button, Empty, message, Tag, Space, Popover, Typography } from 'antd'
import { BellOutlined, CheckOutlined, DollarOutlined, UserAddOutlined, WarningOutlined, MessageOutlined } from '@ant-design/icons'
import { adminService, AdminNotification } from '@/services/adminService'
import { chatService } from '@/services/chatService'
import { getAxiosErrorMessage } from '@/utils/httpError'
import { socketService } from '@/services/socketService'
import { useNavigate } from 'react-router-dom'

const { Title, Text, Paragraph } = Typography

export default function AdminNotifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const response = await adminService.getAdminNotifications({
        page,
        limit: pageSize,
      })

      setNotifications(response.data.notifications)
      setTotal(response.data.total)
      setUnreadCount(response.data.unreadCount)
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      message.error('Lỗi khi tải thông báo: ' + errorMessage)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Listen for real-time notifications via Socket.IO
  useEffect(() => {
    const handleNewPurchaseNotification = (data: any) => {
      console.log('Received new purchase notification:', data)
      message.success('Có giao dịch mới!', 3)

      // Add notification to the top of the list
      setNotifications((prev) => [data.notification, ...prev])
      setUnreadCount((prev) => prev + 1)
      setTotal((prev) => prev + 1)
    }

    // Subscribe to socket event
    socketService.onNewPurchaseNotification(handleNewPurchaseNotification)

    return () => {
      // Cleanup listener on unmount
      socketService.offNewPurchaseNotification()
    }
  }, [])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await adminService.markNotificationAsRead(notificationId)

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))

      message.success('Đã đánh dấu là đã đọc')
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      message.error('Lỗi: ' + errorMessage)
    }
  }

  const handleCreateChat = async (notification: AdminNotification) => {
    console.log('AdminNotifications - handleCreateChat:', {
      notificationId: notification._id,
      type: notification.type,
      hasRelatedUser: !!notification.relatedUser,
      relatedUser: notification.relatedUser,
    })

    if (!notification.relatedUser) {
      console.error('No relatedUser in notification:', notification)
      message.error('Không tìm thấy thông tin user trong notification')
      return
    }

    if (!notification.relatedUser._id) {
      console.error('relatedUser has no _id:', notification.relatedUser)
      message.error('Thông tin user không hợp lệ')
      return
    }

    try {
      message.loading({ content: 'Đang tạo cuộc trò chuyện...', key: 'createChat' })

      console.log('Creating conversation with targetUserId:', notification.relatedUser._id)

      // Create or get existing direct conversation
      const response = await chatService.createDirectConversation({
        targetUserId: notification.relatedUser._id,
      })

      console.log('Conversation created:', response.data)

      message.success({ content: 'Đã tạo cuộc trò chuyện!', key: 'createChat' })

      // Navigate to chat page with the conversation
      navigate('/dashboard/chat', { state: { conversationId: response.data._id } })
    } catch (error: unknown) {
      console.error('Error creating conversation:', error)
      const errorMessage = getAxiosErrorMessage(error)
      message.error({
        content: 'Lỗi tạo chat: ' + errorMessage,
        key: 'createChat',
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_purchase':
        return <DollarOutlined style={{ color: '#52c41a' }} />
      case 'user_registration':
        return <UserAddOutlined style={{ color: '#1890ff' }} />
      case 'payment_failed':
        return <WarningOutlined style={{ color: '#ff4d4f' }} />
      case 'subscription_expired':
        return <WarningOutlined style={{ color: '#faad14' }} />
      default:
        return <BellOutlined />
    }
  }

  const getNotificationTypeTag = (type: string) => {
    switch (type) {
      case 'new_purchase':
        return <Tag color="success">Giao dịch mới</Tag>
      case 'user_registration':
        return <Tag color="blue">Đăng ký</Tag>
      case 'payment_failed':
        return <Tag color="error">Thanh toán lỗi</Tag>
      case 'subscription_expired':
        return <Tag color="warning">Hết hạn</Tag>
      case 'system_alert':
        return <Tag color="purple">Hệ thống</Tag>
      default:
        return <Tag>{type}</Tag>
    }
  }

  const renderNotificationData = (notification: AdminNotification) => {
    if (!notification.data) return null

    return (
      <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
        {notification.data.userName && (
          <div>👤 Người dùng: {notification.data.userName}</div>
        )}
        {notification.data.userEmail && (
          <div>📧 Email: {notification.data.userEmail}</div>
        )}
        {notification.data.amount && (
          <div>💰 Số tiền: {notification.data.amount.toLocaleString('vi-VN')} VND</div>
        )}
        {notification.data.transactionNo && (
          <div>🔖 Mã GD: {notification.data.transactionNo}</div>
        )}
        {notification.data.planName && (
          <div>📦 Gói: {notification.data.planName.toUpperCase()}</div>
        )}
      </div>
    )
  }

  return (
    <Card
      title={
        <Space>
          <BellOutlined />
          <span>Thông báo quản trị</span>
          {unreadCount > 0 && (
            <Badge count={unreadCount} style={{ backgroundColor: '#52c41a' }} />
          )}
        </Space>
      }
    >
      <List
        loading={loading}
        dataSource={notifications}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có thông báo nào"
            />
          ),
        }}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (newPage) => setPage(newPage),
          showSizeChanger: false,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thông báo`,
        }}
        renderItem={(notification) => (
          <List.Item
            key={notification._id}
            style={{
              backgroundColor: notification.isRead ? '#fff' : '#f0f5ff',
              borderLeft: notification.isRead ? 'none' : '4px solid #1890ff',
              padding: '16px',
            }}
            actions={[
              notification.type === 'new_purchase' && notification.relatedUser && (
                <Button
                  type="primary"
                  size="small"
                  icon={<MessageOutlined />}
                  onClick={() => handleCreateChat(notification)}
                >
                  Chat
                </Button>
              ),
              !notification.isRead && (
                <Button
                  type="text"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => handleMarkAsRead(notification._id)}
                >
                  Đánh dấu đã đọc
                </Button>
              ),
            ].filter(Boolean)}
          >
            <List.Item.Meta
              avatar={getNotificationIcon(notification.type)}
              title={
                <Space>
                  <span style={{ fontWeight: notification.isRead ? 'normal' : 'bold' }}>
                    {notification.title}
                  </span>
                  {getNotificationTypeTag(notification.type)}
                </Space>
              }
              description={
                <>
                  <Paragraph style={{ marginBottom: 4 }}>{notification.message}</Paragraph>
                  {renderNotificationData(notification)}
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {new Date(notification.createdAt).toLocaleString('vi-VN')}
                  </Text>
                  {notification.readAt && (
                    <Text type="secondary" style={{ fontSize: 11, marginLeft: 16 }}>
                      • Đã đọc: {new Date(notification.readAt).toLocaleString('vi-VN')}
                    </Text>
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
