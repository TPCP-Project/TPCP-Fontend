import React, { useEffect, useState } from 'react'
import { Modal, Select, message, Spin } from 'antd'
import { projectService, ProjectMember } from '../../services/projectService'

const { Option } = Select

interface AssignEmployeeModalProps {
  visible: boolean
  projectId: string
  onClose: () => void
  onAssign: (userId: string) => Promise<void>
}

export default function AssignEmployeeModal({
  visible,
  projectId,
  onClose,
  onAssign,
}: AssignEmployeeModalProps) {
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  // Lấy danh sách thành viên của project
  const fetchMembers = async () => {
    if (!projectId) {
      message.warning('Không có projectId để tải thành viên!')
      return
    }

    setLoading(true)
    try {
      // Service trả mảng ProjectMember[] trực tiếp
      const memberList = await projectService.getProjectMembers(projectId)

      console.log('Members fetched:', memberList)
      setMembers(memberList)
    } catch (err) {
      console.error('Lỗi tải danh sách thành viên:', err)
      message.error('Không thể tải danh sách thành viên!')
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible && projectId) {
      fetchMembers()
    }
  }, [visible, projectId])

  // Khi xác nhận gán nhân viên
  const handleOk = async () => {
    if (!selectedUser) {
      message.warning('Vui lòng chọn nhân viên!')
      return
    }

    setAssigning(true)
    try {
      await onAssign(selectedUser)
      message.success('Đã gán nhân viên thành công!')
      setSelectedUser(null)
      onClose()
    } catch (err) {
      console.error('Gán nhân viên thất bại:', err)
      message.error('Không thể gán nhân viên!')
    } finally {
      setAssigning(false)
    }
  }

  return (
    <Modal
      title="Gán nhân viên cho công việc"
      open={visible}
      onCancel={onClose}
      onOk={handleOk}
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={assigning}
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin />
        </div>
      ) : (
        <Select
          showSearch
          placeholder="Chọn nhân viên trong project"
          style={{ width: '100%' }}
          value={selectedUser || undefined}
          onChange={(v) => setSelectedUser(v)}
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.children as unknown as string)
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {members.length > 0 ? (
            members.map((m) => (
              <Option key={m.user_id._id} value={m.user_id._id}>
                {m.user_id.name} ({m.user_id.email})
              </Option>
            ))
          ) : (
            <Option disabled>Không có thành viên nào trong project</Option>
          )}
        </Select>
      )}
    </Modal>
  )
}
