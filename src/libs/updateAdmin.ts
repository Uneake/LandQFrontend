import BACKEND_URL from "@/libs/backendUrl";

export interface UpdateAdminData {
  username?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  role?: "admin" | "super_admin";
}

export default async function updateAdmin(
  token: string,
  id: string,
  adminData: UpdateAdminData
) {
  const res = await fetch(`${BACKEND_URL}/api/v1/admins/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(adminData),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "ไม่สามารถอัปเดตข้อมูลผู้ดูแลระบบได้");
  }

  return data;
}
