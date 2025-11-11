// src/routes/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom'

// Public pages with Header/Footer
import Home from '@/pages/Home'
import About from '@/pages/About'
import Pricing from '@/pages/Pricing'
import PaymentSuccess from '@/pages/Payment/PaymentSuccess'
import PaymentFailed from '@/pages/Payment/PaymentFailed'
import UploadPage from '@/pages/Dashboard/Upload'
import Payment from '@/pages/Dashboard/Payment'
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
import KanbanView from '@/pages/Dashboard/KanbanView'
import Team from '@/pages/Dashboard/Team'
import Chat from '@/pages/Dashboard/Chat'
import KPI from '@/pages/Dashboard/KPI'
import AI from '@/pages/Dashboard/AI'

// Admin pages
import AdminDashboard from '@/pages/Admin/AdminDashboard'
import UserManagement from '@/pages/Admin/UserManagement'
import PackageManagement from '@/pages/Admin/PackageManagement'
import PurchaseManagement from '@/pages/Admin/PurchaseManagement'

// Project Join page
import JoinProject from '@/pages/JoinProject/JoinProject'

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
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/failed" element={<PaymentFailed />} />
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
          <Route path="kanban" element={<KanbanView />} />
          <Route path="team" element={<Team />} />
          <Route path="chat" element={<Chat />} />
          <Route path="kpi" element={<KPI />} />
          <Route path="ai" element={<AI />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="payment" element={<Payment />} />

          {/* Admin routes */}
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/users" element={<UserManagement />} />
          <Route path="admin/packages" element={<PackageManagement />} />
          <Route path="admin/purchases" element={<PurchaseManagement />} />
        </Route>

        {/* Join project page (outside DashboardLayout for full-page experience) */}
        <Route path="/projects/join" element={<JoinProject />} />

        {/* Pricing page for logged in users */}
        <Route
          path="/pricing"
          element={
            <Layout>
              <Pricing />
            </Layout>
          }
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
