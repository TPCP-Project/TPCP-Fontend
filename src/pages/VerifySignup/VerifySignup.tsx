import { Card, Form, Input, Button, Typography, message } from 'antd'
import { SafetyCertificateOutlined } from '@ant-design/icons'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import * as AuthAPI from '@/services/authService'
import styles from './VerifySignup.module.css'
import { getAxiosErrorMessage } from '@/utils/httpError'
export default function VerifySignup() {
  const [form] = Form.useForm()
  const [search] = useSearchParams()
  const navigate = useNavigate()
  const emailFromQuery = search.get('email') || ''

  async function onFinish(values: { email: string; code: string }) {
    try {
      await AuthAPI.verifySignup(values)
      message.success('Xác thực thành công! Mời bạn đăng nhập.')
      navigate('/login')
    } catch (err: unknown) {
      message.error(getAxiosErrorMessage(err))
    }
  }

  return (
    <section className={styles.wrap}>
      <Card
        className={styles.card}
        title={
          <span>
            <SafetyCertificateOutlined /> Xác thực đăng ký
          </span>
        }
        bordered
      >
        <Typography.Paragraph className={styles.hint}>
          Nhập <b>mã xác thực</b> đã gửi tới email:{' '}
          <span className={styles.email}>{emailFromQuery}</span>
        </Typography.Paragraph>

        <Form
          form={form}
          layout="vertical"
          initialValues={{ email: emailFromQuery }}
          onFinish={onFinish}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email', message: 'Email hợp lệ' }]}
          >
            <Input placeholder="email@domain.com" />
          </Form.Item>

          <Form.Item
            label="Mã xác thực (6 số)"
            name="code"
            rules={[{ required: true, len: 6, message: 'Nhập đủ 6 số' }]}
          >
            <Input.OTP length={6} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Xác thực
            </Button>
          </Form.Item>

          <Typography.Paragraph style={{ textAlign: 'center', marginBottom: 0 }}>
            Chưa nhận được mã? Kiểm tra hộp thư rác / thử <Link to="/register">đăng ký lại</Link>.
          </Typography.Paragraph>
        </Form>
      </Card>
    </section>
  )
}
