/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Select, DatePicker, message, Spin } from 'antd'
import dayjs from 'dayjs'
import { taskService } from '../../services/taskService'

const { Option } = Select

interface EditTaskModalProps {
  visible: boolean
  taskId: string
  onClose: () => void
  onUpdated: () => void
}

export default function EditTaskModal({
  visible,
  taskId,
  onClose,
  onUpdated,
}: EditTaskModalProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Lấy thông tin chi tiết Task để fill vào form
  useEffect(() => {
    if (!visible || !taskId) return
    const fetchDetail = async () => {
      setLoading(true)
      try {
        const res = await taskService.getTaskById(taskId)
        const taskData = res?.task || res

        form.setFieldsValue({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          dueDate: taskData.dueDate ? dayjs(taskData.dueDate) : null, // ✅ hiển thị ngày
        })
      } catch (err) {
        console.error('Lỗi tải task:', err)
        message.error('Không thể tải thông tin công việc!')
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [visible, taskId])

  // Xử lý cập nhật task
  async function handleSubmit(values: any) {
    if (!taskId) {
      message.error('Thiếu ID công việc!')
      return
    }

    const payload = {
      ...values,
      // Convert dayjs → ISO string để backend đọc được
      dueDate: values.dueDate ? values.dueDate.toISOString() : null,
    }

    try {
      setSubmitting(true)
      await taskService.updateTask(taskId, payload)
      message.success('Cập nhật công việc thành công!')
      onUpdated() // gọi callback để reload lại TaskDetail
    } catch (err) {
      console.error('Lỗi cập nhật công việc:', err)
      message.error('Không thể cập nhật công việc!')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Chỉnh sửa công việc"
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()} 
      okText="Lưu thay đổi"
      cancelText="Hủy"
      confirmLoading={submitting}
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit} 
        >
          <Form.Item
            name="title"
            label="Tên công việc"
            rules={[{ required: true, message: 'Vui lòng nhập tên công việc!' }]}
          >
            <Input placeholder="Nhập tên công việc" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Nhập mô tả" />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Option value="In_Progress">Đang làm</Option>
              <Option value="Blocked">Bị chặn</Option>
              <Option value="Done">Hoàn thành</Option>
            </Select>
          </Form.Item>

          {/* Thêm thời gian hoàn thành */}
          <Form.Item name="dueDate" label="Thời hạn hoàn thành">
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Chọn thời gian hoàn thành"
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  )
}
