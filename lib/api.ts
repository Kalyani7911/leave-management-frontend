const BASE = process.env.NEXT_PUBLIC_API_URL;

export type Employee = {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
};

export type LeaveType = {
  id: number;
  name: string;
  yearlyQuota: number;
};

export type Balance = {
  leaveType: string;
  quota: number;
  used: number;
  remaining: number;
};

export type Leave = {
  id: number;
  employeeName: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: string;
};

export type ApplyLeave = {
  employeeId: number;
  leaveTypeId: number;
  fromDate: string;
  toDate: string;
  reason: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.message || "Request failed");
  }
  return body as T;
}

export const api = {
  employees: () => request<Employee[]>("/api/employees"),
  leaveTypes: () => request<LeaveType[]>("/api/leave-types"),
  balance: (employeeId: number | string) =>
    request<Balance[]>(`/api/leaves/balance/${employeeId}`),
  myLeaves: (employeeId: number | string) =>
    request<Leave[]>(`/api/leaves/employee/${employeeId}`),
  pending: (managerId: number | string) =>
    request<Leave[]>(`/api/leaves/pending?managerId=${managerId}`),
  apply: (data: ApplyLeave) =>
    request<Leave>("/api/leaves", { method: "POST", body: JSON.stringify(data) }),
  approve: (id: number) => request<Leave>(`/api/leaves/${id}/approve`, { method: "PUT" }),
  reject: (id: number) => request<Leave>(`/api/leaves/${id}/reject`, { method: "PUT" }),
};