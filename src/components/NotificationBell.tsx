import React, { useState, useEffect, useCallback } from 'react'
import { Badge, Dropdown, List, Button, Empty, Spin, message } from 'antd'
import { BellOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { adminService, AdminNotification } from '@/services/adminService'
import { chatService } from '@/services/chatService'
import { getAxiosErrorMessage } from '@/utils/httpError'
import { socketService } from '@/services/socketService'

export default function NotificationBell() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dropdownVisible, setDropdownVisible] = useState(false)

  const fetchUnreadNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const response = await adminService.getAdminNotifications({
        page: 1,
        limit: 5,
        // Không filter isRead để hiển thị cả notifications đã đọc
      })

      setNotifications(response.data.notifications)
      setUnreadCount(response.data.unreadCount)
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      console.error('Error fetching notifications:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUnreadNotifications()
  }, [fetchUnreadNotifications])

  // Listen for real-time notifications via Socket.IO
  useEffect(() => {
    const handleNewPurchaseNotification = (data: any) => {
      console.log('NotificationBell: Received new purchase notification:', data)

      // Play notification sound (optional)
      // new Audio('/notification.mp3').play()

      // Add notification to the list
      setNotifications((prev) => [data.notification, ...prev.slice(0, 4)])
      setUnreadCount((prev) => prev + 1)

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(data.notification.title, {
          body: data.notification.message,
          icon: '/logo.png',
        })
      }
    }

    // Subscribe to socket event
    socketService.onNewPurchaseNotification(handleNewPurchaseNotification)

    return () => {
      // Cleanup listener on unmount
      socketService.offNewPurchaseNotification()
    }
  }, [])

  const handleViewAll = () => {
    setDropdownVisible(false)
    navigate('/admin/notifications')
  }

  const handleNotificationClick = async (notification: AdminNotification) => {
    console.log('NotificationBell - handleClick:', {
      notificationId: notification._id,
      type: notification.type,
      hasRelatedUser: !!notification.relatedUser,
      relatedUser: notification.relatedUser,
    })

    // Mark as read
    try {
      await adminService.markNotificationAsRead(notification._id)
      setUnreadCount((prev) => Math.max(0, prev - 1))
      setNotifications((prev) =>
        prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
      )
    } catch (error: unknown) {
      console.error('Error marking notification as read:', error)
    }

    setDropdownVisible(false)

    // Tạo chat với user nếu là new_purchase
    if (notification.type === 'new_purchase') {
      if (!notification.relatedUser) {
        console.error('No relatedUser in notification:', notification)
        message.error('Không tìm thấy thông tin user trong notification')
        navigate('/admin/notifications')
        return
      }

      if (!notification.relatedUser._id) {
        console.error('relatedUser has no _id:', notification.relatedUser)
        message.error('Thông tin user không hợp lệ')
        navigate('/admin/notifications')
        return
      }

      try {
        message.loading({ content: 'Đang tạo cuộc trò chuyện...', key: 'createChat' })

        console.log('Creating conversation with targetUserId:', notification.relatedUser._id)

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
        message.error({ content: 'Lỗi tạo chat: ' + errorMessage, key: 'createChat' })
        // Fallback to purchases page nếu lỗi
        navigate('/admin/purchases')
      }
    } else {
      navigate('/admin/notifications')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_purchase':
        return '💰'
      case 'user_registration':
        return '👤'
      case 'payment_failed':
        return '⚠️'
      case 'subscription_expired':
        return '⏰'
      default:
        return '🔔'
    }
  }

  const dropdownMenu = (
    <div
      style={{
        width: 350,
        maxHeight: 400,
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
          fontWeight: 600,
        }}
      >
        Thông báo mới
        {unreadCount > 0 && (
          <span style={{ float: 'right', color: '#52c41a' }}>
            {unreadCount} chưa đọc
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <Spin />
        </div>
      ) : (
        <>
          <List
            dataSource={notifications}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có thông báo mới"
                  style={{ padding: '24px 0' }}
                />
              ),
            }}
            renderItem={(notification) => (
              <List.Item
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  cursor: 'pointer',
                  padding: '12px 16px',
                  backgroundColor: notification.isRead ? '#fff' : '#f0f5ff',
                  borderLeft: notification.isRead ? 'none' : '3px solid #1890ff',
                }}
              >
                <List.Item.Meta
                  avatar={
                    <span style={{ fontSize: 24 }}>
                      {getNotificationIcon(notification.type)}
                    </span>
                  }
                  title={
                    <span
                      style={{
                        fontWeight: notification.isRead ? 'normal' : 'bold',
                        fontSize: 13,
                      }}
                    >
                      {notification.title}
                    </span>
                  }
                  description={
                    <>
                      <div
                        style={{
                          fontSize: 12,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {notification.message}
                      </div>
                      <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                        {new Date(notification.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </>
                  }
                />
              </List.Item>
            )}
          />

          {notifications.length > 0 && (
            <div
              style={{
                padding: '8px 16px',
                borderTop: '1px solid #f0f0f0',
                textAlign: 'center',
              }}
            >
              <Button type="link" icon={<EyeOutlined />} onClick={handleViewAll}>
                Xem tất cả
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )

  return (
    <Dropdown
      menu={{ items: [] }}
      dropdownRender={() => dropdownMenu}
      trigger={['click']}
      open={dropdownVisible}
      onOpenChange={setDropdownVisible}
      placement="bottomRight"
    >
      <Badge count={unreadCount} size="small" offset={[-5, 5]}>
        <BellOutlined
          style={{
            fontSize: 20,
            cursor: 'pointer',
            color: unreadCount > 0 ? '#1890ff' : '#666',
          }}
        />
      </Badge>
    </Dropdown>
  )
}
