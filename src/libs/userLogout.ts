import BACKEND_URL from "@/libs/backendUrl";
import { captureNewAccessToken } from "@/libs/accessTokenEvents";

export default async function userLogout(token?: string) {
  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const res = await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers,
  });

  captureNewAccessToken(res);
  if (!res.ok) {
    throw new Error("Cannot logout user");
  }

  return res.json();
}
