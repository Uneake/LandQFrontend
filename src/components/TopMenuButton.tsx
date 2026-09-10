"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const buttonClass = "w-full sm:w-56 max-w-full justify-center px-4 py-2.5 text-l font-bold rounded-xl transition flex items-center gap-2 shadow-sm";

export default function TopMenuButton() {
  const pathname = usePathname();
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return <p className="w-full sm:w-56 max-w-full text-center text-l text-[#EAE0D4] font-bold">loading...</p>;
  }

  if (pathname == '/dashboard' || pathname == '/login') {
    return (
      <Link
        href="/"
        className={`${buttonClass} bg-[#2D5A3F] hover:bg-[#3E7051] text-[#EAE0D4] hover:text-[#C59B27] border border-[#C59B27]/40`}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        <span>ดูหน้าค้นหา</span>
      </Link>
    )
  }
  if (pathname == '/forgot-password' || pathname == '/reset-password') {
    return (
      <Link
        href="/login"
        className={`${buttonClass} bg-[#2D5A3F] hover:bg-[#3E7051] text-[#EAE0D4] hover:text-[#C59B27] border border-[#C59B27]/40`}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        กลับสู่หน้าเข้าสู่ระบบ
      </Link>
    );
  }
  if (pathname == '/') {
    if (user) {
      return (
        <Link
          href="/dashboard"
          className={`${buttonClass} bg-[#C59B27] hover:bg-[#A8832A] text-white`}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span>แดชบอร์ด</span>
        </Link>
      );
    }
    return (
      <Link
        href="/login"
        className={`${buttonClass} bg-[#2D5A3F] hover:bg-[#3E7051] border border-[#C59B27]/40 text-white`}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#C59B27" strokeWidth="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        <span>เข้าสู่ระบบเจ้าหน้าที่</span>
      </Link>
    );
  }
}