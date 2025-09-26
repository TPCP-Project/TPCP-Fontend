import { http } from '@/services/httpClient'

export function useApi() {
  async function get<T>(url: string, params?: Record<string, unknown>) {
    const res = await http.get<T>(url, { params })
    return res.data
  }
  async function post<T, B = unknown>(url: string, body?: B) {
    const res = await http.post<T>(url, body)
    return res.data
  }
  return { get, post }
}
