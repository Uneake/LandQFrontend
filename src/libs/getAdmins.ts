const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export interface AdminItem {
  _id: string;
  username: string;
  email: string;
  role: "admin" | "super_admin";
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminsResponse {
  success: boolean;
  count: number;
  data: AdminItem[];
}

export default async function getAdmins(token: string): Promise<AdminsResponse> {
  const res = await fetch(`${BACKEND_URL}/api/v1/admins`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "ไม่สามารถดึงรายชื่อแอดมินได้");
  }

  return data;
}
