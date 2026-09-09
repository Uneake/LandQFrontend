'use client'

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LogOutButton(){
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <button
      onClick={async () => {
        await logout();
        router.push("/login");
      }}
      className="w-full sm:w-56 max-w-full justify-center px-4 py-2.5 bg-[#7A3020] hover:bg-[#8D3826] text-white text-sm font-bold rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span>ออกจากระบบ</span>
    </button>
  )
}