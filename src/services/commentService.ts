import { http } from './httpClient'

export const commentService = {
  // 🟢 Lấy bình luận của 1 task
  async getComments(taskId: string) {
    const res = await http.get(`/api/tasks/${taskId}/comments`)
    return res.data.data
  },

  // 🟡 Thêm bình luận mới
  async addComment(taskId: string, content: string) {
    const res = await http.post(`/api/tasks/${taskId}/comments`, { content })
    return res.data.data
  },

  // 🔴 (tùy chọn) Xóa bình luận
  async deleteComment(commentId: string) {
    const res = await http.delete(`/api/comments/${commentId}`)
    return res.data
  }
}
