import BACKEND_URL from "@/libs/backendUrl";

/**
 * Super-admin: revoke ALL refresh tokens of a target admin,
 * effectively forcing them out of every device/session.
 */
export default async function logoutAllSessions(
  token: string,
  adminId?: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${BACKEND_URL}/api/v1/auth/logout-all`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(adminId ? { adminId } : {}),
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "ไม่สามารถยกเลิก session ของผู้ใช้ได้");
  }

  return data;
}
