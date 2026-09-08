import BACKEND_URL from "@/libs/backendUrl";

export default async function forgotPassword(email: string) {
  const res = await fetch(`${BACKEND_URL}/api/v1/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "ไม่สามารถส่งคำขอรีเซ็ตรหัสผ่านได้");
  }
  if (!data.success) {
    throw new Error("ไม่สามารถส่งอีเมลได้ในขณะนี้ กรุณาลองใหม่อีกครั้งภายหลัง");
  }

  return data;
}
