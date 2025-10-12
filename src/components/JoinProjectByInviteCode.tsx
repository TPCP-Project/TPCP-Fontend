import React, { useState } from 'react'
import { Card, Form, Input, Button, message, Space } from 'antd'
import { UserAddOutlined } from '@ant-design/icons'
import { invitationService } from '@/services/invitationService'
import { getAxiosErrorMessage } from '@/utils/httpError'

export default function JoinProjectByInviteCode() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleJoinProject = async (values: { inviteCode: string }) => {
    setLoading(true)
    try {
      const response = await invitationService.joinByInviteCode({
        inviteCode: values.inviteCode,
      })

      message.success(response.message)
      form.resetFields()

      // Nếu có request_id, có nghĩa là đang chờ phê duyệt
      if (response.data.request_id) {
        message.info('Yêu cầu của bạn đang chờ được phê duyệt')
      }
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      title={
        <Space>
          <UserAddOutlined />
          <span>Tham gia Project bằng mã mời</span>
        </Space>
      }
      style={{ maxWidth: 500, margin: '0 auto' }}
    >
      <Form form={form} layout="vertical" onFinish={handleJoinProject}>
        <Form.Item
          name="inviteCode"
          label="Mã mời"
          rules={[
            { required: true, message: 'Vui lòng nhập mã mời!' },
            { min: 12, message: 'Mã mời phải có ít nhất 12 ký tự!' },
          ]}
        >
          <Input placeholder="Nhập mã mời tham gia project" style={{ fontFamily: 'monospace' }} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            style={{ width: '100%' }}
          >
            Tham gia Project
          </Button>
        </Form.Item>
      </Form>

      <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
          <strong>Lưu ý:</strong> Mã mời có thể hết hạn. Nếu bạn không có mã mời, hãy liên hệ với
          chủ project để được mời tham gia.
        </p>
      </div>
    </Card>
  )
}
