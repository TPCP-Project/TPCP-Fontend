// src/App.tsx
import { App as AntdApp } from 'antd'
import AppRoutes from '@/routes/AppRoutes'
import './App.css'

export default function App() {
  return (
    <AntdApp>
      <AppRoutes />
    </AntdApp>
  )
}
