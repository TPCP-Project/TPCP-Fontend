import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  async connect(token: string) {
    if (this.socket?.connected) {
      return this.socket
    }

    // Validate token before connecting
    if (!token || token.trim() === '') {
      console.error('Invalid token provided')
      return null
    }

    // Decode JWT to check structure (no API validation needed)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      console.log('JWT payload:', payload)
      console.log('JWT has id field:', !!payload.id)
      console.log('JWT has userId field:', !!payload.userId)
      console.log('JWT expires at:', new Date(payload.exp * 1000))
      
      // Check if token is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        console.error('Token is expired')
        return null
      }
    } catch (e) {
      console.error('Failed to decode JWT:', e)
      return null
    }

    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect()
    }

    console.log('Connecting to socket with token:', token.substring(0, 20) + '...')

    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    this.setupEventListeners()
    return this.socket
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id)
      this.isConnected = true
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      this.isConnected = false
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this.isConnected = false
      this.handleReconnect()
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    this.socket.on('auth_error', (error) => {
      console.error('Socket auth error:', error)
      console.error('Current token:', localStorage.getItem('token'))
      console.error('Current user:', localStorage.getItem('user'))
      this.isConnected = false
      // Don't try to reconnect on auth error
      this.reconnectAttempts = this.maxReconnectAttempts
      
      // Don't auto logout, just show error
      console.error('Authentication failed - check server logs')
    })
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)
      
      setTimeout(() => {
        if (this.socket) {
          this.socket.connect()
        }
      }, delay)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  // Join conversation
  joinConversation(conversationId: string) {
    if (this.socket?.connected) {
      console.log('Joining conversation via socket:', conversationId)
      this.socket.emit('join_conversation', { conversationId })
    } else {
      console.log('Socket not connected, cannot join conversation')
    }
  }

  // Leave conversation
  leaveConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_conversation', { conversationId })
    }
  }

  // Send message
  sendMessage(data: {
    conversationId: string
    content: string
    messageType?: string
    replyTo?: string
    attachments?: Array<{
      filename: string
      original_name: string
      url: string
      mimetype: string
      size: number
    }>
  }) {
    if (this.socket?.connected) {
      this.socket.emit('send_message', data)
    }
  }

  // Typing indicator
  startTyping(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { conversationId })
    }
  }

  stopTyping(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('stop_typing', { conversationId })
    }
  }

  // Mark as read
  markAsRead(conversationId: string, messageId: string) {
    if (this.socket?.connected) {
      this.socket.emit('mark_as_read', { conversationId, messageId })
    }
  }

  // Add reaction
  addReaction(messageId: string, emoji: string) {
    if (this.socket?.connected) {
      this.socket.emit('add_reaction', { messageId, emoji })
    }
  }

  // Remove reaction
  removeReaction(messageId: string, emoji: string) {
    if (this.socket?.connected) {
      this.socket.emit('remove_reaction', { messageId, emoji })
    }
  }

  // Event listeners
  onNewMessage(callback: (data: { conversationId: string; message: unknown }) => void) {
    if (this.socket) {
      this.socket.on('new_message', callback)
    }
  }

  onUserTyping(callback: (data: { conversationId: string; userId: string; userName: string }) => void) {
    if (this.socket) {
      this.socket.on('user_typing', callback)
    }
  }

  onUserStopTyping(callback: (data: { conversationId: string; userId: string; userName: string }) => void) {
    if (this.socket) {
      this.socket.on('user_stop_typing', callback)
    }
  }

  onMessageRead(callback: (data: { conversationId: string; messageId: string; userId: string; userName: string }) => void) {
    if (this.socket) {
      this.socket.on('message_read', callback)
    }
  }

  onReactionAdded(callback: (data: { conversationId: string; messageId: string; emoji: string; userId: string; userName: string }) => void) {
    if (this.socket) {
      this.socket.on('reaction_added', callback)
    }
  }

  onReactionRemoved(callback: (data: { conversationId: string; messageId: string; emoji: string; userId: string; userName: string }) => void) {
    if (this.socket) {
      this.socket.on('reaction_removed', callback)
    }
  }

  onJoinedConversation(callback: (data: { conversationId: string; userId: string; userName: string }) => void) {
    if (this.socket) {
      this.socket.on('joined_conversation', callback)
    }
  }

  onLeftConversation(callback: (data: { conversationId: string; userId: string; userName: string }) => void) {
    if (this.socket) {
      this.socket.on('left_conversation', callback)
    }
  }

  onError(callback: (data: { message: string; code?: string }) => void) {
    if (this.socket) {
      this.socket.on('error', callback)
    }
  }

  // Remove event listeners
  offNewMessage() {
    if (this.socket) {
      this.socket.off('new_message')
    }
  }

  offUserTyping() {
    if (this.socket) {
      this.socket.off('user_typing')
    }
  }

  offUserStopTyping() {
    if (this.socket) {
      this.socket.off('user_stop_typing')
    }
  }

  offMessageRead() {
    if (this.socket) {
      this.socket.off('message_read')
    }
  }

  offReactionAdded() {
    if (this.socket) {
      this.socket.off('reaction_added')
    }
  }

  offReactionRemoved() {
    if (this.socket) {
      this.socket.off('reaction_removed')
    }
  }

  offJoinedConversation() {
    if (this.socket) {
      this.socket.off('joined_conversation')
    }
  }

  offLeftConversation() {
    if (this.socket) {
      this.socket.off('left_conversation')
    }
  }

  offError() {
    if (this.socket) {
      this.socket.off('error')
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners()
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  getSocket() {
    return this.socket
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected
  }
}

export const socketService = new SocketService()
