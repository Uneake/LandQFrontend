import BACKEND_URL from "@/libs/backendUrl";
import { captureNewAccessToken } from "@/libs/accessTokenEvents";

export default async function getUserProfile(token: string) {
  const res = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
    method: "GET",
    credentials: "include",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Cannot get user profile");
  }

  captureNewAccessToken(res);
  return res.json();
}
