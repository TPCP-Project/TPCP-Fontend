/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import { Card, List, Avatar, Input, Button, Spin, message, Tag } from 'antd'
import { commentService } from '../services/commentService'

const { TextArea } = Input

interface Author {
  name: string
  role: string
  avatar?: string
  username: string
  email: string
}

interface Comment {
  _id: string
  author: Author
  content: string
  createdAt: string
}

export default function CommentCard({ taskId }: { taskId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)

  // Lấy danh sách bình luận
  const fetchComments = async () => {
    try {
      setLoading(true)
      const data = await commentService.getComments(taskId)
      setComments(data)
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải bình luận')
    } finally {
      setLoading(false)
    }
  }

  // Gửi bình luận mới
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      return message.warning('Vui lòng nhập nội dung bình luận')
    }
    try {
      setPosting(true)
      await commentService.addComment(taskId, newComment)
      setNewComment('')
      await fetchComments()
      message.success('Đã gửi bình luận thành công!')
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể gửi bình luận')
    } finally {
      setPosting(false)
    }
  }

  useEffect(() => {
    if (taskId) fetchComments()
  }, [taskId])

  // Màu role
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'manager':
        return 'red'
      case 'employee':
        return 'blue'
      case 'qa':
        return 'purple'
      default:
        return 'default'
    }
  }

  // Viết hoa chữ cái đầu
  const capitalize = (text?: string) => {
    if (!text) return ''
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }

  return (
    <Card title=" Bình luận trao đổi " style={{ marginTop: 24 }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin />
        </div>
      ) : (
        <>
          <List
            dataSource={comments}
            locale={{ emptyText: 'Chưa có bình luận nào' }}
            renderItem={(item) => (
              <List.Item key={item._id}>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={item.author?.avatar || '/default-avatar.png'}
                      alt={item.author?.username}
                    />
                  }
                  title={
                    <>
                      <strong>{item.author?.username}</strong>
                      {item.author?.role && (
                        <Tag color={getRoleColor(item.author.role)} style={{ marginLeft: 4 }}>
                          {capitalize(item.author.role)}
                        </Tag>
                      )}
                      {/* nếu muốn thêm thời gian thì mở lại span này */}
                      <span style={{ fontSize: 12, color: '#aaa', marginLeft: 8 }}>
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </>
                  }
                  description={item.content}
                />{' '}
              </List.Item>
            )}
          />

          {/* Ô nhập bình luận */}
          <div style={{ marginTop: 16 }}>
            <TextArea
              rows={3}
              placeholder="Nhập bình luận..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
              type="primary"
              onClick={handleAddComment}
              loading={posting}
              style={{ marginTop: 8 }}
            >
              Gửi bình luận
            </Button>
          </div>
        </>
      )}
    </Card>
  )
}
