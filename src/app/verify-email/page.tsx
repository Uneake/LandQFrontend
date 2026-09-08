"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import verifyEmail from "@/libs/verifyEmail";
import styles from "./verify-email.module.css";

type VerifyState = "loading" | "success" | "error" | "already-verified";

interface UserData {
  username?: string;
  email?: string;
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const id = searchParams.get("id");

    if (!token || !id) {
      setState("error");
      setMessage("Invalid verification link. Missing token or ID.");
      return;
    }

    const runVerification = async () => {
      try {
        const data = await verifyEmail(token, id);

        if (data.success) {
          setState("success");
          setMessage(data.message || "Email verified successfully!");
          setUserData(data.data || null);
        } else {
          if (data.message?.includes("already verified")) {
            setState("already-verified");
          } else {
            setState("error");
          }
          setMessage(data.message || "Verification failed.");
        }
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : "";
        if (errMessage.includes("already verified")) {
          setState("already-verified");
          setMessage(errMessage);
        } else {
          setState("error");
          setMessage(errMessage || "Verification failed. Please check your connection and try again.");
        }
      }
    };

    runVerification();
  }, [searchParams]);

  return (
    <div className={styles.page}>
      {/* Animated background orbs */}
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
      <div className={styles.bgOrb3} />

      <div className={styles.card}>
        {/* Icon */}
        <div
          className={`${styles.iconWrapper} ${state === "loading"
            ? styles.iconLoading
            : state === "success"
              ? styles.iconSuccess
              : state === "already-verified"
                ? styles.iconAlready
                : styles.iconError
            }`}
        >
          {state === "loading" && (
            <svg
              className={styles.spinner}
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="25"
                cy="25"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="90 60"
              />
            </svg>
          )}
          {state === "success" && (
            <svg
              className={styles.checkmark}
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="26"
                cy="26"
                r="24"
                stroke="currentColor"
                strokeWidth="3"
                className={styles.checkCircle}
              />
              <path
                d="M14 27l8 8 16-16"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.checkPath}
              />
            </svg>
          )}
          {state === "already-verified" && (
            <svg
              className={styles.infoIcon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 8v4m0 4h.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
          {state === "error" && (
            <svg
              className={styles.errorIcon}
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="26"
                cy="26"
                r="24"
                stroke="currentColor"
                strokeWidth="3"
                className={styles.errorCircle}
              />
              <path
                d="M18 18l16 16M34 18l-16 16"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                className={styles.errorX}
              />
            </svg>
          )}
        </div>

        {/* Title */}
        <h1 className={styles.title}>
          {state === "loading" && "Verifying Your Email"}
          {state === "success" && "Email Verified!"}
          {state === "already-verified" && "Already Verified"}
          {state === "error" && "Verification Failed"}
        </h1>

        {/* Message */}
        <p className={styles.message}>{message || "Please wait while we verify your email address..."}</p>

        {/* User info badge on success */}
        {state === "success" && userData && (
          <div className={styles.userBadge}>
            <div className={styles.avatar}>
              {(userData.username || userData.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              {userData.username && (
                <span className={styles.username}>{userData.username}</span>
              )}
              {userData.email && (
                <span className={styles.email}>{userData.email}</span>
              )}
            </div>
          </div>
        )}

        {/* Action button */}
        {state !== "loading" && (
          <a href="/login" className={styles.ctaButton}>
            <span>
              {state === "success"
                ? "Continue to Login"
                : state === "already-verified"
                  ? "Go to Login"
                  : "Back to Home"}
            </span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        )}

        {/* Subtle loading bar */}
        {state === "loading" && <div className={styles.loadingBar} />}
      </div>

      {/* Footer */}
      <p className={styles.footer}>
        © {new Date().getFullYear()} LandQ · Secure Email Verification
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <div className={styles.bgOrb1} />
          <div className={styles.bgOrb2} />
          <div className={styles.bgOrb3} />
          <div className={styles.card}>
            <div className={`${styles.iconWrapper} ${styles.iconLoading}`}>
              <svg
                className={styles.spinner}
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="90 60"
                />
              </svg>
            </div>
            <h1 className={styles.title}>Verifying Your Email</h1>
            <p className={styles.message}>Please wait while we verify your email address...</p>
            <div className={styles.loadingBar} />
          </div>
          <p className={styles.footer}>© {new Date().getFullYear()} LandQ · Secure Email Verification</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
