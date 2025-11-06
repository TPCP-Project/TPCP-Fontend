import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Drawer, Menu } from 'antd'
import { MenuOutlined, UserOutlined, LoginOutlined } from '@ant-design/icons'
import styles from './Header.module.css'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { key: '/', label: 'Trang chủ', path: '/' },
    { key: '/about', label: 'Hướng dẫn', path: '/about' },
    { key: '/features', label: 'Tính năng', path: '/features' },
    { key: '/pricing', label: 'Báo giá', path: '/pricing' },
    { key: '/contact', label: 'Liên hệ', path: '/contact' },
  ]

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev)

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <nav className={styles.nav}>
          {/* Logo */}
          <Link to="/" className={styles.logoLink}>
            <span className={styles.logo}>AI Chatbot</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className={styles.navLinks}>
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className={`${styles.navLink} ${
                  location.pathname === item.path ? styles.active : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className={styles.navActions}>
            <Button
              className={styles.loginBtn}
              icon={<LoginOutlined />}
              size="large"
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </Button>
            <Button
              type="primary"
              className={styles.signupBtn}
              icon={<UserOutlined />}
              size="large"
              onClick={() => navigate('/register')}
            >
              Dùng thử ngay
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            className={styles.mobileMenuBtn}
            icon={<MenuOutlined />}
            type="text"
            onClick={toggleMobileMenu}
          />
        </nav>
      </header>

      {/* Mobile Drawer Menu */}
      <Drawer
        title={
          <img src="/src/assets/images/logo.png" alt="AI Chatbot" style={{ height: '32px' }} />
        }
        placement="right"
        onClose={toggleMobileMenu}
        open={mobileMenuOpen}
        className={styles.mobileDrawer}
        width={300}
      >
        <Menu mode="vertical" selectedKeys={[location.pathname]} className={styles.mobileMenu}>
          {navItems.map((item) => (
            <Menu.Item key={item.path}>
              <Link to={item.path} onClick={toggleMobileMenu}>
                {item.label}
              </Link>
            </Menu.Item>
          ))}
        </Menu>

        <Button
          block
          size="large"
          icon={<LoginOutlined />}
          className={styles.mobileLoginBtn}
          onClick={() => {
            toggleMobileMenu()
            navigate('/login')
          }}
        >
          Đăng nhập
        </Button>

        <Button
          block
          type="primary"
          size="large"
          icon={<UserOutlined />}
          className={styles.mobileSignupBtn}
          onClick={() => {
            toggleMobileMenu()
            navigate('/register')
          }}
        >
          Đăng ký
        </Button>
      </Drawer>
    </>
  )
}
