import BACKEND_URL from "@/libs/backendUrl";

export default async function deleteAdmin(token: string, id: string) {
  const res = await fetch(`${BACKEND_URL}/api/v1/admins/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "ไม่สามารถลบบัญชีผู้ดูแลระบบได้");
  }

  return data;
}
