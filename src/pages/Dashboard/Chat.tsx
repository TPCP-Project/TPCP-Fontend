import React from 'react'
import { Card, Row, Col, Typography } from 'antd'
import { MessageOutlined } from '@ant-design/icons'

const { Text } = Typography

export default function Chat() {
  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={8}>
        <Card title="Cuộc trò chuyện">
          <Text type="secondary">Chưa có cuộc trò chuyện nào</Text>
        </Card>
      </Col>
      <Col xs={24} lg={16}>
        <Card
          title="Chọn cuộc trò chuyện"
          bodyStyle={{
            height: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <MessageOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
            <br />
            <Text type="secondary">Chọn cuộc trò chuyện để bắt đầu</Text>
          </div>
        </Card>
      </Col>
    </Row>
  )
}
