import React, { useState, useEffect, useCallback } from 'react'
import { List, Avatar, Typography, Badge, Button, Input, Select, Space, message } from 'antd'
import { PlusOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons'
import { chatService, Conversation } from '@/services/chatService'
import { getAxiosErrorMessage } from '@/utils/httpError'

const { Text } = Typography
const { Search } = Input
const { Option } = Select

interface ChatListProps {
  onSelectConversation: (conversation: Conversation) => void
  selectedConversationId?: string
}

export default function ChatList({ onSelectConversation, selectedConversationId }: ChatListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState<'project' | 'direct' | undefined>(undefined)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  })

  const fetchConversations = useCallback(
    async (page = 1, type?: 'project' | 'direct', search?: string) => {
      setLoading(true)
      try {
        const params: { page: number; limit: number; type?: 'project' | 'direct' } = {
          page,
          limit: 20,
        }
        if (type) params.type = type

        console.log('Fetching conversations with params:', params)
        const response = await chatService.getUserConversations(params)
        console.log('Conversations response:', response.data)

        let filteredConversations = response.data.conversations

        // Client-side search
        if (search) {
          filteredConversations = filteredConversations.filter(
            (conv) =>
              conv.name.toLowerCase().includes(search.toLowerCase()) ||
              conv.description?.toLowerCase().includes(search.toLowerCase())
          )
        }

        setConversations(filteredConversations)
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        })
      } catch (error: unknown) {
        console.error('Error fetching conversations:', error)
        const errorMessage = getAxiosErrorMessage(error)
        message.error(`Lỗi tải danh sách chat: ${errorMessage}`)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    fetchConversations(1, filterType, searchText)
  }, [fetchConversations, filterType, searchText])

  // Listen for conversation updates
  useEffect(() => {
    const handleConversationUpdate = () => {
      console.log('Conversation updated, refreshing list...')
      fetchConversations(1, filterType, searchText)
    }

    // Listen for conversation updates (you can add socket events here)
    // For now, refresh every 30 seconds
    const interval = setInterval(handleConversationUpdate, 30000)

    return () => {
      clearInterval(interval)
    }
  }, [fetchConversations, filterType, searchText])

  const handleSearch = (value: string) => {
    setSearchText(value)
    fetchConversations(1, filterType, value)
  }

  const handleFilterChange = (value: 'project' | 'direct' | undefined) => {
    setFilterType(value)
  }

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.avatar?.url) {
      return conversation.avatar.url
    }
    return conversation.type === 'project' ? undefined : undefined
  }

  const getConversationIcon = (conversation: Conversation) => {
    if (conversation.type === 'project') {
      return <TeamOutlined />
    }
    return <UserOutlined />
  }

  const getLastMessageTime = (conversation: Conversation) => {
    if (!conversation.stats.last_message_at) return ''
    const date = new Date(conversation.stats.last_message_at)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Vừa xong'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h trước`
    } else {
      return date.toLocaleDateString('vi-VN')
    }
  }

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.type === 'project') {
      return conversation.project_id?.name || conversation.name
    }
    return conversation.name
  }

  const getConversationSubtitle = (conversation: Conversation) => {
    if (conversation.type === 'project') {
      return `${conversation.stats.total_participants} thành viên`
    }
    return 'Tin nhắn riêng tư'
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <Text strong style={{ fontSize: '18px' }}>
            Cuộc trò chuyện
          </Text>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            title="Tạo cuộc trò chuyện mới"
          />
        </div>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Search
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            allowClear
          />

          <Select
            placeholder="Lọc theo loại"
            style={{ width: '100%' }}
            value={filterType}
            onChange={handleFilterChange}
            allowClear
          >
            <Option value="project">Project</Option>
            <Option value="direct">Tin nhắn riêng</Option>
          </Select>
        </Space>
      </div>

      {/* Conversation List */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <List
          loading={loading}
          dataSource={conversations}
          renderItem={(conversation) => (
            <List.Item
              key={conversation._id}
              onClick={() => onSelectConversation(conversation)}
              style={{
                cursor: 'pointer',
                backgroundColor:
                  selectedConversationId === conversation._id ? '#e6f7ff' : 'transparent',
                borderLeft:
                  selectedConversationId === conversation._id
                    ? '3px solid #1890ff'
                    : '3px solid transparent',
                padding: '12px 16px',
              }}
              onMouseEnter={(e) => {
                if (selectedConversationId !== conversation._id) {
                  e.currentTarget.style.backgroundColor = '#f5f5f5'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedConversationId !== conversation._id) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <List.Item.Meta
                avatar={
                  <Badge count={conversation.unreadCount || 0} size="small" offset={[-5, 5]}>
                    <Avatar
                      src={getConversationAvatar(conversation)}
                      icon={getConversationIcon(conversation)}
                      size="large"
                    />
                  </Badge>
                }
                title={
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text strong style={{ fontSize: '14px' }}>
                      {getConversationTitle(conversation)}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {getLastMessageTime(conversation)}
                    </Text>
                  </div>
                }
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {getConversationSubtitle(conversation)}
                    </Text>
                    {conversation.stats.last_message_at && (
                      <div style={{ marginTop: '4px' }}>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {conversation.stats.total_messages} tin nhắn
                        </Text>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
          <Space>
            <Button
              size="small"
              disabled={!pagination.hasPrev}
              onClick={() => fetchConversations(pagination.currentPage - 1, filterType, searchText)}
            >
              Trước
            </Button>
            <Text type="secondary">
              {pagination.currentPage} / {pagination.totalPages}
            </Text>
            <Button
              size="small"
              disabled={!pagination.hasNext}
              onClick={() => fetchConversations(pagination.currentPage + 1, filterType, searchText)}
            >
              Sau
            </Button>
          </Space>
        </div>
      )}
    </div>
  )
}
