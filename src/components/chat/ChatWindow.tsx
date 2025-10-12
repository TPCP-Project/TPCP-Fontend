import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Card,
  Input,
  Button,
  Typography,
  Avatar,
  Space,
  message,
  Spin,
  Empty,
  Tooltip,
  Dropdown,
  Menu,
} from 'antd'
import {
  SendOutlined,
  SmileOutlined,
  PaperClipOutlined,
  MoreOutlined,
  UserOutlined,
  TeamOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { Conversation, ChatMessage, ChatParticipant, chatService } from '@/services/chatService'
import { socketService } from '@/services/socketService'
import MessageItem from './MessageItem'
import { useAuth } from '@/context/AuthContext'
import { getAxiosErrorMessage } from '@/utils/httpError'

const { Text } = Typography
const { TextArea } = Input

interface ChatWindowProps {
  conversation: Conversation | null
  onBack?: () => void
}

export default function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [showTyping, setShowTyping] = useState(false)
  const [participants, setParticipants] = useState<ChatParticipant[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = useCallback(async () => {
    if (!conversation) return

    setLoading(true)
    try {
      const response = await chatService.getConversationMessages(conversation._id)
      setMessages(response.data.messages)

      // Mark conversation as read
      try {
        await chatService.markAsRead(conversation._id)
      } catch (error) {
        console.warn('Failed to mark as read:', error)
      }
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [conversation])

  const fetchParticipants = useCallback(async () => {
    if (!conversation) return

    try {
      const response = await chatService.getConversationParticipants(conversation._id)
      setParticipants(response.data.participants)
      console.log('Conversation participants:', response.data.participants)
    } catch (error: unknown) {
      console.error('Failed to fetch participants:', error)
    }
  }, [conversation])

  useEffect(() => {
    if (conversation) {
      console.log('Joining conversation:', conversation._id)
      fetchMessages()
      fetchParticipants()
      socketService.joinConversation(conversation._id)
    }

    return () => {
      if (conversation) {
        console.log('Leaving conversation:', conversation._id)
        socketService.leaveConversation(conversation._id)
      }
    }
  }, [conversation, fetchMessages, fetchParticipants])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Socket event handlers
  useEffect(() => {
    const handleNewMessage = (data: { conversationId: string; message: unknown }) => {
      console.log('Received new message:', data)
      console.log('Current conversation ID:', conversation?._id)
      console.log('Message conversation ID:', data.conversationId)
      console.log('IDs match:', data.conversationId === conversation?._id)

      if (data.conversationId === conversation?._id) {
        setMessages((prev) => {
          const newMessage = data.message as ChatMessage
          console.log('Adding new message:', newMessage)
          // Check if message already exists to avoid duplicates
          const exists = prev.some((msg) => msg._id === newMessage._id)
          if (exists) {
            console.log('Message already exists, skipping')
            return prev
          }
          console.log('Adding message to state')
          return [...prev, newMessage]
        })
      } else {
        console.log('Message not for current conversation, ignoring')
      }
    }

    const handleUserTyping = (data: {
      conversationId: string
      userId: string
      userName: string
    }) => {
      if (data.conversationId === conversation?._id && data.userId !== user?.id) {
        setTypingUsers((prev) => [...prev.filter((id) => id !== data.userId), data.userId])
        setShowTyping(true)
      }
    }

    const handleUserStopTyping = (data: {
      conversationId: string
      userId: string
      userName: string
    }) => {
      if (data.conversationId === conversation?._id) {
        setTypingUsers((prev) => prev.filter((id) => id !== data.userId))
        if (typingUsers.length <= 1) {
          setShowTyping(false)
        }
      }
    }

    const handleReactionAdded = (data: {
      conversationId: string
      messageId: string
      emoji: string
      userId: string
      userName: string
    }) => {
      if (data.conversationId === conversation?._id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId
              ? {
                  ...msg,
                  reactions: [
                    ...msg.reactions,
                    {
                      user_id: data.userId,
                      emoji: data.emoji,
                      reacted_at: new Date().toISOString(),
                    },
                  ],
                }
              : msg
          )
        )
      }
    }

    const handleReactionRemoved = (data: {
      conversationId: string
      messageId: string
      emoji: string
      userId: string
      userName: string
    }) => {
      if (data.conversationId === conversation?._id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId
              ? {
                  ...msg,
                  reactions: msg.reactions.filter(
                    (r) => !(r.user_id === data.userId && r.emoji === data.emoji)
                  ),
                }
              : msg
          )
        )
      }
    }

    const handleJoinedConversation = (data: {
      conversationId: string
      userId: string
      userName: string
    }) => {
      console.log('User joined conversation:', data)
      if (data.conversationId === conversation?._id) {
        // Refresh participants when someone joins
        fetchParticipants()
      }
    }

    const handleLeftConversation = (data: {
      conversationId: string
      userId: string
      userName: string
    }) => {
      console.log('User left conversation:', data)
      if (data.conversationId === conversation?._id) {
        // Refresh participants when someone leaves
        fetchParticipants()
      }
    }

    socketService.onNewMessage(handleNewMessage)
    socketService.onUserTyping(handleUserTyping)
    socketService.onUserStopTyping(handleUserStopTyping)
    socketService.onReactionAdded(handleReactionAdded)
    socketService.onReactionRemoved(handleReactionRemoved)
    socketService.onJoinedConversation(handleJoinedConversation)
    socketService.onLeftConversation(handleLeftConversation)

    return () => {
      socketService.offNewMessage()
      socketService.offUserTyping()
      socketService.offUserStopTyping()
      socketService.offReactionAdded()
      socketService.offReactionRemoved()
      socketService.offJoinedConversation()
      socketService.offLeftConversation()
    }
  }, [conversation, user, typingUsers.length])

  const handleSendMessage = async () => {
    if (!conversation || !messageText.trim() || sending) return

    setSending(true)
    try {
      console.log('Sending message to conversation:', conversation._id)
      const response = await chatService.sendMessage(conversation._id, {
        content: messageText.trim(),
        message_type: 'text',
      })
      console.log('Message sent successfully:', response.data)
      setMessageText('')
    } catch (error: unknown) {
      console.error('Error sending message:', error)
      const errorMessage = getAxiosErrorMessage(error)
      message.error(`Lỗi gửi tin nhắn: ${errorMessage}`)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTyping = () => {
    if (!conversation) return

    socketService.startTyping(conversation._id)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(conversation._id)
    }, 1000)
  }

  const handleReaction = (messageId: string, emoji: string) => {
    socketService.addReaction(messageId, emoji)
  }

  const handleReply = (message: ChatMessage) => {
    // TODO: Implement reply functionality
    console.log('Reply to message:', message)
  }

  const handleEdit = (message: ChatMessage) => {
    // TODO: Implement edit functionality
    console.log('Edit message:', message)
  }

  const handleDelete = async (message: ChatMessage) => {
    try {
      await chatService.deleteMessage(message._id)
      setMessages((prev) => prev.filter((msg) => msg._id !== message._id))
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      console.error('Delete message error:', errorMessage)
    }
  }

  const getConversationTitle = () => {
    if (!conversation) return 'Chọn cuộc trò chuyện'

    if (conversation.type === 'project') {
      return conversation.project_id?.name || conversation.name
    }
    return conversation.name
  }

  const getConversationSubtitle = () => {
    if (!conversation) return ''

    if (conversation.type === 'project') {
      const participantCount = participants.length || conversation.stats.total_participants || 0
      return `${participantCount} thành viên`
    }
    return 'Tin nhắn riêng tư'
  }

  const getConversationAvatar = () => {
    if (!conversation) return null

    if (conversation.avatar?.url) {
      return conversation.avatar.url
    }
    return conversation.type === 'project' ? undefined : undefined
  }

  const getConversationIcon = () => {
    if (!conversation) return <UserOutlined />
    return conversation.type === 'project' ? <TeamOutlined /> : <UserOutlined />
  }

  const getActionMenu = () => (
    <Menu>
      <Menu.Item key="search" icon={<SearchOutlined />}>
        Tìm kiếm
      </Menu.Item>
      <Menu.Item key="call" icon={<PhoneOutlined />}>
        Gọi điện
      </Menu.Item>
      <Menu.Item key="video" icon={<VideoCameraOutlined />}>
        Gọi video
      </Menu.Item>
    </Menu>
  )

  if (!conversation) {
    return (
      <Card
        style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        bodyStyle={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chọn cuộc trò chuyện để bắt đầu" />
      </Card>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onBack && (
            <Button type="text" onClick={onBack}>
              ←
            </Button>
          )}
          <Avatar src={getConversationAvatar()} icon={getConversationIcon()} size="large" />
          <div>
            <Text strong style={{ fontSize: '16px' }}>
              {getConversationTitle()}
            </Text>
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {getConversationSubtitle()}
              </Text>
            </div>
          </div>
        </div>

        <Space>
          <Tooltip title="Tìm kiếm">
            <Button type="text" icon={<SearchOutlined />} />
          </Tooltip>
          <Tooltip title="Gọi điện">
            <Button type="text" icon={<PhoneOutlined />} />
          </Tooltip>
          <Tooltip title="Gọi video">
            <Button type="text" icon={<VideoCameraOutlined />} />
          </Tooltip>
          <Dropdown overlay={getActionMenu()} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
          backgroundColor: '#fafafa',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Text type="secondary">Chưa có tin nhắn nào</Text>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageItem
                key={msg._id}
                message={msg}
                isOwn={msg.sender_id._id === user?.id}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReaction={handleReaction}
              />
            ))}

            {/* Typing indicator */}
            {showTyping && typingUsers.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  maxWidth: 'fit-content',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '2px',
                    animation: 'typing 1.4s infinite',
                  }}
                >
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#999',
                      borderRadius: '50%',
                    }}
                  />
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#999',
                      borderRadius: '50%',
                    }}
                  />
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#999',
                      borderRadius: '50%',
                    }}
                  />
                </div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {typingUsers.length === 1
                    ? 'Đang nhập...'
                    : `${typingUsers.length} người đang nhập...`}
                </Text>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid #f0f0f0',
          backgroundColor: 'white',
        }}
      >
        <Space.Compact style={{ width: '100%' }}>
          <Button type="text" icon={<PaperClipOutlined />} title="Đính kèm file" />
          <TextArea
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value)
              handleTyping()
            }}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ flex: 1 }}
          />
          <Button type="text" icon={<SmileOutlined />} title="Emoji" />
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={sending}
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
          />
        </Space.Compact>
      </div>
    </div>
  )
}
