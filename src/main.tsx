import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import App from './App'

// Ant Design
import 'antd/dist/reset.css'
import { ConfigProvider, theme as antdTheme } from 'antd'

import '@/styles/reset.css'
import '@/styles/variables.css'
import '@/styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#7C3AED',
          borderRadius: 12,
          fontFamily:
            'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
        },
        components: {
          Button: { controlHeight: 44, fontWeight: 600 },
          Input: { controlHeight: 44 },
          Card: { borderRadiusLG: 18 },
        },
      }}
    >
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
)
