const ACCESS_TOKEN_REFRESHED_EVENT = "landq:access-token-refreshed";

export function captureNewAccessToken(response: Response) {
  const token = response.headers.get("X-New-Access-Token");
  if (token && typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<string>(ACCESS_TOKEN_REFRESHED_EVENT, { detail: token })
    );
  }
}

export function onAccessTokenRefreshed(listener: (token: string) => void) {
  const handler = (event: Event) => {
    const token = (event as CustomEvent<string>).detail;
    if (token) listener(token);
  };

  window.addEventListener(ACCESS_TOKEN_REFRESHED_EVENT, handler);
  return () => window.removeEventListener(ACCESS_TOKEN_REFRESHED_EVENT, handler);
}