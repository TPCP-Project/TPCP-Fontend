import axios, { AxiosError } from 'axios'

type ApiErrorPayload = { message?: string; error?: string; errors?: unknown }

export function getAxiosErrorMessage(err: unknown): string {
  if (axios.isAxiosError<ApiErrorPayload>(err)) {
    const data = (err as AxiosError<ApiErrorPayload>).response?.data
    return data?.message || data?.error || err.message || 'Có lỗi xảy ra'
  }
  if (err instanceof Error) return err.message
  return 'Có lỗi không xác định'
}
