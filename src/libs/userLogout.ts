const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default async function userLogout(token?: string) {
  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const res = await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    throw new Error("Cannot logout user");
  }

  return res.json();
}
