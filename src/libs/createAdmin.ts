import BACKEND_URL from "@/libs/backendUrl";

export interface CreateAdminData {
  username: string;
  email: string;
  password: string;
  role?: "admin" | "super_admin";
}

export default async function createAdmin(token: string, adminData: CreateAdminData) {
  const res = await fetch(`${BACKEND_URL}/api/v1/admins`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(adminData),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "ไม่สามารถสร้างบัญชีแอดมินได้");
  }

  return data;
}
