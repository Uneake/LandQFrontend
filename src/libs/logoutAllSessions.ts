const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

/**
 * Super-admin: revoke ALL refresh tokens of a target admin,
 * effectively forcing them out of every device/session.
 */
export default async function logoutAllSessions(
  token: string,
  adminId: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${BACKEND_URL}/api/v1/auth/logout-all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "ไม่สามารถยกเลิก session ของผู้ใช้ได้");
  }

  return data;
}
