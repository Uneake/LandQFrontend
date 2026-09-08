const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default async function deleteEmployee(token: string, id: string) {
  const res = await fetch(`${BACKEND_URL}/api/v1/employees/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || "ไม่สามารถลบเจ้าหน้าที่ได้");
  }
  return json;
}
