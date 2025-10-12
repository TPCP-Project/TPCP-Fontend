import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Badge, Typography } from 'antd'
import { WifiOutlined } from '@ant-design/icons'
import ChatList from '@/components/chat/ChatList'
import ChatWindow from '@/components/chat/ChatWindow'
import { socketService } from '@/services/socketService'
import { useAuth } from '@/context/AuthContext'
import { Conversation } from '@/services/chatService'

const { Text } = Typography

export default function Chat() {
  const { user, token } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)

  // Initialize socket connection
  useEffect(() => {
    const initializeSocket = async () => {
      if (token && user) {
        console.log('Connecting to socket with token:', token.substring(0, 20) + '...')
        const socket = await socketService.connect(token)

        if (!socket) {
          console.error('Failed to create socket connection')
          setSocketConnected(false)
          return
        }

        // Add connection status logging
        const checkConnection = () => {
          const connected = socketService.isSocketConnected()
          console.log('Socket connected:', connected)
          setSocketConnected(connected || false)

          // If not connected and token is valid, try to reconnect
          if (!connected && token && token.trim() !== '') {
            console.log('Socket not connected, attempting reconnect...')
            socketService.connect(token)
          }
        }

        setTimeout(checkConnection, 1000)

        // Check connection status periodically
        const interval = setInterval(checkConnection, 5000)

        return () => {
          clearInterval(interval)
        }
      } else {
        console.log('No token or user, disconnecting socket')
        socketService.disconnect()
        setSocketConnected(false)
      }
    }

    initializeSocket()

    return () => {
      console.log('Disconnecting socket')
      socketService.disconnect()
    }
  }, [token, user])

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
  }

  const handleBackToList = () => {
    setSelectedConversation(null)
  }

  return (
    <div style={{ height: 'calc(100vh - 120px)' }}>
      {/* Connection Status */}
      <div
        style={{
          padding: '8px 16px',
          backgroundColor: socketConnected ? '#f6ffed' : '#fff2e8',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Badge
          status={socketConnected ? 'success' : 'error'}
          text={
            <Text type={socketConnected ? 'success' : 'danger'} style={{ fontSize: '12px' }}>
              {socketConnected ? 'Đã kết nối' : 'Mất kết nối'}
              <WifiOutlined style={{ marginLeft: '4px' }} />
            </Text>
          }
        />
      </div>

      <Row gutter={[0, 0]} style={{ height: 'calc(100% - 40px)' }}>
        {/* Chat List - Hidden on mobile when conversation is selected */}
        <Col
          xs={selectedConversation && isMobile ? 0 : 24}
          lg={8}
          style={{
            height: '100%',
            borderRight: isMobile ? 'none' : '1px solid #f0f0f0',
          }}
        >
          <Card
            style={{ height: '100%', borderRadius: 0 }}
            bodyStyle={{ height: '100%', padding: 0 }}
          >
            <ChatList
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversation?._id}
            />
          </Card>
        </Col>

        {/* Chat Window */}
        <Col xs={24} lg={16} style={{ height: '100%' }}>
          <Card
            style={{ height: '100%', borderRadius: 0 }}
            bodyStyle={{ height: '100%', padding: 0 }}
          >
            <ChatWindow
              conversation={selectedConversation}
              onBack={isMobile ? handleBackToList : undefined}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
