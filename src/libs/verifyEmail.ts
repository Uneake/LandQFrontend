import BACKEND_URL from "@/libs/backendUrl";

export default async function verifyEmail(token: string, id: string) {
  const res = await fetch(
    `${BACKEND_URL}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}&id=${encodeURIComponent(id)}`,
    {
      method: "GET",
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Cannot verify email");
  }

  return res.json();
}
