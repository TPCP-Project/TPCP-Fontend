import { Card, Form, Input, Button, Typography, message } from 'antd'
import { UserAddOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import * as AuthAPI from '@/services/authService'
import styles from './Register.module.css'
import { getAxiosErrorMessage } from '@/utils/httpError'
export default function Register() {
  const [form] = Form.useForm()
  const navigate = useNavigate()

  async function onFinish(values: AuthAPI.RegisterBody) {
    try {
      await AuthAPI.register(values)
      message.success('Đăng ký thành công ! Vui lòng nhập mã xác thực.')
      navigate(`/verify-signup?email=${encodeURIComponent(values.email)}`)
    } catch (err: unknown) {
      message.error(getAxiosErrorMessage(err))
    }
  }

  return (
    <section className={styles.wrap}>
      <div className={styles.panel}>
        <div className={styles.left}>
          <div className={styles.brand}>
            <div className={styles.brandMark}>AI</div>
            <div>
              <strong>Chatbot Platform</strong>
              <div style={{ opacity: 0.8, fontSize: 12 }}>Tăng chuyển đổi, chốt đơn nhanh</div>
            </div>
          </div>
          <h1>Chào mừng! Bắt đầu tạo tài khoản</h1>
          <p>
            Đăng ký cực nhanh chỉ trong 1 phút . Sau khi đăng ký,bạn sẽ nhận được <b>mã xác thực</b>{' '}
            gửi về email .
          </p>
        </div>

        <Card
          className={styles.rightCard}
          title="Tạo tài khoản"
          extra={<UserAddOutlined />}
          bordered
        >
          <Form form={form} layout="vertical" onFinish={onFinish} requiredMark="optional">
            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[{ required: true, message: 'Nhập họ và tên' }, { min: 2 }]}
            >
              <Input placeholder="Nguyen Van A" />
            </Form.Item>

            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Nhập username' }, { min: 3 }]}
            >
              <Input placeholder="nguyenvana" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Nhập email' }, { type: 'email' }]}
            >
              <Input placeholder="email@domain.com" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: 'Nhập mật khẩu' }, { min: 6 }]}
            >
              <Input.Password placeholder="Tối thiểu 6 ký tự" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Đăng ký
              </Button>
            </Form.Item>

            <Typography.Paragraph style={{ textAlign: 'center', marginBottom: 0 }}>
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </Typography.Paragraph>
          </Form>
        </Card>
      </div>
    </section>
  )
}
