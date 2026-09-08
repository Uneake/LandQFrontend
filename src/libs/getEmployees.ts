const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export interface EmployeeData {
  _id: string;
  name: string;
  tel?: string;
}

export interface EmployeesResponse {
  success: boolean;
  count: number;
  data: EmployeeData[];
}

export default async function getEmployees(): Promise<EmployeesResponse> {
  const res = await fetch(`${BACKEND_URL}/api/v1/employees`, {
    method: "GET",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "ไม่สามารถดึงรายชื่อเจ้าหน้าที่ได้");
  }

  return data;
}
