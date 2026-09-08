import BACKEND_URL from "@/libs/backendUrl";

export interface CreateEmployeeData {
  name: string;
  tel?: string;
}

export default async function createEmployee(
  token: string,
  data: CreateEmployeeData
) {
  const res = await fetch(`${BACKEND_URL}/api/v1/employees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || "ไม่สามารถเพิ่มเจ้าหน้าที่ได้");
  }
  return json;
}
