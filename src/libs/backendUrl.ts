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

// In production, use same-origin proxy (Next.js rewrites /api/v1/* → backend)
// so the refresh-token cookie stays first-party and isn't blocked by browsers.
// In development, call the backend directly (no cross-site issues on localhost).
const BACKEND_URL =
  typeof window !== "undefined" && process.env.NODE_ENV === "production"
    ? "" // same-origin: fetch("/api/v1/...") goes through Next.js rewrite proxy
    : configuredBackendUrl || "http://localhost:5000";

export default BACKEND_URL;
