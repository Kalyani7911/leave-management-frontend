const BASE = process.env.NEXT_PUBLIC_API_URL;
const SESSION_KEY = "leave-session";

export type Session = {
  token: string;
  employeeId: number;
  employeeCode: string;
  name: string;
  role: string;
  department: string;
};

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

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
  yearlyQuota: number | null;
};

export type Balance = {
  leaveType: string;
  quota: number | null;
  used: number;
  remaining: number | null;
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
  const session = getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  const res = await fetch(BASE + path, { ...options, headers });
  const body = await res.json().catch(() => null);

  if (res.status === 401 && path !== "/api/auth/login") {
    clearSession();
    window.location.href = "/login";
    throw new Error("Your session has expired. Please sign in again.");
  }
  if (res.status === 403) {
    throw new Error(body?.message || "You are not allowed to do this.");
  }
  if (!res.ok) {
    throw new Error(body?.message || "Request failed");
  }
  return body as T;
}

export const api = {
  login: (employeeCode: string, password: string) =>
    request<Session>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ employeeCode, password }),
    }),
  employees: () => request<Employee[]>("/api/employees"),
  leaveTypes: () => request<LeaveType[]>("/api/leave-types"),
  balance: (employeeId: number | string) =>
    request<Balance[]>(`/api/leaves/balance/${employeeId}`),
  myLeaves: (employeeId: number | string, year?: number) =>
    request<Leave[]>(
      `/api/leaves/employee/${employeeId}${year ? `?year=${year}` : ""}`
    ),
  pending: (managerId: number | string) =>
    request<Leave[]>(`/api/leaves/pending?managerId=${managerId}`),
  apply: (data: ApplyLeave) =>
    request<Leave>("/api/leaves", { method: "POST", body: JSON.stringify(data) }),
  approve: (id: number) => request<Leave>(`/api/leaves/${id}/approve`, { method: "PUT" }),
  reject: (id: number) => request<Leave>(`/api/leaves/${id}/reject`, { method: "PUT" }),
};