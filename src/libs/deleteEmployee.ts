import BACKEND_URL from "@/libs/backendUrl";
import { captureNewAccessToken } from "@/libs/accessTokenEvents";

export default async function deleteEmployee(token: string, id: string) {
  const res = await fetch(`${BACKEND_URL}/api/v1/employees/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  captureNewAccessToken(res);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || "ไม่สามารถลบเจ้าหน้าที่ได้");
  }
  return json;
}
