/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from "./httpClient";

// 🧩 Interface cho mục tiêu (Goal)
export interface KpiGoal {
  title: string;
  target: number;
  actual?: number;
  unit: string;
  weight: number;
  progress?: number;
}

// 🧩 Interface cho dữ liệu KPI
export interface Kpi {
  _id?: string;
  employeeId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  month: string;
  goals: KpiGoal[];
  status: "Pending" | "InProgress" | "Completed";
  createdAt?: string;
  updatedAt?: string;
}

// 🧩 Interface cho body tạo KPI
export interface CreateKpiDto {
  employeeId: string;
  month: string;
  goals: KpiGoal[];
}

// 🧩 Interface cho body cập nhật KPI
export interface UpdateKpiDto {
  month?: string;
  status?: "Pending" | "InProgress" | "Completed";
  goals?: KpiGoal[];
}

// 🟢 Lấy danh sách KPI
export const getKpis = async (): Promise<Kpi[]> => {
  try {
    const res = await http.get("/api/kpi"); // backend endpoint: /api/kpi
    console.log("✅ getKpis response:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("❌ getKpis error:", err.response?.status, err.response?.data);
    throw err;
  }
};

// 🔍 Lấy chi tiết KPI
export const getKpiById = async (id: string): Promise<Kpi> => {
  const res = await http.get(`/kpi/${id}`);
  return res.data;
};

// ➕ Tạo KPI mới
export const createKpi = async (
  data: CreateKpiDto
): Promise<{ message: string; kpiId: string }> => {
  const res = await http.post("/kpi", data);
  return res.data;
};

// ✏️ Cập nhật KPI
export const updateKpi = async (
  id: string,
  data: UpdateKpiDto
): Promise<{ message: string; kpiId: string }> => {
  const res = await http.put(`/kpi/${id}`, data);
  return res.data;
};

// ❌ Xóa KPI
export const deleteKpi = async (
  id: string
): Promise<{ message: string }> => {
  const res = await http.delete(`/kpi/${id}`);
  return res.data;
};
