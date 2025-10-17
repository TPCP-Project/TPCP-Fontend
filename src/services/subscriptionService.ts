import { http } from './httpClient'

export interface SubscriptionStatus {
  hasSubscription: boolean
  customerId?: string
  subscriptionPlan: string | null
  subscriptionStatus: string | null
  subscriptionExpiresAt?: string
  businessName?: string
  isActive?: boolean
  daysRemaining?: number
}

export interface CreatePaymentResponse {
  paymentUrl: string
  orderId: string
  amount: number
  message?: string
}

export interface PaymentHistory {
  customerId: string
  subscriptionPlan: string
  subscriptionStatus: string
  subscriptionExpiresAt: string
  paymentInfo: {
    orderId: string
    transactionNo: string
    amount: number
    payDate: string
    paymentMethod: string
  }
  createdAt: string
}

export async function createPayment(customerInfo?: {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
}): Promise<CreatePaymentResponse> {
  const res = await http.post('/api/subscription/create-payment', {
    customerInfo: customerInfo || {},
    returnUrl: `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/subscription/payment-return`,
  })
  return res.data.data as CreatePaymentResponse
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const res = await http.get('/api/subscription/status')
  return res.data.data as SubscriptionStatus
}

export async function getPaymentHistory(): Promise<PaymentHistory> {
  const res = await http.get('/api/subscription/payment-history')
  return res.data.data as PaymentHistory
}

export async function renewSubscription(): Promise<CreatePaymentResponse> {
  const res = await http.post('/api/subscription/renew')
  return res.data.data as CreatePaymentResponse
}

export async function cancelSubscription(): Promise<void> {
  await http.post('/api/subscription/cancel')
}

/**
 * Mock payment success - CHỈ DÙNG TRONG DEVELOPMENT
 * Tự động tạo Customer với subscription Pro
 */
export async function mockPaymentSuccess(): Promise<void> {
  await http.get('/api/subscription/mock-payment-success')
}


