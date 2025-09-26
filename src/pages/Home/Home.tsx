import React, { ReactNode, useEffect, useState } from 'react'
import { Button, Typography, Row, Col, Card } from 'antd'
import { Link } from 'react-router-dom'
import {
  CheckCircleFilled,
  PlayCircleOutlined,
  RocketOutlined,
  PhoneOutlined,
  StarFilled,
} from '@ant-design/icons'
import styles from './Home.module.css'
interface CheckItemProps {
  children: ReactNode // ReactNode cho phép chứa text, component, v.v.
  delay?: number // Dấu ? nghĩa là prop này không bắt buộc
}
const { Title, Paragraph } = Typography

// Enhanced Check Item Component
// eslint-disable-next-line react/prop-types
function CheckItem({ children, delay = 0 }: CheckItemProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <li className={`${styles.checkItem} ${visible ? styles.visible : ''}`}>
      <CheckCircleFilled className={styles.checkIcon} />
      <span>{children}</span>
    </li>
  )
}

// Enhanced Industry Card Component
function IndustryCard({
  icon,
  label,
  description,
  delay = 0,
}: {
  icon: ReactNode
  label: string
  description: string
  delay?: number
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <Card
      className={`${styles.industryCard} ${visible ? styles.visible : ''}`}
      hoverable
      bordered={false}
    >
      <div className={styles.industryIcon}>{icon}</div>
      <Title level={4} className={styles.industryLabel}>
        {label}
      </Title>
      <Paragraph className={styles.industryDescription}>{description}</Paragraph>
    </Card>
  )
}

// Statistics Component
function StatCard({
  number,
  label,
  suffix = '',
  delay = 0,
}: {
  number: string
  label: string
  suffix?: string
  delay?: number
}) {
  const [visible, setVisible] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (visible) {
      const target = parseInt(number)
      const duration = 2000
      const increment = target / (duration / 16)
      let current = 0

      const counter = setInterval(() => {
        current += increment
        if (current >= target) {
          setCount(target)
          clearInterval(counter)
        } else {
          setCount(Math.floor(current))
        }
      }, 16)

      return () => clearInterval(counter)
    }
  }, [visible, number])

  return (
    <div className={`${styles.statCard} ${visible ? styles.visible : ''}`}>
      <Title level={2} className={styles.statNumber}>
        {count}
        {suffix}
      </Title>
      <Paragraph className={styles.statLabel}>{label}</Paragraph>
    </div>
  )
}

