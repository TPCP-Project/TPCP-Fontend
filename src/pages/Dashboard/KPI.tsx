/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Card, Button, Table, Progress, Tag, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useAuth } from "@/context/AuthContext";
import { getKpis, Kpi } from "@/services/kpiService";

const KpiPage: React.FC = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Gọi API lấy danh sách KPI
  const fetchKpis = async () => {
    setLoading(true);
    try {
      const data = await getKpis();

      const formatted = data.map((item) => {
        const totalTarget = item.goals?.reduce((sum, g) => sum + g.target, 0) || 0;
        const totalActual = item.goals?.reduce((sum, g) => sum + (g.actual || 0), 0) || 0;
        const avgProgress =
          item.goals?.length
            ? Math.round(
                item.goals.reduce((sum, g) => sum + (g.progress || 0), 0) /
                  item.goals.length
              )
            : 0;

        return {
          key: item._id,
          employee: item.employeeId?.name ?? "—",
          month: item.month,
          target: totalTarget.toLocaleString(),
          completed: totalActual.toLocaleString(),
          progress: avgProgress,
          status: item.status,
        };
      });

      newFunction(setKpis, formatted);
    } catch (err: any) {
      console.error(
        "❌ KPI fetch error:",
        err.response?.status,
        err.response?.data || err.message
      );
      message.error("Không thể tải KPI từ server!");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Lấy dữ liệu khi component mount
  useEffect(() => {
    fetchKpis();
  }, []);

  // 🧩 Cấu hình cột hiển thị bảng
  const columns = [
    { title: "Nhân viên", dataIndex: "employee", key: "employee" },
    { title: "Tháng", dataIndex: "month", key: "month" },
    {
      title: "Mục tiêu",
      dataIndex: "target",
      key: "target",
      render: (v: string) => <span>{v} ₫</span>,
    },
    {
      title: "Hoàn thành",
      dataIndex: "completed",
      key: "completed",
      render: (v: string) => <span>{v} ₫</span>,
    },
    {
      title: "Tiến độ",
      dataIndex: "progress",
      key: "progress",
      render: (v: number) => <Progress percent={v} size="small" />,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "Completed"
              ? "green"
              : status === "InProgress"
              ? "blue"
              : "default"
          }
        >
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <Card
      title="Quản lý KPI"
      extra={
        user?.role === "manager" && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => message.info("Tính năng tạo KPI sắp ra mắt 🚀")}
          >
            Tạo KPI mới
          </Button>
        )
      }
    >
      <Table
        columns={columns}
        dataSource={kpis}
        loading={loading}
        pagination={{ pageSize: 6 }}
        bordered
      />
    </Card>
  );
};

export default KpiPage;
function newFunction(setKpis: React.Dispatch<React.SetStateAction<Kpi[]>>, formatted: { key: string | undefined; employee: string; month: string; target: string; completed: string; progress: number; status: "Pending" | "InProgress" | "Completed"; }[]) {
  setKpis(formatted);
}

