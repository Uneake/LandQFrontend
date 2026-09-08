const configuredBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

if (process.env.NODE_ENV === "production") {
  if (!configuredBackendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL must be configured in production");
  }
  const isLoopbackUrl = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(
    configuredBackendUrl
  );
  if (!configuredBackendUrl.startsWith("https://") && !isLoopbackUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL must use HTTPS in production");
  }
}

// In both production and development, browser requests use same-origin proxy (Next.js rewrites /api/v1/* → backend)
// so the refresh-token cookie stays first-party and is never blocked across ports or domains on page refresh.
// On server-side (SSR), use configured backend URL or localhost:5000.
const BACKEND_URL =
  typeof window !== "undefined"
    ? "" // same-origin: fetch("/api/v1/...") goes through Next.js rewrite proxy
    : configuredBackendUrl || "http://localhost:5000";

export default BACKEND_URL;

