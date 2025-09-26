// src/routes/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom'

// Public pages with Header/Footer
import Home from '@/pages/Home'
import About from '@/pages/About'
import Pricing from '@/pages/Pricing'
import Contact from '@/pages/Contact'
import NotFound from '@/pages/NotFound'

// Auth pages (no layout)
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import VerifySignup from '@/pages/VerifySignup'

// Dashboard Layout & Pages
import DashboardLayout from '@/components/common/Layout/DashboardLayout'
import Overview from '@/pages/Dashboard/Overview/Overview'
import Projects from '@/pages/Dashboard/Projects'
import Tasks from '@/pages/Dashboard/Tasks'
import Team from '@/pages/Dashboard/Team'
import Chat from '@/pages/Dashboard/Chat'
import KPI from '@/pages/Dashboard/KPI'
import AI from '@/pages/Dashboard/AI'

// Layout Components
import Layout from '@/components/common/Layout'
import PublicRoute from './PublicRoute'
import PrivateRoute from './PrivateRoute'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes WITH Layout (Header/Footer) */}
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route
        path="/about"
        element={
          <Layout>
            <About />
          </Layout>
        }
      />
      <Route
        path="/pricing"
        element={
          <Layout>
            <Pricing />
          </Layout>
        }
      />
      <Route
        path="/contact"
        element={
          <Layout>
            <Contact />
          </Layout>
        }
      />

      {/* Auth routes WITHOUT Layout */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-signup" element={<VerifySignup />} />
      </Route>

      {/* Dashboard routes with DashboardLayout */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="team" element={<Team />} />
          <Route path="chat" element={<Chat />} />
          <Route path="kpi" element={<KPI />} />
          <Route path="ai" element={<AI />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
