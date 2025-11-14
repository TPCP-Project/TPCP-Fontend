import React, { useState, useEffect } from 'react'
import {
  Card,
  Avatar,
  Form,
  Input,
  Select,
  Button,
  message,
  Spin,
  Row,
  Col,
  Typography,
  Upload,
  Divider,
  Space
} from 'antd'
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CameraOutlined,
  MailOutlined,
  GlobalOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { profileService, ProfileData } from '@/services/profileService'
import { useAuth } from '@/context/AuthContext'

const { Title, Text } = Typography
const { Option } = Select

export default function Profile() {
  const [form] = Form.useForm()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const data = await profileService.getMyProfile()
      setProfile(data)
      form.setFieldsValue({
        full_name: data.full_name,
        nickname: data.nickname,
        gender: data.gender,
        country: data.address?.country || 'Vietnam',
        user_language: data.user_language || 'vi',
        user_timezone: data.user_timezone || 'Asia/Ho_Chi_Minh',
        phone_number: data.phone_number,
        bio: data.bio,
        job_title: data.occupation?.job_title,
        company: data.occupation?.company
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      message.error('Không thể tải thông tin profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (values: any) => {
    setSaving(true)
    try {
      const updateData: Partial<ProfileData> = {
        full_name: values.full_name,
        nickname: values.nickname,
        gender: values.gender,
        user_language: values.user_language,
        user_timezone: values.user_timezone,
        phone_number: values.phone_number,
        bio: values.bio,
        address: {
          ...profile?.address,
          country: values.country
        },
        occupation: {
          ...profile?.occupation,
          job_title: values.job_title,
          company: values.company
        }
      }

      await profileService.updateProfile(updateData)
      message.success('Cập nhật profile thành công!')
      setEditing(false)
      fetchProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      message.error('Không thể cập nhật profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = () => {
    message.info('Chức năng upload avatar đang được phát triển')
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Card
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        bodyStyle={{ padding: '32px' }}
      >
        {/* Header with Avatar */}
        <Row align="middle" style={{ marginBottom: 32 }}>
          <Col>
            <div style={{ position: 'relative' }}>
              <Avatar
                size={80}
                icon={<UserOutlined />}
                src={profile?.avatar?.url}
                style={{ backgroundColor: '#1890ff' }}
              />
              <Button
                type="primary"
                shape="circle"
                size="small"
                icon={<CameraOutlined />}
                onClick={handleAvatarChange}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  zIndex: 1
                }}
              />
            </div>
          </Col>
          <Col flex={1} style={{ marginLeft: 24 }}>
            <Title level={4} style={{ margin: 0 }}>
              {profile?.full_name || user?.username || 'User'}
            </Title>
            <Space size="middle" style={{ marginTop: 4 }}>
              <Text type="secondary">
                <MailOutlined /> {user?.email}
              </Text>
              {profile?.completion_percentage && (
                <Text type="secondary">
                  Profile: {profile.completion_percentage}%
                </Text>
              )}
            </Space>
          </Col>
          <Col>
            {!editing ? (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
            ) : (
              <Space>
                <Button onClick={() => {
                  setEditing(false)
                  form.resetFields()
                }}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={() => form.submit()}
                  loading={saving}
                >
                  Save
                </Button>
              </Space>
            )}
          </Col>
        </Row>

        <Divider />

        {/* Profile Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          disabled={!editing}
        >
          <Row gutter={24}>
            {/* Full Name */}
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text strong>Full Name</Text>}
                name="full_name"
                rules={[{ required: true, message: 'Please enter your full name' }]}
              >
                <Input
                  size="large"
                  placeholder="Your Full Name"
                  prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                />
              </Form.Item>
            </Col>

            {/* Nick Name */}
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text strong>Nick Name</Text>}
                name="nickname"
              >
                <Input
                  size="large"
                  placeholder="Your First Name"
                  prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                />
              </Form.Item>
            </Col>

            {/* Gender */}
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text strong>Gender</Text>}
                name="gender"
              >
                <Select
                  size="large"
                  placeholder="Your First Name"
                  suffixIcon={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                >
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Country */}
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text strong>Country</Text>}
                name="country"
              >
                <Select
                  size="large"
                  placeholder="Your First Name"
                  showSearch
                  suffixIcon={<GlobalOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                >
                  <Option value="Vietnam">Vietnam</Option>
                  <Option value="USA">United States</Option>
                  <Option value="UK">United Kingdom</Option>
                  <Option value="Japan">Japan</Option>
                  <Option value="China">China</Option>
                  <Option value="Singapore">Singapore</Option>
                  <Option value="Thailand">Thailand</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Language */}
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text strong>Language</Text>}
                name="user_language"
              >
                <Select
                  size="large"
                  placeholder="Your First Name"
                  suffixIcon={<GlobalOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                >
                  <Option value="vi">Tiếng Việt</Option>
                  <Option value="en">English</Option>
                  <Option value="ja">日本語</Option>
                  <Option value="zh">中文</Option>
                  <Option value="ko">한국어</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Time Zone */}
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text strong>Time Zone</Text>}
                name="user_timezone"
              >
                <Select
                  size="large"
                  placeholder="Your First Name"
                  showSearch
                  suffixIcon={<ClockCircleOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                >
                  <Option value="Asia/Ho_Chi_Minh">GMT+7 Ho Chi Minh</Option>
                  <Option value="Asia/Bangkok">GMT+7 Bangkok</Option>
                  <Option value="Asia/Tokyo">GMT+9 Tokyo</Option>
                  <Option value="Asia/Shanghai">GMT+8 Shanghai</Option>
                  <Option value="Asia/Singapore">GMT+8 Singapore</Option>
                  <Option value="America/New_York">GMT-5 New York</Option>
                  <Option value="Europe/London">GMT+0 London</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={5} style={{ marginBottom: 16 }}>My email Address</Title>
          <Card
            style={{
              backgroundColor: '#f5f5f5',
              borderRadius: 8,
              marginBottom: 24
            }}
            bodyStyle={{ padding: '12px 16px' }}
          >
            <Space direction="vertical" size={0} style={{ width: '100%' }}>
              <Space>
                <MailOutlined style={{ color: '#1890ff' }} />
                <Text strong>{user?.email}</Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                1 month ago
              </Text>
            </Space>
          </Card>

          {editing && (
            <div>
              <Button
                type="link"
                style={{ padding: 0, marginBottom: 24 }}
              >
                + Add Email Address
              </Button>

              <Row gutter={24}>
                {/* Phone Number */}
                <Col xs={24} md={12}>
                  <Form.Item
                    label={<Text strong>Phone Number</Text>}
                    name="phone_number"
                  >
                    <Input
                      size="large"
                      placeholder="Your phone number"
                    />
                  </Form.Item>
                </Col>

                {/* Job Title */}
                <Col xs={24} md={12}>
                  <Form.Item
                    label={<Text strong>Job Title</Text>}
                    name="job_title"
                  >
                    <Input
                      size="large"
                      placeholder="Your job title"
                    />
                  </Form.Item>
                </Col>

                {/* Company */}
                <Col xs={24} md={12}>
                  <Form.Item
                    label={<Text strong>Company</Text>}
                    name="company"
                  >
                    <Input
                      size="large"
                      placeholder="Your company"
                    />
                  </Form.Item>
                </Col>

                {/* Bio */}
                <Col xs={24}>
                  <Form.Item
                    label={<Text strong>Bio</Text>}
                    name="bio"
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Tell us about yourself"
                      maxLength={500}
                      showCount
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}
        </Form>
      </Card>
    </div>
  )
}
