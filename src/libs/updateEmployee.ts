import BACKEND_URL from "@/libs/backendUrl";
import { captureNewAccessToken } from "@/libs/accessTokenEvents";

export interface UpdateEmployeeData {
  name?: string;
  tel?: string;
}

export default async function updateEmployee(
  token: string,
  id: string,
  data: UpdateEmployeeData
) {
  const res = await fetch(`${BACKEND_URL}/api/v1/employees/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  captureNewAccessToken(res);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || "ไม่สามารถแก้ไขข้อมูลเจ้าหน้าที่ได้");
  }
  return json;
}
