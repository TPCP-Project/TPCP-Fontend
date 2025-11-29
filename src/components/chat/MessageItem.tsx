import React, { useState } from 'react'
import { Avatar, Typography, Space, Button, Dropdown, Menu, Tooltip } from 'antd'
import {
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  SmileOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { ChatMessage } from '@/services/chatService'

const { Text } = Typography

interface MessageItemProps {
  message: ChatMessage
  isOwn: boolean
  onReply?: (message: ChatMessage) => void
  onEdit?: (message: ChatMessage) => void
  onDelete?: (message: ChatMessage) => void
  onReaction?: (messageId: string, emoji: string) => void
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '👏']

export default function MessageItem({
  message,
  isOwn,
  onReply,
  onEdit,
  onDelete,
  onReaction,
}: MessageItemProps) {
  const [showReactions, setShowReactions] = useState(false)

  // Lấy trạng thái tin nhắn: gửi, nhận, đã đọc, đã xoá
  const getMessageStatus = () => {
    if (message.status === 'deleted') {
      return 'Đã xóa'
    }
    if (message.read_by.length > 0) {
      return <CheckCircleOutlined style={{ color: '#1890ff' }} /> // Đã đọc
    }
    if (message.status === 'delivered') {
      return <CheckCircleOutlined style={{ color: '#52c41a' }} /> // Đã gửi tới server
    }
    return <CheckOutlined style={{ color: '#d9d9d9' }} /> // Đã gửi nhưng chưa nhận
  }

  // Hiển thị thời gian gửi tin nhắn
  const getMessageTime = () => {
    const date = new Date(message.createdAt)
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Khi nhấn emoji reaction
  const handleReactionClick = (emoji: string) => {
    if (onReaction) {
      onReaction(message._id, emoji)
    }
    setShowReactions(false)
  }

  // Menu hành động: trả lời, chỉnh sửa, xoá
  const getActionMenu = () => (
    <Menu>
      <Menu.Item key="reply" onClick={() => onReply?.(message)}>
        Trả lời
      </Menu.Item>
      {isOwn && (
        <>
          <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => onEdit?.(message)}>
            Chỉnh sửa
          </Menu.Item>
          <Menu.Item
            key="delete"
            icon={<DeleteOutlined />}
            danger
            onClick={() => onDelete?.(message)}
          >
            Xóa
          </Menu.Item>
        </>
      )}
    </Menu>
  )

  // Nếu tin nhắn đã bị xoá
  if (message.status === 'deleted') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: isOwn ? 'flex-end' : 'flex-start',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            maxWidth: '70%',
            padding: '8px 12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '12px',
            color: '#999',
          }}
        >
          <Text type="secondary" style={{ fontStyle: 'italic' }}>
            Tin nhắn đã bị xóa
          </Text>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        marginBottom: '8px',
      }}
    >
      <div
        style={{
          maxWidth: '70%',
          display: 'flex',
          flexDirection: isOwn ? 'row-reverse' : 'row',
          alignItems: 'flex-end',
          gap: '8px',
        }}
      >
        {/* Avatar người gửi */}
        <Avatar
          src={message.sender_id.avatar?.url}
          size="small"
          style={{ flexShrink: 0 }}
          icon={<UserOutlined />}
        >
          {message.sender_id.name.charAt(0).toUpperCase()}
        </Avatar>

        {/* Nội dung tin nhắn */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isOwn ? 'flex-end' : 'flex-start',
          }}
        >
          {/* Hiển thị tên + username trong nhóm (tin nhắn từ người khác) */}
          {!isOwn && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <Text type="secondary" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                {message.sender_id.name}
              </Text>
              <Text type="secondary" style={{ fontSize: '10px' }}>
                @{message.sender_id.username}
              </Text>
            </div>
          )}

          {/* Với tin nhắn của chính mình trong nhóm → vẫn hiển thị username & name */}
          {isOwn && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '2px',
                justifyContent: 'flex-end',
              }}
            >
              <Text type="secondary" style={{ fontSize: '10px' }}>
                @{message.sender_id.username}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                {message.sender_id.name}
              </Text>
            </div>
          )}

          {/* Khung tin nhắn */}
          <div
            style={{
              position: 'relative',
              padding: '8px 12px',
              backgroundColor: isOwn ? '#1890ff' : '#f0f0f0',
              borderRadius: '12px',
              color: isOwn ? 'white' : 'black',
              wordBreak: 'break-word',
            }}
          >
            {/* Nếu là tin nhắn trả lời người khác */}
            {message.reply_to && (
              <div
                style={{
                  borderLeft: '3px solid #1890ff',
                  paddingLeft: '8px',
                  marginBottom: '4px',
                  fontSize: '12px',
                  opacity: 0.8,
                }}
              >
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  Trả lời {message.reply_to.sender_id}
                </Text>
                <div style={{ fontSize: '11px', marginTop: '2px' }}>
                  {message.reply_to.content.substring(0, 50)}...
                </div>
              </div>
            )}

            {/* Nội dung chính của tin nhắn */}
            <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>

            {/* Nếu tin nhắn đã được chỉnh sửa */}
            {message.metadata.is_edited && (
              <Text type="secondary" style={{ fontSize: '10px', fontStyle: 'italic' }}>
                (đã chỉnh sửa)
              </Text>
            )}

            {/* File đính kèm */}
            {message.attachments && message.attachments.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                {message.attachments.map((attachment, index) => (
                  <div key={index} style={{ marginBottom: '4px' }}>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: isOwn ? 'white' : '#1890ff' }}
                    >
                      📎 {attachment.original_name}
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Danh sách reaction hiện tại */}
            {message.reactions && message.reactions.length > 0 && (
              <div
                style={{
                  marginTop: '4px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px',
                }}
              >
                {message.reactions.map((reaction, index) => (
                  <Tooltip key={index} title={reaction.user_id}>
                    <span
                      style={{
                        fontSize: '12px',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        borderRadius: '8px',
                      }}
                    >
                      {reaction.emoji}
                    </span>
                  </Tooltip>
                ))}
              </div>
            )}

            {/* Nút hành động: reaction + menu */}
            <div
              style={{
                position: 'absolute',
                top: '-8px',
                right: isOwn ? 'auto' : '-8px',
                left: isOwn ? '-8px' : 'auto',
                opacity: 0,
                transition: 'opacity 0.2s',
              }}
              className="message-actions"
            >
              <Space size="small">
                <Button
                  type="text"
                  size="small"
                  icon={<SmileOutlined />}
                  onClick={() => setShowReactions(!showReactions)}
                />
                <Dropdown overlay={getActionMenu()} trigger={['click']}>
                  <Button type="text" size="small" icon={<MoreOutlined />} />
                </Dropdown>
              </Space>
            </div>
          </div>

          {/* Hiển thị giờ + trạng thái (với tin nhắn của mình) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '2px',
              fontSize: '11px',
            }}
          >
            <Text type="secondary">{getMessageTime()}</Text>
            {isOwn && getMessageStatus()}
          </div>

          {/* Bảng emoji reaction */}
          {showReactions && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: isOwn ? 'auto' : '0',
                right: isOwn ? '0' : 'auto',
                backgroundColor: 'white',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                padding: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000,
              }}
            >
              <Space size="small">
                {REACTION_EMOJIS.map((emoji) => (
                  <Button
                    key={emoji}
                    type="text"
                    size="small"
                    onClick={() => handleReactionClick(emoji)}
                    style={{ fontSize: '16px' }}
                  >
                    {emoji}
                  </Button>
                ))}
              </Space>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
