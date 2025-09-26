import React from 'react'
import { Card, Row, Col, Input, Button, Space, Avatar, Typography } from 'antd'
import { RobotOutlined, SendOutlined } from '@ant-design/icons'

const { Text, Paragraph } = Typography

export default function AI() {
  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={12}>
        <Card title="🤖 AI Chatbot Nội bộ">
          <div style={{ minHeight: 400, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <Avatar icon={<RobotOutlined />} />
                <div>
                  <Text>Chào bạn! Tôi có thể giúp bạn:</Text>
                  <ul>
                    <li>Tạo task và dự án mới</li>
                    <li>Phân tích hiệu suất nhóm</li>
                    <li>Đề xuất cải thiện quy trình</li>
                    <li>Tìm kiếm thông tin trong hệ thống</li>
                  </ul>
                </div>
              </div>
            </div>
            <Space.Compact style={{ width: '100%' }}>
              <Input placeholder="Nhập câu hỏi của bạn..." />
              <Button type="primary" icon={<SendOutlined />} />
            </Space.Compact>
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="📊 AI Insights">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div>⚠️</div>
              <div>
                <Text strong>Cảnh báo</Text>
                <Paragraph>Chưa có cảnh báo nào</Paragraph>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div>📈</div>
              <div>
                <Text strong>Thống kê</Text>
                <Paragraph>Chưa có dữ liệu thống kê</Paragraph>
              </div>
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  )
}
