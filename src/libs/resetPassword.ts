import BACKEND_URL from "@/libs/backendUrl";

export interface ResetPasswordParams {
  token: string;
  id: string;
  password: string;
}

export default async function resetPassword({
  token,
  id,
  password,
}: ResetPasswordParams) {
  const res = await fetch(`${BACKEND_URL}/api/v1/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, id, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้");
  }

  return data;
}
