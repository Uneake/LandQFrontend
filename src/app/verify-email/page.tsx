"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import verifyEmail from "@/libs/verifyEmail";

type VerifyState = "loading" | "success" | "error" | "already-verified";

interface UserData {
  username?: string;
  email?: string;
  id?: string;
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
      setMessage("Official link invalid. Missing required security token or identification number.");
      return;
    }

    const runVerification = async () => {
      try {
        const data = await verifyEmail(token, id);

        if (data.success) {
          setState("success");
          setMessage(data.message || "Your email identity has been successfully authenticated and verified.");
          setUserData(data.data || null);
        } else {
          if (data.message?.includes("already verified")) {
            setState("already-verified");
          } else {
            setState("error");
          }
          setMessage(data.message || "Verification failed. Authentication key invalid or expired.");
        }
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : "";
        if (errMessage.includes("already verified")) {
          setState("already-verified");
          setMessage("This account email has already been authenticated.");
        } else {
          setState("error");
          setMessage(errMessage || "Unable to reach verification portal. Please verify system connectivity.");
        }
      }
    };

    runVerification();
  }, [searchParams]);

  /* ---- Derived styling values ---- */
  const emblemBg =
    state === "loading" ? "bg-[#F0EAE1] border-2 border-dashed border-[#C59B27] text-[#5C4033]"
      : state === "success" ? "bg-[#EAF3EC] border-2 border-[#2D6A4F] text-[#2D6A4F]"
        : state === "already-verified" ? "bg-[#FDF6E2] border-2 border-[#C59B27] text-[#8C6D1F]"
          : "bg-[#FDF0ED] border-2 border-[#A73A24] text-[#A73A24]";

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#12241B] via-[#1C3A27] to-[#2B2118] px-4 py-10 overflow-hidden font-sans">

      {/* Background ambient glows */}
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(197,155,39,0.09)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-80px] w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(92,64,51,0.18)_0%,transparent_70%)] pointer-events-none" />

      {/* ====== Card ====== */}
      <div className="relative z-10 w-full max-w-[480px] bg-[#FAF8F5] border border-[#D8CFC4] border-t-4 border-t-[#C59B27] rounded-xl shadow-2xl px-8 py-10 flex flex-col items-center animate-[fadeUp_0.5s_ease_forwards]">

        {/* Official Government Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EFEBE4] border border-[#D5CCC0] rounded-full text-[0.7rem] font-bold tracking-[0.1em] uppercase text-[#5C4033] mb-6">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#C59B27">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
          </svg>
          Official Portal · Identity Verification
        </div>

        {/* Emblem Ring */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 transition-all duration-300 ${emblemBg}`}>
          {state === "loading" && (
            <svg className="w-9 h-9 animate-spin" viewBox="0 0 50 50" fill="none">
              <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="90 60" />
            </svg>
          )}
          {state === "success" && (
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          )}
          {state === "already-verified" && (
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          )}
          {state === "error" && (
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h1 className="font-serif text-2xl font-bold text-[#1C3A27] text-center tracking-tight mb-1">
          {state === "loading" && "Authenticating Identity"}
          {state === "success" && "Verification Complete"}
          {state === "already-verified" && "Account Already Verified"}
          {state === "error" && "Verification Failed"}
        </h1>

        {/* Subtitle */}
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#7A695B] mb-3">
          LandQ Official Management System
        </p>

        {/* Gold divider */}
        <div className="w-14 h-0.5 bg-gradient-to-r from-transparent via-[#C59B27] to-transparent mb-5" />

        {/* Message */}
        <p className="text-sm text-[#4A3E37] text-center leading-relaxed mb-5">
          {message || "Processing credential authentication with central server..."}
        </p>

        {/* Official User Record Box */}
        {state === "success" && userData && (
          <div className="w-full bg-[#F0ECE3] border border-[#DFD7CC] rounded-lg p-4 mb-5 flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6D5C50] font-medium">Official Username</span>
              <span className="text-[#1C3A27] font-bold">{userData.username || "Admin"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6D5C50] font-medium">Registered Email</span>
              <span className="text-[#1C3A27] font-bold">{userData.email || "-"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6D5C50] font-medium">Account Status</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#2D6A4F] text-white text-[0.72rem] font-semibold rounded">
                ✓ Authenticated
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        {state !== "loading" && (
          <a
            href="/login"
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#1C3A27] hover:bg-[#2D5A3F] text-[#FAF8F5] text-sm font-semibold rounded-md border border-[#142C1E] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span>
              {state === "success" || state === "already-verified"
                ? "Proceed to Portal Login"
                : "Return to Main Portal"}
            </span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        )}

        {/* Loading Progress Bar */}
        {state === "loading" && (
          <div className="w-full mt-3 h-1 bg-[#EAE3D9] rounded overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#1C3A27] to-[#C59B27] animate-[loadingSlide_1.5s_ease-in-out_infinite] w-2/5" />
          </div>
        )}
      </div>

      {/* Official Footer */}
      <footer className="relative z-10 mt-8 text-center flex flex-col gap-1">
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[#C59B27]">
          LandQ Government &amp; Public Administration System
        </span>
        <span className="text-[0.72rem] text-[#8A7B70]">
          Confidential &amp; Secured Official Service · All Rights Reserved
        </span>
      </footer>

      {/* Keyframe styles */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes loadingSlide {
          0%   { margin-left: -40%; }
          100% { margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}

/* ---- Suspense fallback ---- */
function LoadingFallback() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#12241B] via-[#1C3A27] to-[#2B2118] px-4 py-10">
      <div className="w-full max-w-[480px] bg-[#FAF8F5] border border-[#D8CFC4] border-t-4 border-t-[#C59B27] rounded-xl shadow-2xl px-8 py-10 flex flex-col items-center">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EFEBE4] border border-[#D5CCC0] rounded-full text-[0.7rem] font-bold tracking-[0.1em] uppercase text-[#5C4033] mb-6">
          Official Portal · Identity Verification
        </div>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5 bg-[#F0EAE1] border-2 border-dashed border-[#C59B27] text-[#5C4033]">
          <svg className="w-9 h-9 animate-spin" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="90 60" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#1C3A27] text-center mb-1">Authenticating Identity</h1>
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#7A695B] mb-3">LandQ Official Management System</p>
        <div className="w-14 h-0.5 bg-gradient-to-r from-transparent via-[#C59B27] to-transparent mb-5" />
        <p className="text-sm text-[#4A3E37] text-center leading-relaxed mb-5">Processing credential authentication with central server...</p>
        <div className="w-full mt-3 h-1 bg-[#EAE3D9] rounded overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#1C3A27] to-[#C59B27] w-2/5" />
        </div>
      </div>
      <footer className="mt-8 text-center flex flex-col gap-1">
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[#C59B27]">LandQ Government &amp; Public Administration System</span>
        <span className="text-[0.72rem] text-[#8A7B70]">Confidential &amp; Secured Official Service · All Rights Reserved</span>
      </footer>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
