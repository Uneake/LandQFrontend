"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import resetPassword from "@/libs/resetPassword";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const id = searchParams.get("id") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token || !id) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#FDF0ED] border-2 border-[#E8C4BB] flex items-center justify-center mb-4 text-[#7A3020]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-[#7A3020]">
          ลิงก์ไม่ถูกต้องหรือไม่สมบูรณ์
        </h3>
        <p className="text-xs text-[#7A695B] mt-2 mb-6">
          กรุณาตรวจสอบลิงก์ที่ได้รับทางอีเมลอีกครั้ง หรือส่งคำขอเปลี่ยนรหัสผ่านใหม่
        </p>
        <Link
          href="/forgot-password"
          className="inline-block py-2.5 px-5 bg-[#1C3A27] text-white text-xs font-bold rounded-xl"
        >
          ขอลิงก์เปลี่ยนรหัสผ่านใหม่
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านยืนยันไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword({ token, id, password });
      setSuccess(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน"
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#EBF5EE] border-2 border-[#2D5A3F] flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2D5A3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[#1C3A27]">
          เปลี่ยนรหัสผ่านสำเร็จแล้ว!
        </h3>
        <p className="text-xs text-[#7A695B]">
          รหัสผ่านของคุณได้รับการอัปเดตเรียบร้อยแล้ว ท่านสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที
        </p>
        <div className="pt-4">
          <Link
            href="/login"
            className="inline-block w-full py-3.5 px-4 bg-[#1C3A27] hover:bg-[#2D5A3F] text-white font-bold text-sm rounded-xl transition"
          >
            เข้าสู่ระบบด้วยรหัสผ่านใหม่
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-4 bg-[#FDF0ED] border border-[#E8C4BB] rounded-xl text-[#7A3020] text-sm flex items-start gap-3">
          <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="password"
          className="block text-xs font-bold text-[#4A3E37] uppercase tracking-wider mb-2"
        >
          รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)
        </label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A695B] pointer-events-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="รหัสผ่านใหม่"
            className="w-full pl-11 pr-11 py-3 bg-white border border-[#D5C9BE] rounded-xl text-[#2C2520] text-sm outline-none placeholder-[#B0A098] focus:border-[#C59B27] focus:ring-2 focus:ring-[#C59B27]/20 transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A695B] hover:text-[#2C2520] transition"
            aria-label="Toggle password visibility"
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs font-bold text-[#4A3E37] uppercase tracking-wider mb-2"
        >
          ยืนยันรหัสผ่านใหม่
        </label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A695B] pointer-events-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="ยืนยันรหัสผ่านใหม่"
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#D5C9BE] rounded-xl text-[#2C2520] text-sm outline-none placeholder-[#B0A098] focus:border-[#C59B27] focus:ring-2 focus:ring-[#C59B27]/20 transition"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-4 bg-[#1C3A27] hover:bg-[#2D5A3F] text-white font-bold text-sm rounded-xl tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>กำลังบันทึกรหัสผ่านใหม่...</span>
          </>
        ) : (
          <>
            <span>ตั้งรหัสผ่านใหม่</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F5EFE6] flex flex-col justify-between font-sans">
      {/* ── Top Header Bar ── */}
      <header className="bg-[#1C3A27] border-b-4 border-[#C59B27] shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition">
            <div className="w-11 h-11 rounded-full bg-[#C59B27]/20 border-2 border-[#C59B27] flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#C59B27">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight tracking-wide">
                ระบบบริหารจัดการที่ดินและโฉนด
              </h1>
              <p className="text-[#C59B27] text-xs font-semibold tracking-widest uppercase">
                LandQ · Official Management System
              </p>
            </div>
          </Link>

          <Link
            href="/login"
            className="text-xs text-[#EAE0D4] hover:text-[#C59B27] transition flex items-center gap-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            เข้าสู่ระบบ
          </Link>
        </div>
      </header>

      {/* ── Main Form Section ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#FAF8F5] border border-[#C59B27]/30 rounded-2xl shadow-xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#1C3A27] border-2 border-[#C59B27] flex items-center justify-center mb-4 shadow-inner">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C59B27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#1C3A27] tracking-tight">
              กำหนดรหัสผ่านใหม่
            </h2>
            <p className="text-[#7A695B] text-xs mt-1">
              สร้างรหัสผ่านใหม่สำหรับเข้าสู่ระบบ LandQ
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-[#C59B27] border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="py-6 text-center text-xs text-[#7A695B] border-t border-[#EAE0D4]">
        ระบบบริหารจัดการที่ดินและโฉนด · LandQ Official Management System © 2026
      </footer>
    </div>
  );
}
