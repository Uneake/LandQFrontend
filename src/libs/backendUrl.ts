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

const BACKEND_URL = configuredBackendUrl || "http://localhost:5000";

export default BACKEND_URL;
