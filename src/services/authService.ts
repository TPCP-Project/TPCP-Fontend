import { http } from './httpClient'

export type RegisterBody = {
  name: string
  username: string
  email: string
  password: string
  bio?: string
}

export type VerifySignupBody = { email: string; code: string }
export type LoginBody = { email: string; password: string }

export type LoginResponse = {
  success: boolean
  message: string
  data: {
    user: {
      _id: string
      name: string
      username: string
      email: string
      role: 'admin' | 'manager' | 'employee'
      avatar?: {
        url: string
      }
    }
    accessToken: string
  }
}

export async function register(body: RegisterBody) {
  const res = await http.post('/auth/register', body)
  return res.data
}

export async function verifySignup(body: VerifySignupBody) {
  const res = await http.post('/auth/verify-signup', body)
  return res.data
}

export async function login(body: LoginBody) {
  const res = await http.post<LoginResponse>('/auth/login', body)
  return res.data
}