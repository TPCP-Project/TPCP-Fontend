// Script để test Chat API endpoints
// Chạy trong browser console hoặc Node.js

const API_BASE = 'http://localhost:4000'

// Lấy token từ localStorage (nếu chạy trong browser)
const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

if (!token) {
  console.error('Không tìm thấy token. Vui lòng đăng nhập trước.')
} else {
  console.log('Token found:', token)
}

// Test function
async function testChatAPI(): Promise<void> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  try {
    // Test 1: Get conversations
    console.log('🔍 Testing: Get conversations...')
    const conversationsResponse = await fetch(`${API_BASE}/api/chat/conversations`, {
      method: 'GET',
      headers,
    })

    if (conversationsResponse.ok) {
      const conversations = await conversationsResponse.json()
      console.log('✅ Get conversations success:', conversations)
    } else {
      console.error('❌ Get conversations failed:', await conversationsResponse.text())
    }

    // Test 2: Test socket connection (chỉ có thể test trong browser)
    if (typeof window !== 'undefined' && (window as unknown as { io?: unknown }).io) {
      console.log('🔍 Testing: Socket connection...')
      const io = (window as unknown as { io: (url: string, options: unknown) => unknown }).io
      const socket = io(API_BASE, {
        auth: { token },
        transports: ['websocket', 'polling'],
      }) as {
        on: (event: string, callback: (data?: unknown) => void) => void
        emit: (event: string, data: unknown) => void
        connected: boolean
        id: string
      }

      socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id)
      })

      socket.on('connect_error', (error: unknown) => {
        console.error('❌ Socket connection error:', error)
      })

      socket.on('error', (error: unknown) => {
        console.error('❌ Socket error:', error)
      })

      // Test join conversation (nếu có conversation)
      setTimeout(() => {
        if (socket.connected) {
          console.log('🔍 Testing: Join conversation...')
          socket.emit('join_conversation', { conversationId: 'test-conversation-id' })
        }
      }, 2000)
    }
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Chạy test
if (token) {
  testChatAPI()
} else {
  console.log('Vui lòng đăng nhập trước khi chạy test này.')
}
