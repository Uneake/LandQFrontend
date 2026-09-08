const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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
