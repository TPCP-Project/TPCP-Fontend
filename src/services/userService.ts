import { http } from './httpClient'

export type User = { id: string; email: string; name: string }
export async function getMe() {
  const res = await http.get<User>('/me')
  return res.data
}