export default function Home() {
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    setHeroVisible(true)
  }, [])

  const industries = [
    {
      icon: <IconCosmetic />,
      label: 'Mỹ phẩm',
      description: 'Tăng 65% tỷ lệ chốt đơn với tư vấn AI',
    },
    {
      icon: <IconDental />,
      label: 'Nha khoa',
      description: 'Tự động đặt lịch và chăm sóc khách hàng',
    },
    {
      icon: <IconRestaurant />,
      label: 'Nhà hàng',
      description: 'Nhận order và tư vấn menu thông minh',
    },
    {
      icon: <IconCourse />,
      label: 'Khóa học',
      description: 'Hỗ trợ học viên 24/7, tăng retention',
    },
    {
      icon: <IconFashion />,
      label: 'Thời trang',
      description: 'Tư vấn phong cách cá nhân hóa',
    },
    {
      icon: <IconPrint />,
      label: 'In ấn',
      description: 'Tư vấn thiết kế và báo giá tự động',
    },
  ]

  return (
    <div className={styles.page}>
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={`${styles.heroLeft} ${heroVisible ? styles.visible : ''}`}>
            <Title level={1} className={styles.heroTitle}>
              Tăng <span>50%</span> tỷ lệ chốt sales khi dùng <span>AI Chatbot</span>
            </Title>

            <ul className={styles.checklist}>
              <CheckItem delay={200}>
                Tăng <strong>75%</strong> tỷ lệ khách hàng phản hồi trong <strong>10s</strong> đầu
                cuộc hội thoại
              </CheckItem>
              <CheckItem delay={400}>
                Tăng <strong>50%</strong> tỷ lệ chốt đơn nhờ các tính năng đặc biệt
              </CheckItem>
              <CheckItem delay={600}>
                AI Chatbot trả lời tự nhiên như <strong>người thật</strong>
              </CheckItem>
            </ul>

            <div className={styles.ctaRow}>
              <Button
                type="primary"
                size="large"
                className={styles.primaryBtn}
                icon={<RocketOutlined />}
                onClick={() => (window.location.href = '/signup')}
              >
                Dùng thử ngay - Miễn phí
              </Button>
              <Link to="/contact">
                <Button size="large" className={styles.secondaryBtn} icon={<PhoneOutlined />}>
                  Liên hệ sales
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className={styles.trustBadges}>
              <div className={styles.trustItem}>
                <StarFilled /> <StarFilled /> <StarFilled /> <StarFilled /> <StarFilled />
                <span>4.9/5 từ 1000+ khách hàng</span>
              </div>
            </div>
          </div>

          <div className={`${styles.heroRight} ${heroVisible ? styles.visible : ''}`}>
            <div className={styles.videoContainer}>
              <video
                className={styles.video}
                src="/hero.mp4"
                controls
                poster="/src/assets/images/banner.jpg"
                preload="metadata"
              />
              <div className={styles.playOverlay}>
                <PlayCircleOutlined className={styles.playIcon} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section className={styles.statistics}>
        <div className={styles.statisticsInner}>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={12} md={6}>
              <StatCard number="50" suffix="%" label="Tăng tỷ lệ chốt" delay={100} />
            </Col>
            <Col xs={12} md={6}>
              <StatCard number="75" suffix="%" label="Phản hồi nhanh hơn" delay={200} />
            </Col>
            <Col xs={12} md={6}>
              <StatCard number="24" suffix="/7" label="Hỗ trợ liên tục" delay={300} />
            </Col>
            <Col xs={12} md={6}>
              <StatCard number="1000" suffix="+" label="Khách hàng tin dùng" delay={400} />
            </Col>
          </Row>
        </div>
      </section>

      {/* INDUSTRIES SECTION */}
      <section className={styles.industries}>
        <div className={styles.industriesInner}>
          <div className={styles.sectionHead}>
            <Title level={2}>Các ngành đã ứng dụng AI Chatbot hiệu quả</Title>
            <Paragraph>
              Case study các ngành đã tăng hơn <strong>50% doanh thu</strong> với chatbot thông
              minh.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {industries.map((industry, index) => (
              <Col key={index} xs={24} sm={12} lg={8} xl={8}>
                <IndustryCard
                  icon={industry.icon}
                  label={industry.label}
                  description={industry.description}
                  delay={index * 100}
                />
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* CALL TO ACTION SECTION */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaInner}>
          <Title level={2} className={styles.finalCtaTitle}>
            Sẵn sàng tăng doanh thu với AI Chatbot?
          </Title>
          <Paragraph className={styles.finalCtaText}>
            Hàng nghìn doanh nghiệp đã tin dùng. Bắt đầu miễn phí ngay hôm nay!
          </Paragraph>
          <div className={styles.finalCtaButtons}>
            <Button
              type="primary"
              size="large"
              className={styles.primaryBtn}
              icon={<RocketOutlined />}
            >
              Dùng thử 14 ngày miễn phí
            </Button>
            <Button size="large" className={styles.secondaryBtn} icon={<PhoneOutlined />}>
              Xem demo trực tiếp
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ====== Enhanced SVG Icons với animations ====== */
function IconCosmetic() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" className={styles.svgIcon}>
      <defs>
        <linearGradient id="cosmetic-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff6b9d" />
          <stop offset="100%" stopColor="#c44569" />
        </linearGradient>
      </defs>
      <path
        d="M7 3h3v8H7zM5 11h7v10H5zM15 3h4l-1 6h-2zM14 9h6v12h-6z"
        fill="none"
        stroke="url(#cosmetic-gradient)"
        strokeWidth="2"
      />
      <circle cx="8.5" cy="15" r="1" fill="url(#cosmetic-gradient)" />
      <circle cx="17" cy="15" r="1" fill="url(#cosmetic-gradient)" />
    </svg>
  )
}

function IconDental() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" className={styles.svgIcon}>
      <defs>
        <linearGradient id="dental-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4facfe" />
          <stop offset="100%" stopColor="#00f2fe" />
        </linearGradient>
      </defs>
      <path
        d="M7 3c3 0 3 3 5 3s2-3 5-3c3 0 4 3 4 6 0 8-3 12-5 12-2 0-2-5-4-5s-2 5-4 5C6 21 3 17 3 9c0-3 1-6 4-6z"
        fill="none"
        stroke="url(#dental-gradient)"
        strokeWidth="2"
      />
      <circle cx="12" cy="8" r="1" fill="url(#dental-gradient)" />
    </svg>
  )
}

function IconRestaurant() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" className={styles.svgIcon}>
      <defs>
        <linearGradient id="restaurant-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f093fb" />
          <stop offset="100%" stopColor="#f5576c" />
        </linearGradient>
      </defs>
      <path
        d="M4 3v9M8 3v9M6 3v9M12 3h3v8a3 3 0 0 1-3 3zM16 14h5v7h-5z"
        fill="none"
        stroke="url(#restaurant-gradient)"
        strokeWidth="2"
      />
    </svg>
  )
}

function IconCourse() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" className={styles.svgIcon}>
      <defs>
        <linearGradient id="course-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a8edea" />
          <stop offset="100%" stopColor="#fed6e3" />
        </linearGradient>
      </defs>
      <path
        d="M3 7l9-4 9 4-9 4zM6 10v6l6 3 6-3v-6"
        fill="none"
        stroke="url(#course-gradient)"
        strokeWidth="2"
      />
      <circle cx="12" cy="7" r="1" fill="url(#course-gradient)" />
    </svg>
  )
}

function IconFashion() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" className={styles.svgIcon}>
      <defs>
        <linearGradient id="fashion-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffecd2" />
          <stop offset="100%" stopColor="#fcb69f" />
        </linearGradient>
      </defs>
      <path
        d="M9 4l3-2 3 2M6 8l6-2 6 2-2 12H8z"
        fill="none"
        stroke="url(#fashion-gradient)"
        strokeWidth="2"
      />
    </svg>
  )
}

function IconPrint() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" className={styles.svgIcon}>
      <defs>
        <linearGradient id="print-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      <path
        d="M7 7V3h10v4M5 9h14a2 2 0 0 1 2 2v5H3v-5a2 2 0 0 1 2-2zM7 16h10v5H7z"
        fill="none"
        stroke="url(#print-gradient)"
        strokeWidth="2"
      />
      <circle cx="7" cy="12" r="1" fill="url(#print-gradient)" />
    </svg>
  )
}
