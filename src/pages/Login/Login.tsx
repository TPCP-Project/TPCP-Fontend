import React, { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Typography, message, Space, Divider, Checkbox } from 'antd'
import {
  LoginOutlined,
  UserOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  GoogleOutlined,
} from '@ant-design/icons'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

import * as AuthAPI from '@/services/authService'
import styles from './Login.module.css'
import { getAxiosErrorMessage } from '@/utils/httpError'

const { Title, Text, Paragraph } = Typography

type LocationState = { from?: { pathname?: string } } | undefined

export default function Login() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { login, isLoading } = useAuth() 
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LocationState)?.from?.pathname || '/dashboard'

  useEffect(() => {
    form.setFieldsValue({})
  }, [form])

  async function onFinish(values: { email: string; password: string; remember?: boolean }) {
    setLoading(true)
    try {
      const response = await AuthAPI.login(values)

      console.log('Full API Response:', response)

      const token = response.data.accessToken
      const userData = response.data.user

      if (!token) {
        throw new Error('Token không tồn tại trong response')
      }

      const user = {
        email: userData.email,
        name: userData.name,
        id: userData._id,
        role: userData.role,
      }

      console.log('Token:', token)
      console.log('User:', user)

      login(token, user)

      message.success(`Chào mừng ${user.name}!`)
      navigate(from, { replace: true })
    } catch (err: unknown) {
      console.error('Login error:', err)
      message.error(getAxiosErrorMessage(err) || 'Đăng nhập thất bại.')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner}></div>
        <Text>Đang kiểm tra phiên đăng nhập...</Text>
      </div>
    )
  }

  return (
    <div className={styles.loginPage}>
      {/* Background Elements */}
      <div className={styles.backgroundShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        {/* Left Side - Branding */}
        <div className={styles.brandingSide}>
          <div className={styles.brandingContent}>
            <div className={styles.logo}>
              <img src="/src/assets/images/logo.png" alt="Project Manager" />
            </div>
            <Title level={1} className={styles.brandTitle}>
              Project Manager Pro
            </Title>
            <Paragraph className={styles.brandSubtitle}>
              Nền tảng quản lý dự án và nhóm thông minh với AI tích hợp
            </Paragraph>

            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>📊</div>
                <div>
                  <Text strong>Quản lý dự án hiệu quả</Text>
                  <br />
                  <Text type="secondary">Tạo, phân công và theo dõi tiến độ</Text>
                </div>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>👥</div>
                <div>
                  <Text strong>Quản lý nhóm chuyên nghiệp</Text>
                  <br />
                  <Text type="secondary">Phân quyền và giao việc thông minh</Text>
                </div>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>🤖</div>
                <div>
                  <Text strong>AI Assistant tích hợp</Text>
                  <br />
                  <Text type="secondary">Chatbot hỗ trợ 24/7</Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className={styles.formSide}>
          <Card className={styles.loginCard} bordered={false}>
            <div className={styles.cardHeader}>
              <div className={styles.loginIcon}>
                <LoginOutlined />
              </div>
              <Title level={2} className={styles.loginTitle}>
                Đăng nhập
              </Title>
              <Text className={styles.loginSubtitle}>Chào mừng bạn quay lại! 👋</Text>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              size="large"
              className={styles.loginForm}
            >
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="email@company.com"
                  className={styles.customInput}
                />
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu!' },
                  { min: 6, message: 'Mật khẩu ít nhất 6 ký tự!' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="••••••••"
                  className={styles.customInput}
                  iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <div className={styles.formOptions}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                </Form.Item>
                <Link to="/forgot-password" className={styles.forgotLink}>
                  Quên mật khẩu?
                </Link>
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  className={styles.loginButton}
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              </Form.Item>

              <Divider plain>
                <Text type="secondary">Hoặc đăng nhập với</Text>
              </Divider>

              <Space direction="vertical" size="middle" className={styles.socialButtons}>
                <Button
                  block
                  size="large"
                  className={styles.googleButton}
                  icon={<GoogleOutlined />}
                >
                  Đăng nhập với Google
                </Button>
              </Space>

              <div className={styles.signupPrompt}>
                <Text>
                  Chưa có tài khoản?{' '}
                  <Link to="/register" className={styles.signupLink}>
                    Đăng ký ngay
                  </Link>
                </Text>
              </div>
            </Form>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <Text type="secondary">© 2024 Project Manager Pro. All rights reserved.</Text>
      </div>
    </div>
  )
}
