"use client";

import { useState } from "react";
import Link from "next/link";
import forgotPassword from "@/libs/forgotPassword";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("กรุณากรอกอีเมล");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดในการส่งคำขอรีเซ็ตรหัสผ่าน"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EFE6] flex flex-col justify-between font-sans">

      {/* ── Card Section ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#FAF8F5] border border-[#C59B27]/30 rounded-2xl shadow-xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#1C3A27] border-2 border-[#C59B27] flex items-center justify-center mb-4 shadow-inner">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C59B27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#1C3A27] tracking-tight">
              ลืมรหัสผ่าน
            </h2>
            <p className="text-[#7A695B] text-xs mt-1">
              กรอกอีเมลของคุณเพื่อรับลิงก์สำหรับเปลี่ยนรหัสผ่าน
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#EBF5EE] border-2 border-[#2D5A3F] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2D5A3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#1C3A27]">
                ส่งลิงก์เปลี่ยนรหัสผ่านเรียบร้อยแล้ว
              </h3>
              <p className="text-xs text-[#7A695B] leading-relaxed">
                ระบบได้ส่งคำขอรีเซ็ตรหัสผ่านไปยังอีเมล <strong className="text-[#2C2520]">{email}</strong> แล้ว กรุณาตรวจสอบกล่องข้อความหรือโฟลเดอร์อีเมลขยะ (Spam)
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-block w-full py-3 px-4 bg-[#1C3A27] hover:bg-[#2D5A3F] text-white font-bold text-sm rounded-xl transition"
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-[#FDF0ED] border border-[#E8C4BB] rounded-xl text-[#7A3020] text-sm flex items-start gap-3">
                  <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold text-[#4A3E37] uppercase tracking-wider mb-2"
                  >
                    อีเมลที่ลงทะเบียน
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A695B] pointer-events-none">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@landq.com"
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
                      <span>กำลังส่งลิงก์...</span>
                    </>
                  ) : (
                    <>
                      <span>ส่งลิงก์เปลี่ยนรหัสผ่าน</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="text-xs text-[#7A695B] hover:text-[#1C3A27] transition underline"
                  >
                    ยกเลิกและกลับไปหน้าเข้าสู่ระบบ
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="py-6 text-center text-xs text-[#7A695B] border-t border-[#EAE0D4]">
        ระบบตรวจสอบนัดโอนมรดกที่ดิน · LandQ Official Management System © 2026
      </footer>
    </div>
  );
}
